import { describe, expect, it } from 'vitest';
import { DEFAULT_MAX_LEAD_MS, PlayoutClock } from './playoutClock';
import { dataViewToSignalData } from './utils';

const FS = 100;                 // Hz
const NOMINAL = 1000 / FS;      // 10 ms
const PACKET = 20;              // samples per frame (200 ms of data)
const PACKET_MS = PACKET * NOMINAL;
const STREAM_GAP = 500;         // legacy `streamGap` tile config, ms
const DELAY = 500;              // `streamDelay` tile config / playout delay, ms

interface Delivery {
  /** Wall-clock arrival time of the frame, in ms. */
  arrival: number;
  /** Number of samples in the frame. */
  count: number;
}

interface Result {
  timestamps: number[];
  /** Start timestamp of each re-anchor. */
  discontinuities: number[];
  /** Samples discarded to bound staleness. */
  dropped: number;
  /** Per-frame `arrival - newestTs`: the delay actually applied to the trace. */
  effectiveDelays: number[];
}

function run(deliveries: Delivery[], clock = new PlayoutClock({ fs: FS, delayMs: DELAY })): Result {
  const timestamps: number[] = [];
  const discontinuities: number[] = [];
  const effectiveDelays: number[] = [];
  let dropped = 0;
  for (const { arrival, count } of deliveries) {
    const slice = clock.stamp(count, arrival);
    dropped += slice.dropped;
    if (slice.discontinuity) {
      discontinuities.push(slice.startTs);
    }
    for (let i = 0; i < slice.count; i++) {
      timestamps.push(slice.startTs + i * slice.interval);
    }
    if (slice.count > 0) {
      effectiveDelays.push(arrival - timestamps[timestamps.length - 1]);
    }
  }
  return { timestamps, discontinuities, dropped, effectiveDelays };
}

function deltas(timestamps: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    out.push(timestamps[i] - timestamps[i - 1]);
  }
  return out;
}

/** Evenly spaced, strictly monotonic, and no gap the chart would break on. */
function expectEvenAndMonotonic(timestamps: number[], nominal = NOMINAL, tolerance = 0.05) {
  const d = deltas(timestamps);
  expect(Math.min(...d)).toBeGreaterThan(0);
  expect(Math.max(...d)).toBeLessThanOrEqual(STREAM_GAP);
  expect(Math.max(...d)).toBeLessThanOrEqual(nominal * (1 + tolerance) + 1e-9);
  expect(Math.min(...d)).toBeGreaterThanOrEqual(nominal * (1 - tolerance) - 1e-9);
}

/**
 * Invariant 5: no emitted sample is stamped more than `maxLeadMs` ahead of the
 * live edge, i.e. the effective delay never drops below `delay - maxLead`.
 */
function expectBoundedStaleness(effectiveDelays: number[], lowerBound = DELAY - DEFAULT_MAX_LEAD_MS) {
  expect(Math.min(...effectiveDelays)).toBeGreaterThanOrEqual(lowerBound - 1e-9);
}

/** Evenly paced delivery, one frame per frame-duration (the BLE notify case). */
function steady(startMs: number, frames: number): Delivery[] {
  return Array.from({ length: frames }, (_, i) => ({
    arrival: startMs + (i + 1) * PACKET_MS,
    count: PACKET,
  }));
}

describe('PlayoutClock', () => {
  it('stamps an evenly paced feed at the nominal rate, delayed by the playout delay', () => {
    const { timestamps, discontinuities, dropped, effectiveDelays } = run(steady(0, 25));
    expect(timestamps).toHaveLength(25 * PACKET);
    expect(discontinuities).toHaveLength(0);
    expect(dropped).toBe(0);
    expectEvenAndMonotonic(timestamps);
    // Evenly paced delivery holds the full nominal delay.
    effectiveDelays.forEach((d) => expect(d).toBeCloseTo(DELAY, 6));
  });

  it('absorbs bursty delivery (several frames in one tick) without a gap', () => {
    // Three frames delivered together every 600 ms: the USB read-loop pattern.
    const deliveries: Delivery[] = [];
    for (let burst = 0; burst < 10; burst++) {
      const arrival = (burst + 1) * 3 * PACKET_MS;
      for (let i = 0; i < 3; i++) {
        deliveries.push({ arrival, count: PACKET });
      }
    }
    const { timestamps, discontinuities, dropped, effectiveDelays } = run(deliveries);
    expect(discontinuities).toHaveLength(0);
    expect(dropped).toBe(0);
    expectEvenAndMonotonic(timestamps);
    expectBoundedStaleness(effectiveDelays);

    // The anchor is evaluated per frame against that frame's arrival, so the
    // effective delay is not the nominal 500 ms under bursty delivery: within a
    // 3-frame burst it steps from ~620 ms (oldest frame) to ~230 ms (newest).
    // Pin the settled values so a policy change has to be deliberate.
    const [oldest, , newest] = effectiveDelays.slice(-3);
    expect(oldest).toBeGreaterThan(550);
    expect(oldest).toBeLessThan(700);
    expect(newest).toBeGreaterThan(200);
    expect(newest).toBeLessThan(260);
    // Nothing is ever stamped ahead of its own arrival time.
    effectiveDelays.forEach((d) => expect(d).toBeGreaterThan(0));
  });

  it('absorbs an ~800 ms stall followed by a catch-up burst without a gap', () => {
    const deliveries: Delivery[] = [...steady(0, 10)];  // steady until t = 2000
    // 800 ms stall, then the backlog (4 frames) arrives in one tick at t = 2800.
    for (let i = 0; i < 4; i++) {
      deliveries.push({ arrival: 2800, count: PACKET });
    }
    deliveries.push(...steady(2800, 10));               // steady again

    const { timestamps, discontinuities, dropped, effectiveDelays } = run(deliveries);
    expect(discontinuities).toHaveLength(0);
    expect(dropped).toBe(0);
    expectEvenAndMonotonic(timestamps);
    expectBoundedStaleness(effectiveDelays);
    // The stall is absorbed as extra playout delay, never as a gap.
    expect(Math.max(...effectiveDelays)).toBeLessThan(DELAY + 900);
  });

  it('tracks a producer clock running 0.2% fast', () => {
    const drift = 1.002;
    const deliveries = Array.from({ length: 200 }, (_, i) => ({
      arrival: ((i + 1) * PACKET_MS) / drift,
      count: PACKET,
    }));
    const { timestamps, discontinuities, dropped, effectiveDelays } = run(deliveries);
    expect(discontinuities).toHaveLength(0);
    expect(dropped).toBe(0);
    expectEvenAndMonotonic(timestamps);
    expectBoundedStaleness(effectiveDelays);
    // The slew holds the delay near target rather than drifting away.
    expect(Math.abs(effectiveDelays[effectiveDelays.length - 1] - DELAY)).toBeLessThan(50);
  });

  it('tracks a producer clock running 0.2% slow', () => {
    const drift = 0.998;
    const deliveries = Array.from({ length: 200 }, (_, i) => ({
      arrival: ((i + 1) * PACKET_MS) / drift,
      count: PACKET,
    }));
    const { timestamps, discontinuities, dropped, effectiveDelays } = run(deliveries);
    expect(discontinuities).toHaveLength(0);
    expect(dropped).toBe(0);
    expectEvenAndMonotonic(timestamps);
    expectBoundedStaleness(effectiveDelays);
    expect(Math.abs(effectiveDelays[effectiveDelays.length - 1] - DELAY)).toBeLessThan(50);
  });

  it('re-anchors exactly once on a genuine long stall (data loss)', () => {
    const deliveries = [
      ...steady(0, 10),          // steady until t = 2000
      ...steady(5000, 10),       // 3 s of data lost, feed resumes at t = 5200
    ];
    const { timestamps, discontinuities, dropped, effectiveDelays } = run(deliveries);
    expect(discontinuities).toHaveLength(1);
    expect(dropped).toBe(0);
    expectBoundedStaleness(effectiveDelays);

    const d = deltas(timestamps);
    expect(Math.min(...d)).toBeGreaterThan(0);
    const gaps = d.filter((x) => x > STREAM_GAP);
    expect(gaps).toHaveLength(1);                 // exactly one rendered gap
    expect(gaps[0]).toBeGreaterThan(2000);        // and it reflects the real outage
  });

  it('bounds staleness by dropping a buffered backlog dumped in one tick', () => {
    // Firmware queue holds tens of frames; a 3 s stall then dumps all of them.
    const deliveries: Delivery[] = [...steady(0, 10)];
    for (let i = 0; i < 32; i++) {
      deliveries.push({ arrival: 5000, count: PACKET });
    }
    deliveries.push(...steady(5000, 20));

    const { timestamps, discontinuities, dropped, effectiveDelays } = run(deliveries);
    // Without the bound the backlog would queue 6+ s of future-stamped playout.
    expectBoundedStaleness(effectiveDelays);
    expect(dropped).toBeGreaterThan(0);
    expect(Math.min(...deltas(timestamps))).toBeGreaterThan(0);
    // One break for the outage, one where the dropped backlog resumes.
    expect(discontinuities).toHaveLength(2);
    // Playout recovers towards the normal delay once drop mode releases: the
    // resume anchor is clamped to stay monotonic, and the residue slews off.
    const settled = effectiveDelays[effectiveDelays.length - 1];
    expect(settled).toBeGreaterThan(400);
    expect(settled).toBeLessThanOrEqual(DELAY + 1e-9);
    expect(settled).toBeGreaterThan(effectiveDelays[effectiveDelays.length - 2]);
  });

  it('reports dropped frames instead of emitting them', () => {
    const clock = new PlayoutClock({ fs: FS, delayMs: DELAY });
    clock.stamp(PACKET, 1000);
    let slice = clock.stamp(PACKET, 1000);
    // Keep feeding the same arrival until the lead bound trips.
    for (let i = 0; i < 20 && slice.count > 0; i++) {
      slice = clock.stamp(PACKET, 1000);
    }
    expect(slice.count).toBe(0);
    expect(slice.dropped).toBe(PACKET);
    expect(slice.nextTs).toBe(slice.startTs);
  });

  it('re-anchors once when the slot sampling rate changes mid-session', () => {
    const clock = new PlayoutClock({ fs: FS, delayMs: DELAY });
    const first = run(steady(0, 10), clock);
    expect(first.discontinuities).toHaveLength(0);

    clock.setFs(FS);            // unchanged: must be a no-op
    const same = clock.stamp(PACKET, 2200);
    expect(same.discontinuity).toBe(false);

    clock.setFs(2 * FS);        // 200 Hz: 40 samples per 200 ms frame
    const changed = clock.stamp(2 * PACKET, 2400);
    expect(changed.discontinuity).toBe(true);
    expect(changed.interval).toBeCloseTo(NOMINAL / 2, 9);
    expect(changed.startTs).toBeGreaterThanOrEqual(same.nextTs);

    const after = run(
      Array.from({ length: 10 }, (_, i) => ({ arrival: 2600 + i * PACKET_MS, count: 2 * PACKET })),
      clock,
    );
    expect(after.discontinuities).toHaveLength(0);
    expectEvenAndMonotonic(after.timestamps, NOMINAL / 2);
    expectBoundedStaleness(after.effectiveDelays);
  });

  it('never steps backwards when arrival time jumps backwards', () => {
    const deliveries = [
      ...steady(0, 10),
      { arrival: 500, count: PACKET },   // host clock stepped back 1.5 s
      ...steady(500, 5),
    ];
    const { timestamps } = run(deliveries);
    expect(Math.min(...deltas(timestamps))).toBeGreaterThan(0);
  });

  it('keeps a zero-length frame a no-op', () => {
    const clock = new PlayoutClock({ fs: FS, delayMs: DELAY });
    const first = clock.stamp(PACKET, 1000);
    const empty = clock.stamp(0, 1100);
    expect(empty.count).toBe(0);
    expect(empty.nextTs).toBe(first.nextTs);
    expect(empty.discontinuity).toBe(false);
    expect(clock.stamp(PACKET, 1200).startTs).toBe(first.nextTs);
  });

  it('falls back to a sane rate when the slot reports a non-positive fs', () => {
    const clock = new PlayoutClock({ fs: 0 });
    expect(clock.nominalInterval).toBe(10);   // FALLBACK_FS = 100 Hz
  });
});

/** Build a signal frame: uint16 length, then per sample uint16 mask + i16 channels. */
function buildFrame(samples: number[][], numChs: number): DataView {
  const rowBytes = 2 + numChs * 2;
  const buffer = new ArrayBuffer(2 + samples.length * rowBytes);
  const view = new DataView(buffer);
  view.setUint16(0, samples.length * rowBytes, true);
  let offset = 2;
  for (const row of samples) {
    view.setUint16(offset, 1, true);
    offset += 2;
    for (let ch = 0; ch < numChs; ch++) {
      view.setInt16(offset, row[ch], true);
      offset += 2;
    }
  }
  return view;
}

describe('dataViewToSignalData', () => {
  it('stamps decoded frames from the slot clock, evenly spaced across a burst', () => {
    const clock = new PlayoutClock({ fs: FS, delayMs: DELAY, now: () => 1000 });
    const samples = Array.from({ length: PACKET }, (_, i) => [i - 10]);
    const frame = buildFrame(samples, 1);

    const all: number[][] = [];
    for (let i = 0; i < 3; i++) {
      const rst = dataViewToSignalData(frame, 1, 'i16', clock);
      expect(rst.signals).toHaveLength(PACKET);
      expect(rst.mask).toHaveLength(PACKET);
      expect(rst.discontinuity).toBe(false);
      rst.signals.forEach((row, idx) => {
        expect(row[1]).toBe(samples[idx][0]);
        expect(rst.mask[idx][0]).toBe(row[0]);
      });
      all.push(...rst.signals);
    }
    expectEvenAndMonotonic(all.map((row) => row[0]));
  });

  it('returns nothing for a frame the clock dropped', () => {
    const clock = new PlayoutClock({ fs: FS, delayMs: DELAY, now: () => 1000 });
    const frame = buildFrame(Array.from({ length: PACKET }, () => [1]), 1);
    let rst = dataViewToSignalData(frame, 1, 'i16', clock);
    for (let i = 0; i < 25 && rst.signals.length > 0; i++) {
      rst = dataViewToSignalData(frame, 1, 'i16', clock);
    }
    expect(rst.signals).toHaveLength(0);
    expect(rst.mask).toHaveLength(0);
  });
});
