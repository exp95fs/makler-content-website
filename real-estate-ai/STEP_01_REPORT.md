# Step 01 — Project Foundation, RAW Metadata, Exposure-Bracket Detection

## 1. What I implemented

The ingest stage of the pipeline, and nothing beyond it. **No pixel data is
read, decoded or written anywhere in this step.**

- **Project skeleton** with a src layout, hatchling build backend, console
  script entry point, `.gitignore`, README and AGENTS.md.
- **RAW discovery** — case-insensitive matching of the ten supported RAW
  extensions, optional recursion (hidden directories pruned), and rejection of
  JPEG/TIFF/XMP neighbours, hidden files, `.DS_Store`, `Thumbs.db` and
  `desktop.ini`. Results are sorted deterministically.
- **Two interchangeable metadata backends** behind a `MetadataReader`
  protocol:
  - `ExifToolReader` — invokes the external binary **once per batch** through
    its argument-file interface (`-@ -` on stdin), which avoids the Windows
    command-line length limit and handles UTF-8 filenames. Preferred backend.
  - `ExifReadReader` — pure-Python fallback using `exifread`.
  - `NullMetadataReader` — last resort when neither is present, so the tool
    reports every file as unreadable instead of crashing.
  - `select_reader("auto")` prefers ExifTool when on PATH; the CLI prints the
    backend and version it used.
- **Exposure mathematics** in a standalone, dependency-free module, with the
  sign convention pinned by tests.
- **Bracket detection** — the specified deterministic algorithm: sort, segment
  into time-based runs, grouping passes largest size first, leftovers reported
  as ungrouped, and a hard assertion that no frame lands in two groups.
- **Confidence scoring** — four documented, explainable sub-scores stored on
  every group.
- **CLI** — `detect` subcommand with all specified options, the specified
  human-readable report, `--verbose` rejection reasons and `--json` export.

Verified end to end against a generated folder of 29 files carrying genuine
EXIF blocks: both backends independently produce the same six brackets (four
5-frame including one shot bright-to-dark, two 3-frame), three ungrouped
files, and correct `rel_ev` values with correct signs.

## 2. Final project tree

```
real-estate-ai/
    .gitignore
    AGENTS.md
    README.md
    STEP_01_REPORT.md
    pyproject.toml

    src/real_estate_ai/
        __init__.py
        cli.py
        ingest/
            __init__.py
            bracket_detector.py
            exposure.py
            metadata.py
        models/
            __init__.py
            bracket.py

    tests/
        __init__.py
        conftest.py               (added — shared factories, see §6)
        test_bracket_detector.py
        test_cli.py               (added — see §6)
        test_exposure.py
        test_immutability.py
        test_metadata.py
```

## 3. Dependencies added, and why

| Dependency | Scope | Justification |
| --- | --- | --- |
| `exifread>=3.0` | runtime | The pure-Python fallback backend required by the task. Without it the tool would be unusable on a machine without ExifTool. It is small, has no dependencies of its own, and only reads. |
| `pytest>=8.0` | dev only | Test runner. The only dev dependency. |
| `hatchling` | build only | PEP 517 build backend, pulled by pip at build time, not installed into the runtime environment. |
| ExifTool | optional external binary | Not a Python dependency and not installed by pip. The preferred backend and the only reliable reader for CR3. |
| `ruff` | optional, not required | Configured in `pyproject.toml` for convenience. Nothing depends on it; the project builds, runs and tests without it. |

**No HTTP client anywhere in the tree.** Everything else — argparse, json,
logging, dataclasses, subprocess, pathlib, os.walk, math — is standard library.

## 4. Commands (PowerShell-compatible)

```powershell
cd real-estate-ai

# install
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"

# optional but recommended
winget install --id OliverBetz.ExifTool

# run
python -m real_estate_ai.cli detect "D:\Shootings\Musterstrasse 12"
python -m real_estate_ai.cli detect "D:\Shootings\Musterstrasse 12" --recursive --verbose --json "D:\Out\shoot.json"

# or via the console script
real-estate-ai detect "D:\Shootings\Musterstrasse 12"

# test
python -m pytest
```

## 5. Test results

```
145 passed in 2.35s
```

**145 passed, 0 failed, 0 skipped** with ExifTool 12.76 installed.

Verified on a machine without ExifTool on PATH as well: **140 passed, 5
skipped** — the four real-binary integration tests and the ExifTool leg of the
parametrised immutability test skip themselves. Nothing fails either way.

Coverage of the 18 required cases:

| # | Case | Where |
| --- | --- | --- |
| 1 | Perfect 5-frame bracket | `test_perfect_five_frame_bracket` |
| 2 | Perfect 3-frame bracket | `test_perfect_three_frame_bracket` |
| 3 | Small deviations (±0.3 EV) | `test_small_deviations_are_still_a_bracket` |
| 4 | Reverse capture order | `TestCaptureOrder` (both sizes) |
| 5 | Two consecutive 5-frame brackets | `test_two_consecutive_five_frame_brackets` |
| 6 | 3-frame then 5-frame, no stealing | `test_five_frame_pass_does_not_steal_from_a_leading_three_frame_bracket` |
| 7 | Random non-bracket files | `TestNonBrackets` |
| 8 | Missing exposure compensation | `test_missing_exposure_compensation_does_not_matter` |
| 9 | Missing shutter time | `test_missing_shutter_time_is_reported_not_crashed` |
| 10 | Identical timestamps | `test_identical_timestamps_still_group` |
| 11 | Sub-second ordering | `test_subsecond_timestamps_drive_the_ordering` |
| 12 | Upper/lower-case extensions | `test_uppercase_and_lowercase_extensions_are_both_found` |
| 13 | No RAW files | `test_empty_directory_yields_no_files`, `test_empty_folder` |
| 14 | RAW plus JPEG/TIFF/XMP | `test_non_raw_neighbours_are_ignored` |
| 15 | Nested dirs, with/without recursive | `TestDiscovery`, `test_recursive_flag` |
| 16 | Sign: longer exposure → positive `rel_ev` | `test_longer_exposure_time_gets_positive_rel_ev` |
| 17 | No frame in two groups (large set) | `test_no_frame_appears_in_two_groups_across_a_large_set` |
| 18 | Immutability (size, mtime, SHA-256) | `tests/test_immutability.py` |

Plus the specification's own normalisation example
(`17.0, 15.1, 13.0, 11.0, 9.1` → `−4.0, −2.1, 0.0, +2.0, +3.9`) as an explicit
test in both `test_exposure.py` and `test_bracket_detector.py`.

## 6. Design decisions I made that were not specified

1. **The `MetadataReader` protocol takes a sequence of paths, not one path.**
   The spec asked for "a single method that returns a `RawFileMetadata` object
   for a path", but also required ExifTool to be called once for the whole
   directory. Those two cannot both hold: a per-file method forces a process
   start per file (~100× slower on a real shoot). The protocol therefore has a
   single method `read(paths) -> list[RawFileMetadata]`, and a module-level
   `read_single(reader, path)` helper provides the one-file convenience.

2. **A third backend, `NullMetadataReader`.** When neither ExifTool nor
   exifread is available, `select_reader("auto")` returns a stat-only reader
   rather than raising, so the "never crash, never drop a file" rule holds
   even with no backend installed.

3. **`BracketGroup` stores `reference_index`, not a `reference_image` field.**
   Storing the reference frame both inside `images` and as a separate field
   would allow the two to diverge. `reference_image` is a property.

4. **`RejectedWindow` carries `size`.** The 5-frame and the 3-frame pass reject
   the same frame for different reasons, and the user needs to see which pass
   said what.

5. **Runs too short to form any window produce an explicit rejection record.**
   Otherwise the most common real-world case — a single detail shot with
   nothing around it — would appear in `--verbose` with no explanation at all.
   The message reads `only 1 frame left in this burst; the smallest candidate
   bracket needs 3`.

6. **Timing sub-score is 0.5, not 1.0, when a frame has no timestamp.** The
   span cannot be verified, so scoring it perfect would be dishonest and
   scoring it zero would punish files whose EXIF is merely incomplete.

7. **Epoch normalisation of timestamps.** EXIF timestamps are naive unless the
   file has `OffsetTimeOriginal`. Sorting a mix of naive and aware datetimes
   raises `TypeError`, which would crash on a real shoot where one body writes
   the offset tag and another does not. All ordering and gap arithmetic goes
   through `RawFileMetadata.timestamp_seconds`, which treats naive timestamps
   as UTC. Only differences within a shoot are ever used, so the choice is
   arbitrary and harmless. There is a test for the mixed case.

8. **exifread's log output is captured, not printed.** exifread writes lines
   like `File format not recognized.` straight to stdout, which would corrupt
   the CLI report and any downstream parsing of it. Its logger is temporarily
   redirected during a read and the messages are surfaced through
   `read_errors`, where they actually help the photographer.

9. **`SubSecTimeOriginal` is requested from ExifTool as a string, not a
   number.** With a global `-n` flag, `"05"` (0.05 s) would come back as the
   number `5` and be interpreted as 0.5 s — a 450 ms ordering error inside a
   burst. Numeric conversion is applied per tag with the `#` suffix instead,
   and there is a test against the real binary confirming leading zeros
   survive.

10. **Two extra CLI options:** `--backend {auto,exiftool,exifread}` (makes both
    backends reachable and testable from the command line) and `--version`.

11. **Two extra test files:** `tests/conftest.py` (shared metadata factories
    and a builder that emits a real, minimal TIFF/EXIF structure so both
    backends are exercised against genuine parsing rather than mocks) and
    `tests/test_cli.py` (end-to-end coverage of output formatting, JSON export
    and option handling). The required test files all exist and cover the
    required cases.

12. **`--json` pointing inside the input folder is a hard usage error**, not a
    warning. The shooting folder is read-only, full stop.

13. **Frozen dataclasses with `slots=True`** throughout, and the expected
    pattern is generated as `(i − size//2) * step` so 7- and 9-frame brackets
    work purely through `--sizes`, with no change to the algorithm.

## 7. Assumptions and known limitations

- Dimensions (`width`/`height`) may describe an embedded preview rather than
  the full sensor area, depending on format and backend. They are
  informational only and play no part in detection.
- `exifread` cannot read CR3. Those files are reported as unreadable with an
  explanatory message, never dropped. ExifTool is the answer for Canon.
- Detection is metadata-only. Stripped EXIF, or two camera bodies inside one
  burst, cannot be grouped.
- The pattern check reuses the same absolute `--tolerance` as the step check.
  For sizes well beyond 5, cumulative step deviations could exceed it before
  any individual step does. Not a problem at 3 and 5, where real shutter
  ladders deviate by under 0.1 EV; worth revisiting if 9-frame brackets are
  ever used.
- Even group sizes have no unique median frame. The parameter accepts them,
  the upper median is used, and the expected pattern is then asymmetric. Only
  odd sizes are supported and tested.
- Naive timestamps are compared as if UTC (see §6.7). A single burst spanning
  a DST change would misorder — not physically reachable for a bracket.
- `ExifToolReader` passes all paths in one invocation. For a folder of tens of
  thousands of files this builds a large stdin payload; it has not been
  benchmarked past a few hundred. If it ever matters, chunking is a two-line
  change that does not affect the protocol.
- ISO-bracketed sequences are detected but score 0.5 on `consistency`.

## 8. Things in the specification I consider wrong or risky

Stated plainly rather than worked around silently:

1. **The `MetadataReader` protocol as specified cannot satisfy the ExifTool
   batching requirement.** "A single method that returns a `RawFileMetadata`
   object for a path" and "call it ONCE for the whole directory" are mutually
   exclusive. I implemented the batch signature and kept a single-file helper.
   See §6.1.

2. **`spacing` and `metadata` are near-constant for accepted groups, which
   makes the confidence score less informative than it looks.** The hard gates
   run *before* scoring: a window with incomplete metadata is already rejected,
   so `metadata` is always exactly 1.0 for an accepted group; and every step is
   already known to be within tolerance, so `spacing` can never be catastrophic.
   In practice accepted brackets cluster in the 0.93–1.00 range and
   `--min-confidence 0.6` almost never fires. The score is a good *explanation*
   and a poor *filter*. It is honest and useful as specified — I am flagging
   that its discriminating power should not be over-trusted, and that the
   tuning knob that actually matters is `--tolerance`.

3. **The confidence score is a metadata plausibility measure and is trivially
   mistakable for a quality signal.** The required sentence is in the code
   docstrings and the README, and I repeated it in AGENTS.md, because the name
   invites exactly the misuse it warns against. A later stage must never rank,
   select or weight images by it.

4. **`--max-frame-gap 8.0 s` may be too tight for real interior work.** Between
   frames of a 5-frame bracket at f/8 ISO 100, the longest exposure can be
   several seconds on its own, and a camera writing 60 MB RAW files to a slow
   card can push the interval past 8 s — especially the transition into the
   brightest frame. If a real shoot shows brackets split across runs, this is
   the first parameter to raise. The default is as specified; it is exposed as
   an option and reported in the JSON.

5. **Sub-second EXIF precision is not universally available and is not
   uniformly formatted.** Some bodies omit `SubSecTimeOriginal` entirely, and
   its digit count varies by manufacturer. Ordering then falls back to
   filename, which is fine for a single body but can misorder a two-body shoot.
   The algorithm never *identifies* brackets by filename, but it does *order*
   by it as a fallback — worth knowing.

6. **Grouping largest-size-first is greedy and can, in principle, mis-split.**
   The specified algorithm is deterministic and explainable, which is the right
   trade for this tool, but it is not globally optimal: a valid 3-frame bracket
   whose frames happen to sit inside a plausible 5-frame window would be
   consumed by the 5-frame pass. In practice the pattern check makes this very
   unlikely (a 5-window overlapping two brackets produces a 0 EV or otherwise
   broken step), and test 6 pins the important direction. I would not replace it
   with a global optimiser — the explainability is worth more.

7. **Minor:** the specification's example output shows `Detected 7 five-shot
   brackets, 1 three-shot bracket` alongside `Found 42 RAW files (2
   unreadable)`, where 7×5 + 1×3 + 2 ungrouped = 40, not 42 — the two
   unreadable files are counted in the total. My implementation follows the
   same accounting (total = grouped + ungrouped, with unreadable files always
   landing in ungrouped).

No later pipeline stage was started. No RAW decoding, alignment, HDR merging
or tone mapping code exists in this step. As noted in the task, this step
produces no preview images because it processes no pixels.
