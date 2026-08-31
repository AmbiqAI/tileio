/**
 * Virtual sample-clock playout.
 *
 * Transports (USB in particular) deliver signal frames in bursts: the firmware
 * batches on a FIFO watermark and the host read loop drains several 256-byte
 * frames in a single tick. Stamping samples from wall-clock arrival time
 * therefore clusters timestamps and, after a late burst, opens a hole larger
 * than the chart `streamGap`, which breaks the rendered line.
 *
 * This module replaces arrival-time stamping with a per-slot virtual clock:
 *
 *  1. Sample timestamps advance at exactly `interval = 1000 / fs` ms per
 *     sample, so a batch is always evenly spaced.
 *  2. The clock is anchored to `arrival - delayMs` (a fixed playout delay,
 *     matching the `streamDelay` tile default of 500 ms) and is corrected
 *     towards that anchor only by a bounded slew: the per-batch interval may
 *     deviate from nominal by at most `maxSlew` (default 5%). Timestamps never
 *     move backwards.
 *  3. A discontinuity (hard re-anchor, which renders as a genuine gap) is
 *     declared only when the clock has fallen behind arrival by more than
 *     `delayMs + resyncMarginMs` (default 1000 ms) - i.e. a stall clearly
 *     longer than the playout delay. Ordinary burst jitter is absorbed by the
 *     slew and never produces a gap.
 *
 * The clock is transport agnostic: BLE (evenly paced notifications) and USB
 * (bursty) share this code.
 */

/** Playout delay, in ms, matching the default `streamDelay` tile config. */
export const DEFAULT_PLAYOUT_DELAY_MS = 500;

/** Extra slack, in ms, on top of the playout delay before re-anchoring. */
export const DEFAULT_RESYNC_MARGIN_MS = 500;

/** Maximum fractional deviation of the emitted interval from nominal. */
export const DEFAULT_MAX_SLEW = 0.05;

/** Fraction of the current anchor error corrected on each batch. */
export const DEFAULT_SLEW_GAIN = 0.05;

/** Sampling rates are clamped to this range to keep the clock well defined. */
const MIN_FS = 1e-3;
const MAX_FS = 1e6;

export interface PlayoutClockOptions {
  /** Sampling rate of the slot, in Hz. Clamped to [1e-3, 1e6]. */
  fs: number;
  /** Fixed playout delay, in ms. Defaults to {@link DEFAULT_PLAYOUT_DELAY_MS}. */
  delayMs?: number;
  /** Extra slack before a re-anchor. Defaults to {@link DEFAULT_RESYNC_MARGIN_MS}. */
  resyncMarginMs?: number;
  /** Max fractional interval deviation. Defaults to {@link DEFAULT_MAX_SLEW}. */
  maxSlew?: number;
  /** Anchor-error correction gain per batch. Defaults to {@link DEFAULT_SLEW_GAIN}. */
  slewGain?: number;
  /** Arrival-time source. Defaults to `Date.now`. Injectable for tests. */
  now?: () => number;
}

/** Timestamp assignment for a single batch of samples. */
export interface PlayoutSlice {
  /** Timestamp, in ms, of the first sample of the batch. */
  startTs: number;
  /** Spacing, in ms, between consecutive samples of the batch. */
  interval: number;
  /** Timestamp the next sample would take (`startTs + count * interval`). */
  nextTs: number;
  /** True when the clock re-anchored; the batch should render as a new segment. */
  discontinuity: boolean;
}

function clamp(value: number, lo: number, hi: number): number {
  return value < lo ? lo : value > hi ? hi : value;
}

/**
 * Per-slot virtual sample clock. Stateful, but the state is only the timestamp
 * of the next sample to emit; all timing policy lives in {@link stamp}.
 */
export class PlayoutClock {
  /** Nominal sample spacing, in ms. */
  readonly nominalInterval: number;
  readonly delayMs: number;
  readonly resyncThresholdMs: number;
  readonly maxSlew: number;
  readonly slewGain: number;

  private readonly nowFn: () => number;
  /** Timestamp of the next sample to emit; `undefined` until first anchored. */
  private next?: number;

  constructor(options: PlayoutClockOptions) {
    const fs = Number.isFinite(options.fs) ? clamp(options.fs, MIN_FS, MAX_FS) : MIN_FS;
    this.nominalInterval = 1000 / fs;
    this.delayMs = options.delayMs ?? DEFAULT_PLAYOUT_DELAY_MS;
    this.resyncThresholdMs = this.delayMs + (options.resyncMarginMs ?? DEFAULT_RESYNC_MARGIN_MS);
    this.maxSlew = clamp(options.maxSlew ?? DEFAULT_MAX_SLEW, 0, 0.5);
    this.slewGain = clamp(options.slewGain ?? DEFAULT_SLEW_GAIN, 0, 1);
    this.nowFn = options.now ?? Date.now;
  }

  /** Drop the anchor; the next batch starts a fresh (non-discontinuous) stream. */
  reset(): void {
    this.next = undefined;
  }

  /** Timestamp of the next sample to emit, or `undefined` before the first batch. */
  get nextTimestamp(): number | undefined {
    return this.next;
  }

  /**
   * Assign timestamps to a batch of `count` samples that arrived at
   * `arrivalMs` (defaults to now).
   *
   * Invariants: the returned `interval` is strictly positive and within
   * `maxSlew` of nominal, and `startTs` is never less than the `nextTs`
   * returned by the previous call.
   */
  stamp(count: number, arrivalMs: number = this.nowFn()): PlayoutSlice {
    const nominal = this.nominalInterval;

    if (count <= 0) {
      const startTs = this.next ?? arrivalMs - this.delayMs;
      return { startTs, interval: nominal, nextTs: startTs, discontinuity: false };
    }

    // Ideal timestamp for the sample following this batch: the newest sample of
    // the batch sits exactly `delayMs` behind its arrival time.
    const targetNext = arrivalMs - this.delayMs + nominal;

    if (this.next === undefined) {
      return this.anchor(targetNext, count, nominal, false);
    }

    // Positive error: the virtual clock lags arrival (we are draining a
    // backlog). Negative error: the clock leads arrival (producer is fast).
    const error = targetNext - (this.next + count * nominal);

    if (error > this.resyncThresholdMs) {
      // Stall clearly longer than the playout delay: re-anchor and let the
      // consumer render a real gap. Re-anchoring only ever moves forward.
      return this.anchor(targetNext, count, nominal, true);
    }

    // Bounded slew: spread a capped fraction of the error across the batch so
    // samples stay evenly spaced and the interval stays within maxSlew of
    // nominal. A clock that leads arrival by more than the threshold is not
    // re-anchored - stepping backwards would break monotonicity - it simply
    // slews at the maximum negative rate until it recovers.
    const maxCorrection = this.maxSlew * count * nominal;
    const correction = clamp(error * this.slewGain, -maxCorrection, maxCorrection);
    const interval = nominal + correction / count;
    const startTs = this.next;
    this.next = startTs + count * interval;
    return { startTs, interval, nextTs: this.next, discontinuity: false };
  }

  private anchor(targetNext: number, count: number, nominal: number, discontinuity: boolean): PlayoutSlice {
    const desiredStart = targetNext - count * nominal;
    // Never step backwards, even when re-anchoring.
    const startTs = this.next === undefined ? desiredStart : Math.max(desiredStart, this.next);
    this.next = startTs + count * nominal;
    return { startTs, interval: nominal, nextTs: this.next, discontinuity };
  }
}
