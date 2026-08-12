# real-estate-ai

Local-only processing tooling for professional real-estate photography.

Everything runs on your own machine. No network calls, no cloud services, no
telemetry, no uploads. Original RAW files are opened read-only and are never
modified, moved, renamed or deleted.

---

## What the finished tool will do

The photographer shoots exposure brackets on a tripod — five frames nominally
2 EV apart (−4 / −2 / 0 / +2 / +4 EV) or three frames (−2 / 0 / +2 EV). The
finished pipeline turns such a shooting folder into delivery-ready interior
photos:

```
shooting folder
  -> detect exposure brackets     <- implemented (step 01)
  -> RAW decode                   <- not implemented
  -> alignment                    <- not implemented
  -> HDR merge                    <- not implemented
  -> tone mapping                 <- not implemented
  -> window pull                  <- not implemented
  -> retouch                      <- not implemented
  -> export                       <- not implemented
```

## What this version does (step 01)

Only the **ingest stage**. It reads metadata and nothing else — **no pixel
data is decoded and no image is written**.

- Finds camera RAW files in a folder (optionally recursively):
  `.ARW .CR2 .CR3 .NEF .DNG .RAF .ORF .RW2 .PEF .SRW`, case-insensitive.
  JPEGs, TIFFs, XMP sidecars, hidden files, `.DS_Store` and `Thumbs.db` are
  ignored. An in-camera JPEG next to a RAW is *not* treated as a separate image.
- Reads capture time (with sub-second precision), exposure time, aperture,
  ISO, exposure compensation, camera make/model and image dimensions —
  through either of two interchangeable backends.
- Computes each frame's exposure value and groups the frames into 5- and
  3-frame exposure brackets.
- Reports what was grouped, what was not, and *why* each candidate was turned
  down.
- Optionally writes the whole result as JSON for the later pipeline stages.

## Installation

Requires **Python 3.12 or newer**.

```powershell
git clone <this repository>
cd real-estate-ai

python -m venv .venv
.\.venv\Scripts\Activate.ps1

python -m pip install -e ".[dev]"
```

On macOS/Linux the activation line is `source .venv/bin/activate`; everything
else is identical.

### ExifTool (optional, but strongly recommended)

The tool works without it, but ExifTool is the preferred metadata backend and
the only reliable way to read Canon **CR3** and other newer proprietary
formats. Install it and make sure `exiftool` is on your `PATH`:

```powershell
# Windows, pick one:
winget install --id OliverBetz.ExifTool
choco install exiftool
scoop install exiftool
```

Manual installation on Windows: download the *Windows Executable* from
<https://exiftool.org>, unpack it, rename `exiftool(-k).exe` to `exiftool.exe`
and put the folder on your `PATH`.

```bash
# macOS
brew install exiftool

# Debian/Ubuntu
sudo apt install libimage-exiftool-perl
```

Check that it is found:

```powershell
exiftool -ver
```

The CLI always prints which backend it used, so you can verify at a glance.

## Dependencies and why each one is here

Dependencies are deliberately minimal — every one is a long-term maintenance
and trust liability in a local-only tool.

| Dependency | Kind | Why |
| --- | --- | --- |
| `exifread` | runtime | Pure-Python fallback metadata backend, so the tool works on a machine without ExifTool installed. Small, dependency-free, read-only by design. |
| `pytest` | dev only | Test runner. The 145 tests in `tests/` are the safety net for the exposure-value sign convention and the grouping algorithm. |
| ExifTool | optional external binary | Not a Python dependency. Preferred backend, the only reliable reader for CR3 and newer proprietary RAW formats. |
| `ruff` | optional | Lint/format config exists in `pyproject.toml` as a convenience. It is **not** required to build, run or test. |

Everything else — argument parsing, JSON, logging, dataclasses, EV
mathematics, file discovery, subprocess handling — is Python standard library.
There is deliberately **no HTTP client anywhere in the dependency tree**.

## Running the detector

```powershell
python -m real_estate_ai.cli detect "D:\Shootings\Musterstrasse 12"
```

Or, after `pip install -e .`, via the console script:

```powershell
real-estate-ai detect "D:\Shootings\Musterstrasse 12"
```

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `--recursive` | off | Also scan sub-directories (hidden ones are skipped). |
| `--sizes 5,3` | `5,3` | Candidate bracket sizes, tried in this order. `7,5,3` also works. |
| `--expected-step 2.0` | `2.0` | Nominal EV spacing between neighbouring frames. |
| `--tolerance 0.6` | `0.6` | Allowed EV deviation per step and per pattern slot. |
| `--max-frame-gap 8.0` | `8.0` | Seconds between frames that still count as one burst. |
| `--max-bracket-span 30.0` | `30.0` | Maximum seconds from the first to the last frame of one bracket. |
| `--min-confidence 0.6` | `0.6` | Minimum confidence for a candidate window to be accepted. |
| `--backend auto` | `auto` | `auto`, `exiftool` or `exifread`. |
| `--json FILE` | — | Write the full result as JSON to `FILE`. |
| `--verbose` | off | Explain why each ungrouped file was not grouped. |

### Example output

```
Metadata backend: exiftool 12.76
Found 29 RAW files (1 unreadable)
Detected 4 five-shot brackets, 2 three-shot brackets
Ungrouped RAW files: 3

Bracket 001  (5 frames, dark -> bright)
------------------------------------------
  DSC00001.ARW   -4.06 EV
  DSC00002.ARW   -2.00 EV
  DSC00003.ARW    0.00 EV   <- reference
  DSC00004.ARW   +1.91 EV
  DSC00005.ARW   +3.91 EV
Confidence: 0.97  (spacing 0.94 / metadata 1.00 / timing 1.00 / consistency 1.00)
```

`--verbose` additionally prints every ungrouped file together with the reason
each candidate window containing it was rejected — for example
`EV steps [2.06, 2.00, 1.91, 4.02] do not match the expected 2.0 +/- 0.6 EV`.
When a real shoot does not group the way you expect, this is where to look.

`--json` writes the complete result — every group, every frame with its
metadata and `rel_ev`, every ungrouped file and every rejection reason — for
the later pipeline stages. **The JSON is only ever written to the path you
give**; pointing it inside the input folder is refused, because the shooting
folder is read-only.

## Running the tests

```powershell
python -m pytest
```

Or without installing the package:

```powershell
python -m pytest        # pyproject sets pythonpath = ["src"]
```

The grouping algorithm is tested entirely against synthetic metadata, so it is
covered independently of the metadata backends. A handful of tests build a
real, minimal TIFF/EXIF structure on disk so both backends are exercised
against genuine parsing. Tests that need the ExifTool binary skip themselves
when it is not installed.

## How the exposure values work

The camera's exposure value for a setting is

```
EV_setting = log2(N^2 / t) - log2(ISO / 100)
```

with `N` the f-number, `t` the exposure time in seconds and `ISO` the
sensitivity. **A higher `EV_setting` means less light on the sensor, i.e. a
darker image.**

The photographer's "−4 EV / 0 EV / +4 EV" labels describe image *brightness*
and therefore run in the opposite direction. Within a group the brightness
offset relative to the reference frame is

```
rel_ev(i) = EV_setting(reference) - EV_setting(i)
```

The reference frame is the one whose `EV_setting` is the **median** of the
group, so `rel_ev(reference) == 0` by construction. A longer exposure time
yields a positive `rel_ev` (brighter frame). Absolute EV values are
irrelevant — only the differences inside a group matter, so a measured
sequence of `17.0, 15.1, 13.0, 11.0, 9.1` normalises to
`−4.0, −2.1, 0.0, +2.0, +3.9`.

Exposure compensation is deliberately **not** used as the primary signal: in
manual mode with shutter bracketing it reads 0 for all five frames. It is
recorded as corroborating evidence only.

## How the confidence score works

> The confidence score describes only how plausibly the metadata of these
> frames forms a bracket. It says nothing about image quality and must never
> be used as a quality metric.

It is a weighted mean of four sub-scores, each in `[0, 1]`. No machine
learning is involved; every number is reproducible from the metadata.

| Sub-score | Weight | Definition |
| --- | --- | --- |
| `spacing` | **0.40** | Mean over all EV steps of `1 − |step − expected_step| / tolerance`, clamped at 0. A perfect 2.00 EV step scores 1.0; a step off by the full tolerance scores 0.0. |
| `metadata` | **0.20** | Fraction of frames with a complete shutter/aperture/ISO triplet. For an accepted group this is always 1.0, because an incomplete window is rejected before scoring; it is reported because it explains rejections. |
| `timing` | **0.15** | 1.0 for a capture span up to 5 s, decaying linearly to 0.0 at `--max-bracket-span`. 0.5 when at least one frame carries no timestamp and the span therefore cannot be verified. |
| `consistency` | **0.25** | Aperture identical across the group contributes 0.5, ISO identical contributes 0.5. A bracket shot by varying ISO instead of shutter still scores 0.5 and is still accepted. |

The weights are the constants in `ConfidenceWeights`
(`src/real_estate_ai/models/bracket.py`) and must sum to 1.0. The four
sub-scores are stored on every group, so the CLI can explain any score and the
JSON carries them for later stages.

The score is only ever the *second* gate. A window must first pass hard
checks: computable EV for every frame, one camera body, capture span within
`--max-bracket-span`, every EV step within `expected_step ± tolerance`, and a
normalised `rel_ev` pattern matching the nominal one for that size.

## How grouping works

1. **Sort** all files by `(timestamp, filename)`, sub-seconds included. Files
   without a timestamp go last and can only be ordered by name.
2. **Segment into runs.** A new run starts whenever the gap to the previous
   frame exceeds `--max-frame-gap`. A bracket is shot as a burst; afterwards
   the photographer moves the tripod.
3. **Grouping passes, largest size first.** Inside each run, walk left to
   right over the not-yet-consumed frames and evaluate the next `size`
   consecutive ones. Accept the window when its confidence reaches
   `--min-confidence` and continue behind it; otherwise record the rejection
   reason and advance by one frame.
4. Whatever is left over is reported as ungrouped.
5. A frame can never end up in two groups. This is asserted at the end of
   detection and raises if violated.

Both capture directions work — dark-to-bright and bright-to-dark — and the
detected direction is recorded on each group. **Brackets are never identified
by filename numbering**, only by capture time, camera identity and computed
exposure values.

## Current limitations

- **No pixel processing at all.** No RAW decoding, alignment, HDR merge or
  tone mapping. That is intentional for this step.
- Image width/height come straight from the metadata and, depending on the
  format and backend, may describe the embedded preview rather than the full
  sensor area. They are informational only and are not used for detection.
- The pure-Python `exifread` backend cannot read **CR3**. Such files are
  reported as unreadable with an explanatory message rather than dropped, but
  they will not be grouped. Install ExifTool if you shoot Canon CR3.
- Detection is metadata-only. A bracket whose EXIF was stripped, or a shoot
  mixing two camera bodies within one burst, cannot be grouped.
- The pattern check uses the same absolute `--tolerance` as the step check.
  For much larger group sizes than 5, cumulative step deviations could exceed
  it before any individual step does; a separate pattern tolerance would then
  be worth adding.
- Even group sizes (4, 6, …) are accepted by the parameter but have no unique
  median frame. The upper median is used and the expected pattern is therefore
  asymmetric. The supported and tested sizes are odd (3, 5, and 7 by
  configuration).
- Timestamps without an `OffsetTimeOriginal` are treated as naive and compared
  as if they were UTC. Only differences within one shoot are ever used, so
  this is harmless unless a single burst straddles a DST change.
- ISO-bracketed sequences are detected but score lower on `consistency`, since
  varying ISO is unusual for tripod-based interior work.
