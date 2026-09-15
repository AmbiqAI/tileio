# Vital Sign Monitoring reference benchmarks

The comparison carousel uses matched Apollo510 LP captures from September 15,
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

- Faster inference: maximum TFLM / heliaAOT latency, 4.771×, displayed as **up to 4.7×**.
- Energy efficiency: maximum TFLM / heliaAOT energy, 4.227×, displayed as **up to 4.2×**.
- Less memory: one minus the ratio of summed heliaAOT to TFLM RAM, 57.75%, displayed as **58%**.

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
