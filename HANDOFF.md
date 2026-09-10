# Vital Sign Monitoring dashboard

## Goal and scope

Prepare the refined built-in dashboard and renderer fixes for local review.
Branch codex/vitals-dashboard-labels; base d6692e2. Main is untouched.
Local commits approved. No push, issue publication, PR, merge or release without
approval. Consult git log for the final local commit ID.

Issue draft was shown before implementation but is not published:
"Refine Vital Sign Monitoring labels and comparison tiles".
Scope: neutral metric/Markdown labels, consistent segmentation colors, compact
bar/number slides, theme-aware heartKIT branding and concise dashboard summaries.
Owner approved a separate subtle modernization pass after checkpoint46d6408:
quieter backgrounds, shared card surfaces, lighter typography and chart fills.
Follow-up scope: compact I/O tile with labels above controls, adaptive columns,
and primary-text I/O heading. Control behavior and other control views unchanged.
Publish the issue only after approval, then reference it in the PR.

## Done and decisions

Template src/assets/dashboards/hk-ap510-vs-ap4.json retains 23 tiles and the
original grid and chart colors. Teal #00dfea, violet #bd6bf0, T-wave cool gray #94a3b8.
P/QRS/T identities and colors agree between stream and pie chart.
Metric labels use primary text; Markdown headings use primary text, weight500.
Name is Vital Sign Monitoring; other brand mentions use heartKIT.

AI Throughput maximum150 IPS; arrhythmia efficiency maximum40000 IPS/W.
Battery plot maximum28 days is unchanged. Battery values come from firmware.
Apollo image replaced by supplied light/dark heartKIT SVGs. SvgTile accepts
optional darkContent via the MUI theme, falling back to content.

Poincare replaced by one bar carousel: latency and memory for each model,
six slides total. TFLM violet, heliaAOT teal. Compact headings and engine labels.
The small QR tile is replaced by a four-slide summary:
heliaAOT wordmark, 2.32x Faster inference, 41% Less memory, and
Energy Efficiency / Up to 4x / heliaAOT vs TFLM, per owner request.
Gain slides include "heliaAOT vs TFLM", centered responsive values and clickable
pagination dots. No accent underline. Existing multi-value slides retained.

The energy headline is the reported denoise reference gain rounded to 4x,
not the combined-model gain. No "estimated" label on the slide per owner.
The supplied profiler report still flags power.window_observer_mismatch.
The internal timing-validation note is kept here, not in the customer-facing
dashboard description, per owner request. Confirmation is still required before
customer release. Other energy comparisons remain
excluded. No measured battery-gain claim. Owner requested a checkpoint commit
before a separate subtle modernization pass, keeping layout and behavior intact.

Modernization centralizes card surfaces in the MUI theme, subdues the honeycomb,
removes repeated blur/shadow overrides and reduces metric label/unit weight.
Light theme text contrast is corrected. No transport or telemetry changes.
Review fixed heading-adjacent Markdown previews and a stray JSX text node that
caused pagination focus to scroll tile contents and clip headings.

Main-list descriptions show the first prose paragraph capped at three lines.
Full description has a concise overview, benchmark scope and modeled-power
boundary. It highlights heliaAOT, Arm Helium MVE and Ambiq SPOT, with heartKIT
as model provenance. No NPU-equivalence claim.

## Benchmark basis and limitations

Source supplied by owner: heartkit-profiling.md in Downloads.
HPX reference benchmarks: LP, TCM weights/arena, median over100 iterations.
Speed gain = invocation-weighted TFLM latency / AOT latency:
denoise/segment100/206 Hz, arrhythmia100/200 Hz, from firmware scheduling.
Model-only duty9.239% versus3.982%, giving2.32x. Not full application speedup.

Memory comparison sums the standalone profiling images' zero-initialized RAM
allocations, not integrated application RAM; excludes initialized data, stack
and heap. User-facing wording is memory footprint; the full description states
the scope. Precise build/model equivalence is not established by this UI task.
Do not present these as production whole-system memory reductions.

## Validation

53 tests pass; build-web passes with dependency-directive and bundle-size warnings.
Compact I/O follow-up verified at the normal1029px browser width and390px fallback.
Four columns fit the desktop card; two columns scroll within narrow cards, with
the final mode row verified reachable. Added opt-in compact-control tests. No
device settings were changed during this visual pass.
Tests cover template content/calculations, Markdown themes/overrides and headline
slides, alongside existing transport/clock tests. Source cleanup removes dead
single-value branches from the multi-value rendering path.
The existing local preview renders the compact summary and bar carousel, primary
metric labels and heartKIT artwork. Earlier dark/light visual checks passed.
The final summary and bars were also visually checked at a 1366x1024 landscape
viewport. The temporary viewport override was reset afterward. No physical-tablet
or connected-device acceptance in this UI task.
Modernization was also visually checked in dark/light at1366x1024, including
bottom-row clearance and summary pagination. Two independent reviews found no
remaining code blockers after the preview fix. No new hardware testing.

Preview: http://127.0.0.1:5184/#/dashboards/583da6b6-f73b-4564-b44a-47a64d202b21.
Saved dashboards do not automatically inherit template JSON changes.
The energy slide and description are updated in both this saved preview and the
template. Its longer headline fits the small card after responsive sizing;
the rendered heading, value, comparison caption and pagination were checked.
Old saved dashboards are historical.
Do not delete user data to clean up previews.

## Next steps and paired firmware

Owner visual review, then approval to publish the issue and open the PR.
No GitHub writes performed. Package version is1.1.3; proposed release is1.2.0,
subject to owner approval. Main push automatically deploys GitHub Pages, so merge
is public publication. The benchmark evidence gate above must be resolved before
that step; it is not a customer-facing description change.
The paired firmware worktree is heartkit-vitals-demo/.claude/worktrees/aot-021-denoise,
branch work/aot-021-denoise, existing draft PR85, issues37/68.
It owns AP330 click mapping, AOT migration, measurement evidence and the
two-cell LP battery projection. It does not implement real streaming sleep.
Proper AP330 Rev2 sensor validation and longer AP510B battery/mode checks remain.
