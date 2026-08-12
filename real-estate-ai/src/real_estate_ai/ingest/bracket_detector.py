"""Deterministic exposure-bracket detection.

The detector consumes :class:`RawFileMetadata` records - it never touches
files or pixels - so it can be exercised entirely with synthetic metadata and
is completely independent of which backend produced that metadata.

Algorithm
---------
1. Sort all files by ``(timestamp, filename)``, sub-second precision included.
   Files without a timestamp go to the end and can only be ordered by name.
2. Segment the sorted list into *runs*: a new run starts whenever the gap to
   the previous frame exceeds ``max_frame_gap``.  A bracket is shot as a
   burst; afterwards the photographer moves the tripod.
3. Grouping passes, largest candidate size first (default 5, then 3).  Inside
   each run, walk left to right over the not-yet-consumed frames; evaluate the
   window of the next ``size`` consecutive unconsumed frames.  Accept it when
   its confidence reaches ``min_confidence`` and continue behind it; otherwise
   record the rejection reason and advance by one frame.
4. Whatever is left over becomes ``ungrouped_images``.
5. A frame can never end up in two groups; this is asserted at the end.

Filename numbering is never used to identify a bracket - only capture time,
camera identity and computed exposure values.

The confidence score describes only how plausibly the metadata of these frames
forms a bracket. It says nothing about image quality and must never be used as
a quality metric.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, replace
from datetime import datetime

from real_estate_ai.ingest.exposure import (
    ev_setting_for_metadata,
    expected_rel_ev_pattern,
    reference_position,
    relative_ev,
)
from real_estate_ai.models.bracket import (
    BracketDetectionResult,
    BracketGroup,
    BracketImage,
    CaptureOrder,
    ConfidenceParts,
    ConfidenceWeights,
    RawFileMetadata,
    RejectedWindow,
)

__all__ = [
    "BracketDetectionError",
    "DetectionSettings",
    "detect_brackets",
]

#: A bracket shot within this many seconds gets the full timing sub-score.
FULL_TIMING_SPAN_SECONDS = 5.0

#: Timing sub-score used when at least one frame has no timestamp: the timing
#: of the window can then neither be confirmed nor ruled out.
UNVERIFIABLE_TIMING_SCORE = 0.5


class BracketDetectionError(RuntimeError):
    """Raised when the detector violates one of its own invariants."""


@dataclass(frozen=True, slots=True)
class DetectionSettings:
    """Tunables of the detector.

    ``sizes`` is a parameter so that 7- or 9-frame brackets can be supported
    later without touching the algorithm; candidate sizes are tried in the
    given order (largest first by convention).
    """

    sizes: tuple[int, ...] = (5, 3)
    expected_step: float = 2.0
    tolerance: float = 0.6
    max_frame_gap: float = 8.0
    max_bracket_span: float = 30.0
    min_confidence: float = 0.6
    weights: ConfidenceWeights = ConfidenceWeights()

    def __post_init__(self) -> None:
        if not self.sizes:
            raise ValueError("at least one candidate group size is required")
        if any(size < 2 for size in self.sizes):
            raise ValueError("candidate group sizes must be >= 2")
        if self.expected_step <= 0:
            raise ValueError("expected_step must be positive")
        if self.tolerance <= 0:
            raise ValueError("tolerance must be positive")
        if self.max_bracket_span <= 0 or self.max_frame_gap <= 0:
            raise ValueError("max_frame_gap and max_bracket_span must be positive")
        if not 0.0 <= self.min_confidence <= 1.0:
            raise ValueError("min_confidence must be within [0.0, 1.0]")


# --------------------------------------------------------------------------
# entry point
# --------------------------------------------------------------------------


def detect_brackets(
    metadata: Sequence[RawFileMetadata],
    settings: DetectionSettings | None = None,
    backend_used: str = "unknown",
) -> BracketDetectionResult:
    """Group RAW metadata records into exposure brackets."""
    settings = settings or DetectionSettings()
    images = [
        BracketImage(metadata=record, ev_setting=ev_setting_for_metadata(record))
        for record in metadata
    ]

    order = sorted(range(len(images)), key=lambda index: _sort_key(images[index]))
    runs = _segment_runs(order, images, settings.max_frame_gap)

    consumed: set[int] = set()
    groups: list[tuple[int, BracketGroup]] = []
    rejected: list[RejectedWindow] = []

    for size in settings.sizes:
        for run in runs:
            available = [index for index in run if index not in consumed]
            position = 0
            while position + size <= len(available):
                window = available[position : position + size]
                group, reason = _evaluate_window(window, images, settings)
                if group is not None:
                    groups.append((window[0], group))
                    consumed.update(window)
                    position += size
                else:
                    rejected.append(
                        RejectedWindow(
                            filenames=tuple(images[index].filename for index in window),
                            reason=reason or "rejected",
                            size=size,
                        )
                    )
                    position += 1

    # A burst that is simply too short for the smallest candidate size never
    # produced a window, so it never produced a rejection reason either.
    # Record one explicitly - "nothing to group it with" is the most common
    # explanation on a real shoot and the user needs to see it.
    smallest = min(settings.sizes)
    for run in runs:
        leftover = [index for index in run if index not in consumed]
        if leftover and len(leftover) < smallest:
            rejected.append(
                RejectedWindow(
                    filenames=tuple(images[index].filename for index in leftover),
                    reason=(
                        f"only {_plural(len(leftover), 'frame')} left in this burst; "
                        f"the smallest candidate bracket needs {smallest}"
                    ),
                    size=len(leftover),
                )
            )

    # Groups are reported in capture order, not in "size pass" order.
    sort_positions = {index: rank for rank, index in enumerate(order)}
    ordered_groups = tuple(
        group for _, group in sorted(groups, key=lambda item: sort_positions[item[0]])
    )
    ungrouped = tuple(images[index] for index in order if index not in consumed)

    _assert_no_frame_reused(ordered_groups)

    unreadable = sum(1 for image in images if not image.metadata.has_exposure_triplet)
    stats = {
        "total_files": len(images),
        "readable_files": len(images) - unreadable,
        "unreadable_files": unreadable,
        "runs": len(runs),
        "groups": len(ordered_groups),
        "groups_by_size": {
            str(size): count
            for size, count in sorted(
                _count_sizes(ordered_groups).items(), reverse=True
            )
        },
        "grouped_files": sum(group.size for group in ordered_groups),
        "ungrouped_files": len(ungrouped),
        "rejected_windows": len(rejected),
        "settings": {
            "sizes": list(settings.sizes),
            "expected_step": settings.expected_step,
            "tolerance": settings.tolerance,
            "max_frame_gap": settings.max_frame_gap,
            "max_bracket_span": settings.max_bracket_span,
            "min_confidence": settings.min_confidence,
            "weights": settings.weights.to_dict(),
        },
    }

    return BracketDetectionResult(
        groups=ordered_groups,
        ungrouped_images=ungrouped,
        rejected_windows=tuple(rejected),
        backend_used=backend_used,
        stats=stats,
    )


# --------------------------------------------------------------------------
# ordering and segmentation
# --------------------------------------------------------------------------


def _plural(count: int, singular: str) -> str:
    return f"{count} {singular}" if count == 1 else f"{count} {singular}s"


def _sort_key(image: BracketImage) -> tuple[int, float, str]:
    """Sort by capture time, then filename; untimed files go last."""
    seconds = image.metadata.timestamp_seconds
    if seconds is None:
        return (1, 0.0, image.filename.lower())
    return (0, seconds, image.filename.lower())


def _segment_runs(
    order: Sequence[int],
    images: Sequence[BracketImage],
    max_frame_gap: float,
) -> list[list[int]]:
    """Split the sorted frame indices into bursts separated by time gaps."""
    runs: list[list[int]] = []
    current: list[int] = []
    previous_seconds: float | None = None
    previous_had_time = False

    for index in order:
        seconds = images[index].metadata.timestamp_seconds
        has_time = seconds is not None
        if not current:
            current = [index]
        elif has_time != previous_had_time:
            # Boundary between timed and untimed frames: no gap can be computed.
            runs.append(current)
            current = [index]
        elif not has_time:
            # Untimed frames stay together and are ordered by filename only.
            current.append(index)
        else:
            assert seconds is not None and previous_seconds is not None
            if seconds - previous_seconds > max_frame_gap:
                runs.append(current)
                current = [index]
            else:
                current.append(index)
        previous_seconds = seconds
        previous_had_time = has_time

    if current:
        runs.append(current)
    return runs


# --------------------------------------------------------------------------
# window evaluation
# --------------------------------------------------------------------------


def _evaluate_window(
    window: Sequence[int],
    images: Sequence[BracketImage],
    settings: DetectionSettings,
) -> tuple[BracketGroup | None, str | None]:
    """Decide whether *window* is a bracket.

    Returns ``(group, None)`` on acceptance and ``(None, reason)`` otherwise.
    The reason string is user-facing: it ends up verbatim in ``--verbose``
    output, so it names the offending values.
    """
    size = len(window)
    candidates = [images[index] for index in window]
    names = ", ".join(image.filename for image in candidates)

    # -- 1. every frame needs a computable EV_setting ---------------------
    complete = [image.metadata.has_exposure_triplet for image in candidates]
    metadata_score = sum(complete) / size
    if not all(complete):
        missing = ", ".join(
            image.filename for image, ok in zip(candidates, complete, strict=True) if not ok
        )
        return None, f"incomplete exposure metadata (shutter/aperture/ISO) in: {missing}"

    ev_values = [image.ev_setting for image in candidates]
    assert all(value is not None for value in ev_values)
    ev_values = [float(value) for value in ev_values]  # type: ignore[arg-type]

    # -- 2. one camera body ------------------------------------------------
    cameras = {image.metadata.camera_id for image in candidates}
    if len(cameras) > 1:
        listed = " / ".join(
            sorted(" ".join(part for part in camera if part) or "unknown" for camera in cameras)
        )
        return None, f"frames come from different cameras ({listed}): {names}"

    # -- 3. capture span ---------------------------------------------------
    span = _window_span(candidates)
    if span is not None and span > settings.max_bracket_span:
        return None, (
            f"capture span {span:.1f} s exceeds the maximum bracket span "
            f"of {settings.max_bracket_span:.1f} s: {names}"
        )

    # -- 4. EV steps -------------------------------------------------------
    dark_to_bright = sorted(range(size), key=lambda i: -ev_values[i])
    sorted_evs = [ev_values[i] for i in dark_to_bright]
    steps = [sorted_evs[i] - sorted_evs[i + 1] for i in range(size - 1)]
    bad_steps = [
        step for step in steps if abs(step - settings.expected_step) > settings.tolerance
    ]
    if bad_steps:
        printed = ", ".join(f"{step:.2f}" for step in steps)
        return None, (
            f"EV steps [{printed}] do not match the expected "
            f"{settings.expected_step:.1f} +/- {settings.tolerance:.1f} EV: {names}"
        )

    # -- 5. normalised pattern --------------------------------------------
    reference = reference_position(size)
    reference_ev = sorted_evs[reference]
    rel_evs = tuple(relative_ev(reference_ev, value) for value in sorted_evs)
    expected = expected_rel_ev_pattern(size, settings.expected_step)
    if any(
        abs(actual - nominal) > settings.tolerance
        for actual, nominal in zip(rel_evs, expected, strict=True)
    ):
        printed = ", ".join(f"{value:+.2f}" for value in rel_evs)
        wanted = ", ".join(f"{value:+.1f}" for value in expected)
        return None, (
            f"relative EV pattern [{printed}] does not match the expected "
            f"{size}-frame pattern [{wanted}]: {names}"
        )

    # -- 6. confidence -----------------------------------------------------
    parts = _confidence_parts(
        steps=steps,
        metadata_score=metadata_score,
        span=span,
        candidates=candidates,
        settings=settings,
    )
    confidence = settings.weights.combine(parts)
    if confidence < settings.min_confidence:
        return None, (
            f"confidence {confidence:.2f} is below the minimum of "
            f"{settings.min_confidence:.2f} (spacing {parts.spacing:.2f} / "
            f"metadata {parts.metadata:.2f} / timing {parts.timing:.2f} / "
            f"consistency {parts.consistency:.2f}): {names}"
        )

    ordered_images = tuple(
        replace(candidates[i], rel_ev=rel_evs[position])
        for position, i in enumerate(dark_to_bright)
    )
    group = BracketGroup(
        images=ordered_images,
        reference_index=reference,
        size=size,
        capture_order=_capture_order(ev_values),
        detected_rel_evs=rel_evs,
        confidence=confidence,
        confidence_parts=parts,
        timestamp=_earliest_timestamp(candidates),
    )
    return group, None


def _window_span(candidates: Sequence[BracketImage]) -> float | None:
    """Seconds between the first and the last frame, or ``None`` if untimed."""
    seconds = [image.metadata.timestamp_seconds for image in candidates]
    if any(value is None for value in seconds):
        return None
    values = [float(value) for value in seconds]  # type: ignore[arg-type]
    return max(values) - min(values)


def _earliest_timestamp(candidates: Sequence[BracketImage]) -> datetime | None:
    timed = [image.metadata for image in candidates if image.metadata.timestamp is not None]
    if not timed:
        return None
    # Sort on the normalised epoch value so naive and aware datetimes mix safely.
    earliest = min(timed, key=lambda record: record.timestamp_seconds or 0.0)
    return earliest.timestamp


def _capture_order(ev_values: Sequence[float]) -> CaptureOrder:
    """Which way the photographer bracketed, judged from capture order."""
    if ev_values[0] > ev_values[-1]:
        return CaptureOrder.DARK_TO_BRIGHT  # EV_setting falls -> frames get brighter
    if ev_values[0] < ev_values[-1]:
        return CaptureOrder.BRIGHT_TO_DARK
    return CaptureOrder.UNKNOWN


# --------------------------------------------------------------------------
# confidence
# --------------------------------------------------------------------------


def _confidence_parts(
    steps: Sequence[float],
    metadata_score: float,
    span: float | None,
    candidates: Sequence[BracketImage],
    settings: DetectionSettings,
) -> ConfidenceParts:
    """Compute the four explainable sub-scores of the confidence value.

    ``spacing``
        Mean over all EV steps of ``1 - |step - expected| / tolerance``,
        clamped at 0.  A perfect 2.00 EV step scores 1.0, a step off by the
        full tolerance scores 0.0.
    ``metadata``
        Fraction of frames with a complete shutter/aperture/ISO triplet.  For
        an accepted group this is 1.0 by construction (an incomplete window is
        rejected earlier); it is still reported because it explains rejections.
    ``timing``
        1.0 for a capture span up to 5 s, decaying linearly to 0.0 at
        ``max_bracket_span``.  0.5 when at least one frame has no timestamp
        and the span therefore cannot be verified.
    ``consistency``
        Aperture and ISO identical across the group; each contributes half.

    The confidence score describes only how plausibly the metadata of these
    frames forms a bracket. It says nothing about image quality and must never
    be used as a quality metric.
    """
    if steps:
        spacing = sum(
            max(0.0, 1.0 - abs(step - settings.expected_step) / settings.tolerance)
            for step in steps
        ) / len(steps)
    else:  # pragma: no cover - a window always has >= 2 frames
        spacing = 0.0

    apertures = {
        round(image.metadata.aperture, 2)
        for image in candidates
        if image.metadata.aperture is not None
    }
    isos = {image.metadata.iso for image in candidates if image.metadata.iso is not None}
    consistency = 0.5 * float(len(apertures) <= 1) + 0.5 * float(len(isos) <= 1)

    return ConfidenceParts(
        spacing=round(spacing, 4),
        metadata=round(metadata_score, 4),
        timing=round(_timing_score(span, settings.max_bracket_span), 4),
        consistency=round(consistency, 4),
    )


def _timing_score(span: float | None, max_bracket_span: float) -> float:
    if span is None:
        return UNVERIFIABLE_TIMING_SCORE
    if span <= FULL_TIMING_SPAN_SECONDS:
        return 1.0
    if max_bracket_span <= FULL_TIMING_SPAN_SECONDS or span >= max_bracket_span:
        return 0.0
    decay = (span - FULL_TIMING_SPAN_SECONDS) / (max_bracket_span - FULL_TIMING_SPAN_SECONDS)
    return max(0.0, 1.0 - decay)


# --------------------------------------------------------------------------
# invariants
# --------------------------------------------------------------------------


def _count_sizes(groups: Sequence[BracketGroup]) -> dict[int, int]:
    counts: dict[int, int] = {}
    for group in groups:
        counts[group.size] = counts.get(group.size, 0) + 1
    return counts


def _assert_no_frame_reused(groups: Sequence[BracketGroup]) -> None:
    """A frame may never appear in more than one group."""
    seen: set[str] = set()
    for group in groups:
        for image in group.images:
            key = str(image.metadata.path)
            if key in seen:
                raise BracketDetectionError(
                    f"frame {image.filename} was assigned to more than one bracket"
                )
            seen.add(key)
