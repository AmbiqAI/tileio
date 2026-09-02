// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2026 Ambiq

/**
 * Virtual sample-clock playout.
 *
 * Transports (USB in particular) deliver signal frames in bursts: the firmware
 * batches on a FIFO watermark and the host read loop drains several 256-byte
 * frames in a single tick. Stamping samples from wall-clock arrival time
 * therefore clusters timestamps and, after a late burst, opens a hole larger
 * than the chart `streamGap`, which breaks the rendered line.
 *
 * This module replaces arrival-time stamping with a per-slot virtual clock.
 * Invariants:
 *
 *  1. Sample timestamps advance at exactly `interval = 1000 / fs` ms per
 *     sample, so a frame is always evenly spaced.
 *  2. Timestamps are monotonically increasing. The clock never steps backwards,
 *     including across a re-anchor or a sampling-rate change.
 *  3. The clock is anchored to `arrival - delayMs` (a fixed playout delay) and
 *     corrected towards that anchor only by a bounded slew: the per-frame
 *     interval may deviate from nominal by at most `maxSlew` (default 5%).
 *  4. A discontinuity (hard re-anchor, rendered as a real break) is declared
 *     only when the clock has fallen behind arrival by more than
 *     `delayMs + resyncMarginMs` (1000 ms by default), i.e. a stall clearly
 *     longer than the playout delay. Ordinary burst jitter is absorbed by the
 *     slew and never breaks the line.
 *  5. Bounded staleness: an emitted sample is never stamped further ahead of
 *     the live edge than `maxLeadMs`. A device that dumps a long backlog in one
 *     tick (the firmware queue holds tens of frames) would otherwise play out
 *     minutes-old data as if it were live. Once the projected lead exceeds
 *     `maxLeadMs` the clock enters drop mode: whole frames are discarded until
 *     the wall clock catches up with what has already been emitted, then it
 *     re-anchors with a discontinuity. Worst-case rendered staleness is
 *     therefore `delayMs + maxLeadMs` (2000 ms by default).
 *
 *     Cost: drop mode exits only when the emitted timeline has fully drained
 *     (`next <= liveEdge`), so it also discards the genuinely live frames that
 *     arrive while it drains - up to roughly one queued-lead worth per episode
 *     (~800 ms measured on the 32-frame backlog case). That is deliberate: the
 *     alternative is rendering the backlog as if it were live. The loss is
 *     signalled by the re-anchor discontinuity, so it renders as a real gap.
 *
 * Note on the effective delay: the anchor is evaluated once per frame against
 * that frame's arrival time, so `delayMs` is only achieved exactly for evenly
 * paced delivery (BLE). Under bursty delivery - several frames sharing one
 * arrival timestamp - the newest sample of each frame lands progressively
 * closer to the live edge: with 3-frame bursts of 200 ms it steps from about
 * 620 ms behind arrival (oldest frame) to about 230 ms (newest frame). The
 * trace therefore extends a few hundred ms past the chart's right edge, which
 * is hidden but harmless. Invariant 5 caps how far this can go.
 *
 * The clock is transport agnostic: BLE (evenly paced notifications) and USB
 * (bursty) share this code.
 */

/**
 * Playout delay, in ms: how far behind arrival the newest sample is stamped.
 *
 * The stream tiles' `streamDelay` config (chartjs-plugin-streaming `delay`)
 * must be >= this value or the trace ends short of the chart edge, so their
 * JSON schemas enforce `minimum: 500` to match. Keep the two in step.
 */
export const DEFAULT_PLAYOUT_DELAY_MS = 500;

/** Extra slack, in ms, on top of the playout delay before re-anchoring. */
export const DEFAULT_RESYNC_MARGIN_MS = 500;

/** Max ms of playout that may be queued ahead of the live edge (invariant 5). */
export const DEFAULT_MAX_LEAD_MS = 1500;

/** Maximum fractional deviation of the emitted interval from nominal. */
export const DEFAULT_MAX_SLEW = 0.05;

/** Fraction of the current anchor error corrected on each frame. */
export const DEFAULT_SLEW_GAIN = 0.05;

/** Sampling rate used when a slot reports a non-positive or non-finite `fs`. */
export const FALLBACK_FS = 100;

export interface PlayoutClockOptions {
  /** Sampling rate of the slot, in Hz. Non-positive values fall back to {@link FALLBACK_FS}. */
  fs: number;
  /** Fixed playout delay, in ms. Defaults to {@link DEFAULT_PLAYOUT_DELAY_MS}. */
  delayMs?: number;
  /** Extra slack before a re-anchor. Defaults to {@link DEFAULT_RESYNC_MARGIN_MS}. */
  resyncMarginMs?: number;
  /** Max queued playout ahead of the live edge. Defaults to {@link DEFAULT_MAX_LEAD_MS}. */
  maxLeadMs?: number;
  /** Max fractional interval deviation. Defaults to {@link DEFAULT_MAX_SLEW}. */
  maxSlew?: number;
  /** Anchor-error correction gain per frame. Defaults to {@link DEFAULT_SLEW_GAIN}. */
  slewGain?: number;
  /** Arrival-time source. Defaults to `Date.now`. Injectable for tests. */
  now?: () => number;
}

/** Timestamp assignment for a single frame of samples. */
export interface PlayoutSlice {
  /** Timestamp, in ms, of the first emitted sample. */
  startTs: number;
  /** Spacing, in ms, between consecutive emitted samples. */
  interval: number;
  /** Samples to emit. Zero when the frame was dropped to bound staleness. */
  count: number;
  /** Samples discarded from this frame. Frames are dropped whole, so `0` or all. */
  dropped: number;
  /** Timestamp the next sample would take (`startTs + count * interval`). */
  nextTs: number;
  /** True when the clock re-anchored; the frame must render as a new segment. */
  discontinuity: boolean;
}

function clamp(value: number, lo: number, hi: number): number {
  return value < lo ? lo : value > hi ? hi : value;
}

function intervalForFs(fs: number): number {
  if (!Number.isFinite(fs) || fs <= 0) {
    console.warn(`PlayoutClock: invalid sampling rate ${fs}, falling back to ${FALLBACK_FS} Hz`);
    return 1000 / FALLBACK_FS;
  }
  return 1000 / fs;
}

/**
 * Per-slot virtual sample clock. The only state is the timestamp of the next
 * sample to emit (plus a drop-mode latch); all timing policy lives in
 * {@link PlayoutClock.stamp}.
 */
export class PlayoutClock {
  readonly delayMs: number;
  readonly resyncThresholdMs: number;
  readonly maxLeadMs: number;
  readonly maxSlew: number;
  readonly slewGain: number;

  private readonly nowFn: () => number;
  /** Nominal sample spacing, in ms. Tracks the slot's live `fs`. */
  private interval: number;
  /** Timestamp of the next sample to emit; `undefined` until first anchored. */
  private next?: number;
  /** True while frames are being dropped to bring the lead back inside bounds. */
  private dropping = false;
  /** True when the next frame must re-anchor (set by {@link PlayoutClock.setFs}). */
  private pendingReanchor = false;

  constructor(options: PlayoutClockOptions) {
    this.interval = intervalForFs(options.fs);
    this.delayMs = options.delayMs ?? DEFAULT_PLAYOUT_DELAY_MS;
    this.resyncThresholdMs = this.delayMs + (options.resyncMarginMs ?? DEFAULT_RESYNC_MARGIN_MS);
    this.maxLeadMs = Math.max(options.maxLeadMs ?? DEFAULT_MAX_LEAD_MS, 0);
    this.maxSlew = clamp(options.maxSlew ?? DEFAULT_MAX_SLEW, 0, 0.5);
    this.slewGain = clamp(options.slewGain ?? DEFAULT_SLEW_GAIN, 0, 1);
    this.nowFn = options.now ?? Date.now;
  }

  /** Nominal sample spacing, in ms, for the slot's current sampling rate. */
  get nominalInterval(): number {
    return this.interval;
  }

  /** Timestamp of the next sample to emit, or `undefined` before the first frame. */
  get nextTimestamp(): number | undefined {
    return this.next;
  }

  /**
   * Track a live sampling-rate change (slot configs are editable while
   * connected). A no-op when `fs` is unchanged; otherwise the next frame
   * re-anchors as a discontinuity, still clamped to be monotonic.
   */
  setFs(fs: number): void {
    const interval = intervalForFs(fs);
    if (interval === this.interval) {
      return;
    }
    this.interval = interval;
    this.dropping = false;
    if (this.next !== undefined) {
      this.pendingReanchor = true;
    }
  }

  /** Drop the anchor; the next frame starts a fresh (non-discontinuous) stream. */
  reset(): void {
    this.next = undefined;
    this.dropping = false;
    this.pendingReanchor = false;
  }

  /**
   * Assign timestamps to a frame of `count` samples that arrived at
   * `arrivalMs` (defaults to now).
   *
   * The returned `interval` is strictly positive and within `maxSlew` of
   * nominal, `startTs` is never less than the previous call's `nextTs`, and
   * `count` is `0` when the frame was dropped (invariant 5).
   */
  stamp(count: number, arrivalMs: number = this.nowFn()): PlayoutSlice {
    const nominal = this.interval;

    if (count <= 0) {
      const startTs = this.next ?? arrivalMs - this.delayMs;
      return { startTs, interval: nominal, count: 0, dropped: 0, nextTs: startTs, discontinuity: false };
    }

    // Ideal timestamp for the sample following this frame: the newest sample of
    // the frame sits exactly `delayMs` behind its arrival time.
    const liveEdge = arrivalMs - this.delayMs;
    const targetNext = liveEdge + nominal;

    if (this.next === undefined) {
      return this.anchor(targetNext, count, nominal, false);
    }

    if (this.pendingReanchor) {
      this.pendingReanchor = false;
      return this.anchor(targetNext, count, nominal, true);
    }

    if (this.dropping) {
      // Keep discarding until everything already emitted has been rendered,
      // then restart at the live edge with an honest break in the trace.
      if (this.next > liveEdge) {
        return this.drop(count, nominal);
      }
      this.dropping = false;
      return this.anchor(targetNext, count, nominal, true);
    }

    // Bounded staleness: refuse to queue more than `maxLeadMs` of playout ahead
    // of the live edge (a device dumping a buffered backlog in one tick).
    if (this.next + count * nominal - liveEdge > this.maxLeadMs) {
      this.dropping = true;
      return this.drop(count, nominal);
    }

    // Positive error: the virtual clock lags arrival (we are draining a
    // backlog). Negative error: the clock leads arrival (producer is fast).
    const error = targetNext - (this.next + count * nominal);

    if (error > this.resyncThresholdMs) {
      // Stall clearly longer than the playout delay: re-anchor and let the
      // consumer render a real gap. Re-anchoring only ever moves forward.
      return this.anchor(targetNext, count, nominal, true);
    }

    // Bounded slew: spread a capped fraction of the error across the frame so
    // samples stay evenly spaced and the interval stays within maxSlew of
    // nominal. A clock that leads arrival is never re-anchored backwards
    // (invariant 2); it slews at the maximum negative rate, and the drop path
    // above caps how far the lead can grow.
    const maxCorrection = this.maxSlew * count * nominal;
    const correction = clamp(error * this.slewGain, -maxCorrection, maxCorrection);
    const interval = nominal + correction / count;
    const startTs = this.next;
    this.next = startTs + count * interval;
    return { startTs, interval, count, dropped: 0, nextTs: this.next, discontinuity: false };
  }

  /** Discard a whole frame without advancing the clock. */
  private drop(count: number, nominal: number): PlayoutSlice {
    const startTs = this.next as number;
    return { startTs, interval: nominal, count: 0, dropped: count, nextTs: startTs, discontinuity: false };
  }

  private anchor(targetNext: number, count: number, nominal: number, discontinuity: boolean): PlayoutSlice {
    const desiredStart = targetNext - count * nominal;
    // Never step backwards, even when re-anchoring (invariant 2). Reachable
    // when re-anchoring out of drop mode or after a sampling-rate change.
    const startTs = this.next === undefined ? desiredStart : Math.max(desiredStart, this.next);
    this.next = startTs + count * nominal;
    return { startTs, interval: nominal, count, dropped: 0, nextTs: this.next, discontinuity };
  }
}
