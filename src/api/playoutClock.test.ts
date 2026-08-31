import { describe, expect, it } from 'vitest';
import { PlayoutClock } from './playoutClock';
import { dataViewToSignalData } from './utils';

const FS = 100;                 // Hz
const NOMINAL = 1000 / FS;      // 10 ms
const PACKET = 20;              // samples per frame (200 ms of data)
const PACKET_MS = PACKET * NOMINAL;
const STREAM_GAP = 500;         // default `streamGap` tile config, ms
const DELAY = 500;              // default `streamDelay` tile config, ms

interface Delivery {
  /** Wall-clock arrival time of the frame, in ms. */
  arrival: number;
  /** Number of samples in the frame. */
  count: number;
}

interface Result {
  timestamps: number[];
  discontinuities: number[];
}

function run(deliveries: Delivery[], clock = new PlayoutClock({ fs: FS, delayMs: DELAY })): Result {
  const timestamps: number[] = [];
  const discontinuities: number[] = [];
  for (const { arrival, count } of deliveries) {
    const slice = clock.stamp(count, arrival);
    if (slice.discontinuity) {
      discontinuities.push(slice.startTs);
    }
    for (let i = 0; i < count; i++) {
      timestamps.push(slice.startTs + i * slice.interval);
    }
  }
  return { timestamps, discontinuities };
}

function deltas(timestamps: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    out.push(timestamps[i] - timestamps[i - 1]);
  }
  return out;
}

function expectEvenAndMonotonic(timestamps: number[], tolerance = 0.05) {
  const d = deltas(timestamps);
  expect(Math.min(...d)).toBeGreaterThan(0);                        // strictly monotonic
  expect(Math.max(...d)).toBeLessThanOrEqual(STREAM_GAP);           // no artificial gap
  expect(Math.max(...d)).toBeLessThanOrEqual(NOMINAL * (1 + tolerance) + 1e-9);
  expect(Math.min(...d)).toBeGreaterThanOrEqual(NOMINAL * (1 - tolerance) - 1e-9);
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
    const { timestamps, discontinuities } = run(steady(0, 25));
    expect(timestamps).toHaveLength(25 * PACKET);
    expect(discontinuities).toHaveLength(0);
    expectEvenAndMonotonic(timestamps);
    // Newest sample sits ~delayMs behind the last arrival.
    const lastArrival = 25 * PACKET_MS;
    expect(lastArrival - timestamps[timestamps.length - 1]).toBeCloseTo(DELAY, 0);
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
    const { timestamps, discontinuities } = run(deliveries);
    expect(discontinuities).toHaveLength(0);
    expectEvenAndMonotonic(timestamps);
  });

  it('absorbs an ~800 ms stall followed by a catch-up burst without a gap', () => {
    const deliveries: Delivery[] = [
      ...steady(0, 10),                       // steady until t = 2000
    ];
    // 800 ms stall, then the backlog (4 frames) arrives in one tick at t = 2800.
    for (let i = 0; i < 4; i++) {
      deliveries.push({ arrival: 2800, count: PACKET });
    }
    deliveries.push(...steady(2800, 10));     // steady again

    const { timestamps, discontinuities } = run(deliveries);
    expect(discontinuities).toHaveLength(0);
    expectEvenAndMonotonic(timestamps);
  });

  it('tracks a producer clock running 0.2% fast', () => {
    const drift = 1.002;
    const deliveries = Array.from({ length: 200 }, (_, i) => ({
      arrival: ((i + 1) * PACKET_MS) / drift,
      count: PACKET,
    }));
    const { timestamps, discontinuities } = run(deliveries);
    expect(discontinuities).toHaveLength(0);
    expectEvenAndMonotonic(timestamps);
    // The slew keeps the playout delay bounded rather than drifting away.
    const lastArrival = deliveries[deliveries.length - 1].arrival;
    const lag = lastArrival - timestamps[timestamps.length - 1];
    expect(Math.abs(lag - DELAY)).toBeLessThan(50);
  });

  it('tracks a producer clock running 0.2% slow', () => {
    const drift = 0.998;
    const deliveries = Array.from({ length: 200 }, (_, i) => ({
      arrival: ((i + 1) * PACKET_MS) / drift,
      count: PACKET,
    }));
    const { timestamps, discontinuities } = run(deliveries);
    expect(discontinuities).toHaveLength(0);
    expectEvenAndMonotonic(timestamps);
    const lastArrival = deliveries[deliveries.length - 1].arrival;
    const lag = lastArrival - timestamps[timestamps.length - 1];
    expect(Math.abs(lag - DELAY)).toBeLessThan(50);
  });

  it('re-anchors exactly once on a genuine long stall (data loss)', () => {
    const deliveries = [
      ...steady(0, 10),          // steady until t = 2000
      ...steady(5000, 10),       // 3 s of data lost, feed resumes at t = 5200
    ];
    const { timestamps, discontinuities } = run(deliveries);
    expect(discontinuities).toHaveLength(1);

    const d = deltas(timestamps);
    expect(Math.min(...d)).toBeGreaterThan(0);
    const gaps = d.filter((x) => x > STREAM_GAP);
    expect(gaps).toHaveLength(1);                 // exactly one rendered gap
    expect(gaps[0]).toBeGreaterThan(2000);        // and it reflects the real outage
  });

  it('re-anchors at most once when a long stall is followed by a buffered backlog', () => {
    const deliveries: Delivery[] = [...steady(0, 10)];
    for (let i = 0; i < 15; i++) {
      deliveries.push({ arrival: 5000, count: PACKET });   // 3 s backlog in one tick
    }
    deliveries.push(...steady(5000, 10));
    const { timestamps, discontinuities } = run(deliveries);
    expect(discontinuities).toHaveLength(1);
    const gaps = deltas(timestamps).filter((x) => x > STREAM_GAP);
    expect(gaps).toHaveLength(1);
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

  it('keeps a zero-length batch a no-op', () => {
    const clock = new PlayoutClock({ fs: FS, delayMs: DELAY });
    const first = clock.stamp(PACKET, 1000);
    const empty = clock.stamp(0, 1100);
    expect(empty.nextTs).toBe(first.nextTs);
    expect(empty.discontinuity).toBe(false);
    expect(clock.stamp(PACKET, 1200).startTs).toBe(first.nextTs);
  });

  it('clamps a non-positive sampling rate instead of producing invalid timestamps', () => {
    const clock = new PlayoutClock({ fs: 0 });
    expect(Number.isFinite(clock.nominalInterval)).toBe(true);
    expect(clock.nominalInterval).toBeGreaterThan(0);
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
});
