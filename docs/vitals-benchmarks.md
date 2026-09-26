# Vital Sign Monitoring reference benchmarks

The current carousel uses the qualifying rows from the [September 26 dataset](../src/assets/dashboards/vitals-benchmark-dataset.json). Exact shipped models are unchanged from heartkit-vitals-demo `4d16e9c`; no FP16 or re-export substitution. Apollo510 LP 96 MHz, shared SRAM working arenas and MRAM constants, matched Arm Toolchain for Embedded 22.1.0. This replaces the old TCM comparison rather than mixing its latency or RAM values into the new dataset.

| Model | Stock TFLM ms | AOT 0.23 ms | Speedup | TFLM load B | AOT load B | TFLM allocated RAM B | AOT allocated RAM B |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| denoise | 65.373535 | 12.229004 | 5.346× | 217764 | 109292 | 290880 | 93000 |
| segmentation | 76.421814 | 16.133728 | 4.737× | 231092 | 94332 | 290880 | 50088 |

Each latency is the median of three batch means: five warmups then 100 case-0 input-restore-plus-invoke calls. All eight saved inputs are evaluated outside the timed bracket. Separate sequential windows, same board/compiler/clock and verified ELF placement. Den FP32 passes the original per-element `1e-5 + 1e-5*abs(TFLM)` gate (worst difference 4.7683716e-6); segmentation is bit-exact across all eight cases, including thresholded masks. This comparison uses **stock CMSIS-NN TFLM**, distinct from the product's historical Helia-TFLM parity reference.

The three dilated segmentation depthwise layers now call `arm_depthwise_conv_s8_opt` at dilation 2/4/8. Kernel selection alone is not the performance claim: the table records the full matched model measurements. Source revisions and exact model/input/image hashes are in the dataset. Original model SHA prefixes are denoise `e94a5788` and segmentation `93c4493a`.

RAM includes the platform/stack, eight-case validation output buffers and the TFLM 256 KiB arena reservation. It is allocated image footprint, not minimum/peak tensor use or integrated-demo RAM. The reduction aggregates only the two qualifying standalone images. Headlines derive only from those rows.

Arrhythmia (`a1855af0`, FP32 IO/INT8 internals) is **pending**: exact-model AOT 0.23 conversion fails strict shape propagation at MEAN op 8 and 41 downstream tensors. Its previous latency/memory bars are removed from the current comparison; no substitute model or claimed new speedup. The preserved stock-TFLM baseline does not qualify a pair on its own.

**New energy measurements are pending.** No energy bars or energy-gain headline are derived from these latency measurements. The old energy evidence below remains historical, not a power measurement for the new images. Live firmware efficiency tiles still combine measured stage duration with September 15 SRAM/MRAM power references; this is estimated energy, not a live power-meter reading. Refreshing those references requires a separately verified supply rail, sole-feed/back-power arrangement and instrument wiring. Battery remains an MCU projection, with sensor power excluded.

[Measurement checkpoint and limitations](https://github.com/AmbiqAI/helia-benchmark/issues/1#issuecomment-5848885586).

## Configured-rate workload projection

The workload calculation is `sum(frequency_i * latency_i)`, using the same call frequencies for both engines. It is not the mean of speedups or the mean/sum of `1 / latency` capacities.

At demo source `4d16e9c`, ECG is decimated from 200 to 100 samples/s. Denoise and segmentation consume 206 samples per invocation (256-window minus two 25-sample pads). Arrhythmia runs once per metrics cycle: the 1000-sample metrics window advances 200 samples, even though the classifier consumes 500 samples. With AI enabled, steady input, filled windows and no drops/backlog:

| Model | Configured calls/s | TFLM model ms/s | AOT model ms/s | Saved model ms/s |
| --- | ---: | ---: | ---: | ---: |
| Denoise | 100/206 = 0.485437 | 31.734726 | 5.936410 | 25.798316 |
| Segmentation | 100/206 = 0.485437 | 37.097968 | 7.831907 | 29.266061 |
| Arrhythmia | 100/200 = 0.5 | Pending qualifying pair | Pending | Pending |
| **Qualified two-model subtotal** | | **68.832694** | **13.768316** | **55.064377** |

The qualified subtotal is **4.999354×** lower model compute demand, a **79.9974%** reduction. Projected model-only duty changes from **6.883269% to 1.376832%**, saving **5.506438 percentage points**. The dashboard calls this a **two-model configured workload projection**, not an overall three-model or measured application gain. Arrhythmia is excluded from both sums; treating its missing candidate latency as zero would be invalid.

No live invocation counters were captured in these standalone runs. Real sensor throughput, warm-up/window filling, model modes, sample loss, backlog and scheduler behavior can change actual calls/s. These projections exclude preprocessing, DSP, transport, scheduler overhead, other work and idle time. Model latencies use the saved case-0 timing workload, not an observed distribution of live sensor windows.

### Existing live aggregation

Firmware `ai_average_rate()` averages available positive stage IPS values. Those values are reciprocals of measured whole-stage durations, including stage overhead, rather than run-counter rates. The frontend metric is therefore relabelled **Mean Stage Capacity**, without changing the wire field or firmware. It must not serve as an aggregate workload speedup.

The firmware battery-duty path already uses `stage_duty_frac(delta_runs, ips, elapsed_seconds)` separately for each stage: observed completed-run frequency × latest stage duration. It then retains other busy work and idle power terms. Keep this observed stage-duty estimate distinct from the static model-only projection; pipeline counters also need AI-mode/error qualification to identify successful model calls.

A future workload-energy estimate is `sum(frequency_i * measured_energy_per_inference_i)` only for a matched measured dataset. No new energy aggregate is available. Historical power × stage-time estimates, non-model/idle power and sensor supply remain separate.

Firmware module swap and actual sensor validation are tracked in [heartkit-vitals-demo #99](https://github.com/AmbiqAI/heartkit-vitals-demo/issues/99). The local owner should record successful model-call counter deltas over elapsed windows, modes/errors/sample drops, model-only and complete-stage durations, then compare observed rates with these configured projections. No firmware/sensor changes are part of this dashboard patch.

---

# Historical September 15 reference benchmarks

The previous comparison carousel used matched Apollo510 LP captures from September 15,
2026. Both engines use the same original model files: FP32 denoise, INT8
segmentation, and INT8 arrhythmia with FP32 input/output. No FP16 substitution
is included. Arm GNU 14.3.1 builds run at 96 MHz with model data in TCM.

| Model | TFLM latency (ms) | heliaAOT latency (ms) | TFLM energy (µJ/inf) | heliaAOT energy (µJ/inf) | TFLM RAM (bytes) | heliaAOT RAM (bytes) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Denoise | 73.420 | 15.388 | 403.586 | 95.477 | 450796 | 223208 |
| Segmentation | 99.671 | 56.981 | 509.753 | 300.383 | 456116 | 178080 |
| Arrhythmia | 21.839 | 8.122 | 119.661 | 49.263 | 484852 | 186672 |

Latency is the clean-window firmware average. Energy comes from dedicated
transport-free HPX power captures, using integrated energy divided by completed
inference count. The captures use synthetic inputs and do not evaluate model
accuracy or the complete sensing pipeline.

RAM sums occupied ITCM, DTCM, and SRAM regions of each standalone benchmark
image. It includes the TFLM 256 KiB arena reservation, not just its used tensors,
as well as benchmark infrastructure. It excludes MRAM and unoccupied memory.
This is a build-footprint comparison, not a minimum-memory or integrated-demo
RAM claim. TFLM stages the flatbuffer and arena in DTCM; heliaAOT stages
constants and allocates scratch in DTCM before measurement.

## Headline calculations

The energy bars show relative energy per inference, with TFLM normalized to
100 for each model. heliaAOT is 23.7 for denoise, 58.9 for segmentation, and
41.2 for arrhythmia. Lower is better. The dashboard does not show raw energy
units in these comparison bars; the measured source values remain above for
traceability. Latency and memory bars retain the values in the table.

- Faster inference: maximum TFLM / heliaAOT latency, 4.771×, displayed as **up to 5×**.
- Energy efficiency: maximum TFLM / heliaAOT energy, 4.227×, displayed as **up to 4×**.
- Less memory: one minus the ratio of summed heliaAOT to TFLM RAM, 57.75%, displayed as **60%**.

The summary uses rounded headline values without an extra caption.
Multipliers round to whole numbers and memory to one significant digit.
Detailed bars retain measured values; no unmeasured placement gains are included.

Speed and energy maxima are from denoise. They are not combined application or
battery-life gains. The memory aggregate sums three separate images, not a
single three-model deployment. The live demo's energy tiles use its firmware
power references and runtime timings; they need not equal these static TCM
benchmarks.

Source records: `heartkit-lp-hp-profiling-review-2026-09-15.md` and
`heartkit-lp-hp-evidence-2026-09-15.zip`, with each run's `summary.json`.
HPX revision: `a9d73ee91976efb2b79aff3faf47ec29a67001c7`.
AOT revision: `bf0fd47d33077150b34251fa60eccbd3d26c850f`.
CORE revision: `cad3c8fa0cc2f7b13d6ff750bfc9744af0d621a6`.
