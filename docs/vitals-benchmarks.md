# Vital Sign Monitoring reference benchmarks

The current carousel uses the [September 26 dataset](../src/assets/dashboards/vitals-benchmark-dataset.json). Apollo510 LP 96 MHz, shared SRAM working arenas and MRAM constants, matched Arm Toolchain for Embedded 22.1.0. Stock CMSIS-NN TFLM is compared with heliaAOT 0.23/core 7.36. This replaces the historical TCM comparison. Original precision is retained: denoise FP32; segmentation INT8; arrhythmia FP32 IO with INT8 internals.

| Model | Stock TFLM ms | AOT ms | Speedup | TFLM/AOT load B | TFLM/AOT allocated RAM B |
| --- | ---: | ---: | ---: | ---: | ---: |
| denoise | 65.373535 | 12.229004 | 5.346× | 217764/109292 | 290880/93000 |
| segmentation | 76.421814 | 16.133728 | 4.737× | 231092/94332 | 290880/50088 |
| arrhythmia | 21.731873 | 7.876587 | 2.759× | 304996/125580 | 282816/34536 |

Each latency is the median of three batch means: five warmups then 100 case-0 input-restore-plus-invoke calls. Full outputs for all eight saved cases are checked outside timing. Separate sequential windows, same board/compiler/clock and verified ELF placement. Den FP32 passes `1e-5 + 1e-5*abs(TFLM)` (maximum difference 4.7683716e-6); segmentation is bit-exact with identical threshold/QOS masks. Its depthwise layers use `arm_depthwise_conv_s8_opt` at dilation 2/4/8.

**Arrhythmia uses a batch-one specialization for AOT.** The original shipped flatbuffer `a1855af0` remains the TFLM baseline. AOT uses `8b91d202`: only 48 existing batch signature fields change from −1 to 1; every other byte, including weights, concrete shapes, operators, axes and quantization, is unchanged. Original and specialized models produce bit-identical full outputs on all eight saved host cases. The original strict conversion failure at MEAN is preserved; specializing signatures lets strict AOT 0.23 conversion succeed. All eight device pairs pass the unchanged maximum absolute error 0.008 and identical argmax/classification gate; maximum difference is 0.0078125. Full separate model/input/image hashes are in the dataset. This is not an unchanged-flatbuffer claim or a compiler shape-inference fix.

RAM includes platform/stack, eight-case validation buffers and the TFLM 256 KiB arena reservation. It is allocated image footprint, not minimum/peak tensor use or integrated-demo RAM. Summed RAM reduction describes three standalone images.

## Configured-rate workload projection

The aggregate is **sum(calls/s × model latency)** for each engine, not an average of speedups or reciprocal execution capacities. At pinned demo source `4d16e9c`, ECG is decimated from 200 to 100 samples/s. Denoise/segmentation each advance 256−2×25=206 samples. Arrhythmia runs once per 1000-sample metrics window advancing 200 samples, despite its 500-sample model input. With AI enabled, steady input, filled windows and no drops/backlog:

| Model | Configured calls/s | TFLM model ms/s | AOT model ms/s | Saved model ms/s |
| --- | ---: | ---: | ---: | ---: |
| denoise | 0.485436893 | 31.734726 | 5.936410 | 25.798316 |
| segmentation | 0.485436893 | 37.097968 | 7.831907 | 29.266061 |
| arrhythmia | 0.500000000 | 10.865936 | 3.938293 | 6.927643 |
| **All three models** | | **79.698630** | **17.706610** | **61.992020** |

The configured model workload improves **4.501067×**, or **77.7830%** less model time. Projected model-only duty changes from **7.969863% to 1.770661%**, saving **6.199202 percentage points**. These are configured-rate projections, not measured total CPU or application speedup. No live successful-call counters were captured; timings use saved case 0, not a live input distribution. Preprocessing/DSP, scheduler, transport, other work, idle and power are excluded.

### Existing live aggregation

Firmware `ai_average_rate()` averages available positive stage IPS values. Those values are reciprocals of measured whole-stage durations, including stage overhead, rather than run-counter rates. The frontend metric is therefore relabelled **Mean Stage Capacity**, without changing the wire field or firmware. It must not serve as an aggregate workload speedup.

The firmware battery-duty path already uses `stage_duty_frac(delta_runs, ips, elapsed_seconds)` separately for each stage: observed completed-run frequency × latest stage duration. It then retains other busy work and idle power terms. Keep this observed stage-duty estimate distinct from the static model-only projection; pipeline counters also need AI-mode/error qualification to identify successful model calls.

A future workload-energy estimate is `sum(frequency_i * measured_energy_per_inference_i)` only for a matched measured dataset. No new energy aggregate is available. Historical power × stage-time estimates, non-model/idle power and sensor supply remain separate.

Firmware module swap and actual sensor validation are tracked in [heartkit-vitals-demo #99](https://github.com/AmbiqAI/heartkit-vitals-demo/issues/99). The local owner should record successful model-call counter deltas over elapsed windows, modes/errors/sample drops, model-only and complete-stage durations, then compare observed rates with these configured projections. No firmware/sensor changes are part of this dashboard patch.


**New energy measurements are pending.** No energy gain is inferred from latency. Historical live efficiency references remain September 15 estimates, not new meter readings. Rail, sole-feed/back-power and instrument wiring must be verified separately; sensor power is excluded.

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
