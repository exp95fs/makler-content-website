"""Command-line interface for the real-estate photo pipeline.

Only the ``detect`` subcommand exists so far.  Later pipeline stages are meant
to be added as further subcommands (``merge``, ``tonemap``, ``export``, ...)
without changing this scaffolding.

Usage::

    python -m real_estate_ai.cli detect <FOLDER> [options]

The input folder is treated as strictly read-only: nothing is ever written
into it, including the ``--json`` report.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections.abc import Sequence
from pathlib import Path

from real_estate_ai import __version__
from real_estate_ai.ingest.bracket_detector import DetectionSettings, detect_brackets
from real_estate_ai.ingest.metadata import discover_raw_files, select_reader
from real_estate_ai.models.bracket import BracketDetectionResult, BracketGroup

__all__ = ["build_parser", "main"]

_SIZE_WORDS = {2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 9: "nine"}


# --------------------------------------------------------------------------
# argument parsing
# --------------------------------------------------------------------------


def _positive_float(text: str) -> float:
    try:
        value = float(text)
    except ValueError as error:
        raise argparse.ArgumentTypeError(f"{text!r} is not a number") from error
    if value <= 0:
        raise argparse.ArgumentTypeError(f"{text!r} must be greater than 0")
    return value


def _unit_float(text: str) -> float:
    try:
        value = float(text)
    except ValueError as error:
        raise argparse.ArgumentTypeError(f"{text!r} is not a number") from error
    if not 0.0 <= value <= 1.0:
        raise argparse.ArgumentTypeError(f"{text!r} must be within [0.0, 1.0]")
    return value


def _size_list(text: str) -> tuple[int, ...]:
    sizes: list[int] = []
    for chunk in text.split(","):
        chunk = chunk.strip()
        if not chunk:
            continue
        try:
            size = int(chunk)
        except ValueError as error:
            raise argparse.ArgumentTypeError(f"{chunk!r} is not an integer") from error
        if size < 2:
            raise argparse.ArgumentTypeError("bracket sizes must be 2 or greater")
        if size not in sizes:
            sizes.append(size)
    if not sizes:
        raise argparse.ArgumentTypeError("at least one bracket size is required")
    return tuple(sizes)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="real-estate-ai",
        description=(
            "Local-only tooling for professional real-estate photography. "
            "Original RAW files are never modified."
        ),
    )
    parser.add_argument("--version", action="version", version=f"real-estate-ai {__version__}")
    subparsers = parser.add_subparsers(dest="command", required=True, metavar="COMMAND")

    detect = subparsers.add_parser(
        "detect",
        help="scan a shooting folder and group the RAW files into exposure brackets",
        description="Read RAW metadata and detect exposure brackets. No pixels are processed.",
    )
    detect.add_argument("folder", metavar="FOLDER", help="shooting folder to scan (read-only)")
    detect.add_argument(
        "--recursive", action="store_true", help="also scan sub-directories"
    )
    detect.add_argument(
        "--sizes",
        type=_size_list,
        default=(5, 3),
        help="candidate bracket sizes, tried in this order (default: 5,3)",
    )
    detect.add_argument(
        "--expected-step",
        type=_positive_float,
        default=2.0,
        help="nominal EV spacing between neighbouring frames (default: 2.0)",
    )
    detect.add_argument(
        "--tolerance",
        type=_positive_float,
        default=0.6,
        help="allowed EV deviation per step and per pattern slot (default: 0.6)",
    )
    detect.add_argument(
        "--max-frame-gap",
        type=_positive_float,
        default=8.0,
        help="seconds between frames that still count as the same burst (default: 8.0)",
    )
    detect.add_argument(
        "--max-bracket-span",
        type=_positive_float,
        default=30.0,
        help="maximum seconds from the first to the last frame of a bracket (default: 30.0)",
    )
    detect.add_argument(
        "--min-confidence",
        type=_unit_float,
        default=0.6,
        help="minimum confidence for a window to be accepted (default: 0.6)",
    )
    detect.add_argument(
        "--backend",
        choices=("auto", "exiftool", "exifread"),
        default="auto",
        help="metadata backend (default: auto - exiftool when on PATH, else exifread)",
    )
    detect.add_argument(
        "--json",
        dest="json_path",
        metavar="FILE",
        help="write the full result as JSON to FILE (never inside FOLDER)",
    )
    detect.add_argument(
        "--verbose",
        action="store_true",
        help="explain why ungrouped files were not grouped",
    )
    detect.set_defaults(handler=cmd_detect)
    return parser


# --------------------------------------------------------------------------
# detect command
# --------------------------------------------------------------------------


def cmd_detect(args: argparse.Namespace, parser: argparse.ArgumentParser) -> int:
    folder = Path(args.folder).expanduser()
    try:
        folder = folder.resolve(strict=True)
    except OSError:
        parser.error(f"folder does not exist: {args.folder}")
    if not folder.is_dir():
        parser.error(f"not a directory: {folder}")

    json_path: Path | None = None
    if args.json_path:
        json_path = Path(args.json_path).expanduser().resolve()
        if _is_inside(json_path, folder):
            parser.error(
                "--json must not point inside the input folder; "
                "the shooting folder is read-only"
            )

    try:
        reader = select_reader(args.backend)
    except RuntimeError as error:
        parser.error(str(error))

    files = discover_raw_files(folder, recursive=args.recursive)
    metadata = reader.read(files)

    settings = DetectionSettings(
        sizes=tuple(args.sizes),
        expected_step=args.expected_step,
        tolerance=args.tolerance,
        max_frame_gap=args.max_frame_gap,
        max_bracket_span=args.max_bracket_span,
        min_confidence=args.min_confidence,
    )
    result = detect_brackets(metadata, settings, backend_used=reader.name)

    for line in format_result(result, verbose=args.verbose):
        print(line)

    if json_path is not None:
        json_path.parent.mkdir(parents=True, exist_ok=True)
        with open(json_path, "w", encoding="utf-8") as handle:
            json.dump(result.to_dict(), handle, indent=2, ensure_ascii=False)
        print(f"\nJSON report written to {json_path}")

    return 0


def _is_inside(candidate: Path, folder: Path) -> bool:
    return candidate == folder or folder in candidate.parents


# --------------------------------------------------------------------------
# human-readable report
# --------------------------------------------------------------------------


def _size_word(size: int) -> str:
    return _SIZE_WORDS.get(size, str(size))


def _plural(count: int, singular: str) -> str:
    return f"{count} {singular}" if count == 1 else f"{count} {singular}s"


def _format_rel_ev(value: float | None) -> str:
    if value is None:
        return "     ? EV"
    if abs(value) < 0.005:
        return f"{0.0:6.2f} EV"
    return f"{value:+6.2f} EV"


def format_group(group: BracketGroup, number: int) -> list[str]:
    heading = f"Bracket {number:03d}  ({group.size} frames, {group.capture_order.label})"
    width = max(len(image.filename) for image in group.images)
    lines = [heading, "-" * max(len(heading), 42)]
    for index, image in enumerate(group.images):
        marker = "   <- reference" if index == group.reference_index else ""
        lines.append(f"  {image.filename:<{width}}  {_format_rel_ev(image.rel_ev)}{marker}")
    parts = group.confidence_parts
    lines.append(
        f"Confidence: {group.confidence:.2f}  "
        f"(spacing {parts.spacing:.2f} / metadata {parts.metadata:.2f} / "
        f"timing {parts.timing:.2f} / consistency {parts.consistency:.2f})"
    )
    return lines


def format_result(result: BracketDetectionResult, verbose: bool = False) -> list[str]:
    stats = result.stats
    total = int(stats.get("total_files", 0))
    unreadable = int(stats.get("unreadable_files", 0))

    lines = [f"Metadata backend: {result.backend_used}"]
    suffix = f" ({unreadable} unreadable)" if unreadable else ""
    lines.append(f"Found {_plural(total, 'RAW file')}{suffix}")

    sizes = result.group_sizes
    if sizes:
        described = ", ".join(
            _plural(count, f"{_size_word(size)}-shot bracket") for size, count in sizes.items()
        )
        lines.append(f"Detected {described}")
    else:
        lines.append("Detected no brackets")
    lines.append(f"Ungrouped RAW files: {len(result.ungrouped_images)}")
    if verbose:
        lines.append(f"Time-based runs: {stats.get('runs', 0)}")
        lines.append(f"Rejected candidate windows: {len(result.rejected_windows)}")

    for number, group in enumerate(result.groups, start=1):
        lines.append("")
        lines.extend(format_group(group, number))

    if result.ungrouped_images and verbose:
        lines.append("")
        lines.append("Ungrouped files")
        lines.append("-" * 42)
        for image in result.ungrouped_images:
            lines.append(f"  {image.filename}")
            for error in image.metadata.read_errors:
                lines.append(f"      metadata: {error}")
            rejections = result.rejections_for(image.filename)
            if not rejections:
                lines.append("      no candidate window contained this frame")
            for window in rejections:
                if window.size >= 2:
                    lines.append(f"      {window.size}-frame window rejected: {window.reason}")
                else:
                    lines.append(f"      {window.reason}")
    elif result.ungrouped_images:
        lines.append("")
        lines.append("Re-run with --verbose to see why these files were not grouped.")

    return lines


# --------------------------------------------------------------------------
# entry point
# --------------------------------------------------------------------------


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    handler = getattr(args, "handler", None)
    if handler is None:  # pragma: no cover - argparse enforces a subcommand
        parser.error("no command given")
    return int(handler(args, parser))


if __name__ == "__main__":
    sys.exit(main())
