# AGENTS.md — read this before you change anything

This file is the standing brief for every future session on this repository.
The rules below are not suggestions; they are the reason the project exists in
this shape. Read them before planning, not after implementing.

## Project principles

1. **This is professional real-estate image-processing software.** The output
   goes to estate agents and their clients. The bar is "a working
   photographer would deliver this", not "the code runs".

2. **Image quality has priority over processing speed.** Never trade quality
   for a faster path. If a slower algorithm produces a visibly better image,
   take the slower algorithm. Optimise only what is provably not a quality
   trade-off.

3. **Original RAW files are never modified.** They are opened read-only and
   are never moved, renamed, deleted or written to. Nothing — not a cache, not
   a sidecar, not a JSON report — is ever written into the input directory.
   This is tested in `tests/test_immutability.py`; keep those tests passing and
   extend them whenever a new stage touches the filesystem.

4. **Local-first: no network, no cloud, no telemetry.** No HTTP client
   anywhere in the dependency tree. No image or metadata ever leaves the
   machine. No usage reporting, no crash reporting, no model API calls.

5. **The pipeline stays modular:**
   `ingest -> RAW decode -> alignment -> HDR merge -> tone mapping ->
   window pull -> retouch -> export`.
   Each stage is a separate module with an explicit data contract, and each is
   independently testable. Stages communicate through typed data structures,
   not through hidden global state. A stage must be swappable without touching
   its neighbours — the metadata backends are the pattern to follow.

6. **Every image-processing stage writes JPEG previews for human review.**
   Maximum 2000 px on the long edge, into `out/preview/`. Numbers are allowed
   as evidence for *physical facts*: clipped-pixel fraction, dynamic range in
   stops, channel saturation, runtime, test coverage. **Numbers are never
   accepted as evidence of how an image looks.** Never claim an image looks
   good because a metric improved. A human looks at the preview and decides.
   (Step 01 processes no pixels and therefore produces no previews. It is the
   only stage for which that is acceptable.)

7. **No silent generative edits to permanent architectural features.** Never
   invent, remove or "improve" windows, doors, sockets, radiators, sinks,
   taps, bathtubs, showers, kitchen units, built-ins, floors, walls, damage or
   cracks. Estate-agent photos are used in legally relevant listings; a
   hallucinated window is a misrepresentation. Any operation that could alter
   such a feature must be explicit, opt-in and reported.

8. **Avoid unnecessary dependencies and architectural complexity.** Every
   dependency must be justified in the README with a concrete reason. Prefer
   the standard library. Do not add a framework, plugin system or
   configuration layer before there are at least three real users of it.

9. **Preserve high bit depth and scene-linear data as long as possible.** No
   premature 8-bit conversion, no premature gamma encoding, no clipping to
   [0, 1] between stages. Convert to display-referred data only at export.

10. **Never implement a later pipeline stage unless explicitly requested.**
    If you find yourself writing RAW decoding, alignment, HDR merging or tone
    mapping while working on another stage, stop.

## Also true, and easy to get wrong

- **No database, no Docker, no web server, no GUI.** A local Python CLI.
- **Python 3.12+.**
- **The exposure-value sign convention is a trap.** A *higher* `EV_setting`
  means a *darker* image; `rel_ev` runs the other way, so a longer exposure
  gets a *positive* `rel_ev`. The convention is documented in
  `src/real_estate_ai/ingest/exposure.py` and pinned by tests. If you touch EV
  maths, run `tests/test_exposure.py` first and do not "fix" the sign.
- **Confidence is not quality.** The bracket confidence score describes only
  how plausibly the metadata of a set of frames forms a bracket. It says
  nothing about image quality and must never be used as a quality metric, a
  ranking for retouching effort, or an image-selection criterion.
- **Never identify brackets by filename numbering.** Use capture time, camera
  identity and computed exposure values.
- **Exposure compensation is corroborating evidence only.** In manual mode
  with shutter bracketing it reads 0 for every frame of the bracket.
- **Missing metadata is normal, not an error.** A file that cannot be read
  must still appear in the result with `None` fields and a populated
  `read_errors`. Never crash, never silently drop a file.
- **Rejection reasons are a feature.** The user runs this against a real shoot
  and needs to see *why* something was not grouped. Keep the reason strings
  specific and user-facing.

## Layout

```
src/real_estate_ai/
    cli.py                     argparse subcommands; add later stages here
    models/bracket.py          typed data model, serialisation, no logic
    ingest/exposure.py         pure EV mathematics
    ingest/metadata.py         backends behind the MetadataReader protocol
    ingest/bracket_detector.py the grouping algorithm
tests/                         pytest; conftest.py holds the factories
```

## Before you report a step complete

- `python -m pytest` passes, with no test skipped that should have run.
- No new dependency without a justification in the README.
- Nothing writes into an input folder.
- For any stage that touches pixels: previews exist in `out/preview/` and you
  have described what they actually look like, not what the metrics say.
