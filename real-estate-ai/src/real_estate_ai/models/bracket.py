"""Typed data model for the ingest stage of the real-estate photo pipeline.

Everything in this module is plain data: frozen dataclasses, enums and
serialisation helpers.  It deliberately has no dependency on the metadata
backends or on the bracket detector, so that both can be swapped or tested
in isolation.

Sign convention used throughout the project
-------------------------------------------
``ev_setting`` is the exposure value of the *camera setting*.  A HIGHER
``ev_setting`` means LESS light on the sensor, i.e. a DARKER frame.

``rel_ev`` is the brightness offset relative to the reference frame of a
group and therefore runs in the OPPOSITE direction::

    rel_ev(i) = ev_setting(reference) - ev_setting(i)

A positive ``rel_ev`` is a brighter frame.  ``BracketGroup.images`` is
always ordered dark -> bright, i.e. by ascending ``rel_ev``.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import StrEnum
from pathlib import Path
from typing import Any

__all__ = [
    "BracketDetectionResult",
    "BracketGroup",
    "BracketImage",
    "CaptureOrder",
    "ConfidenceParts",
    "ConfidenceWeights",
    "RawFileMetadata",
    "RejectedWindow",
]


def _epoch_seconds(moment: datetime | None) -> float | None:
    """Return a comparable epoch-second value for naive *and* aware datetimes.

    EXIF timestamps are naive unless the file carries ``OffsetTimeOriginal``.
    Mixing naive and aware datetimes in a single sort raises ``TypeError``, so
    every ordering and gap computation in the pipeline goes through this
    helper.  Naive timestamps are interpreted as UTC; that is arbitrary but
    harmless because only *differences* between frames of the same shoot are
    ever used.
    """
    if moment is None:
        return None
    if moment.tzinfo is None:
        return moment.replace(tzinfo=UTC).timestamp()
    return moment.timestamp()


class CaptureOrder(StrEnum):
    """The order in which the frames of a bracket were actually shot."""

    DARK_TO_BRIGHT = "dark_to_bright"
    BRIGHT_TO_DARK = "bright_to_dark"
    UNKNOWN = "unknown"

    @property
    def label(self) -> str:
        return {
            CaptureOrder.DARK_TO_BRIGHT: "dark -> bright",
            CaptureOrder.BRIGHT_TO_DARK: "bright -> dark",
            CaptureOrder.UNKNOWN: "unknown order",
        }[self]


@dataclass(frozen=True, slots=True)
class RawFileMetadata:
    """Metadata of a single camera RAW file.

    Every field except ``path``, ``filename``, ``file_size`` and ``backend``
    may be ``None``: unreadable or incomplete metadata is a normal, expected
    condition and must never remove a file from the result.
    """

    path: Path
    filename: str
    file_size: int
    timestamp: datetime | None = None
    shutter_seconds: float | None = None
    aperture: float | None = None
    iso: int | None = None
    exposure_compensation: float | None = None
    camera_make: str | None = None
    camera_model: str | None = None
    width: int | None = None
    height: int | None = None
    backend: str = "unknown"
    read_errors: tuple[str, ...] = ()

    @property
    def has_exposure_triplet(self) -> bool:
        """True when shutter, aperture and ISO are all present and usable."""
        return (
            self.shutter_seconds is not None
            and self.shutter_seconds > 0
            and self.aperture is not None
            and self.aperture > 0
            and self.iso is not None
            and self.iso > 0
        )

    @property
    def is_readable(self) -> bool:
        """True when the file yielded enough metadata to compute an EV value."""
        return self.has_exposure_triplet

    @property
    def camera_id(self) -> tuple[str, str]:
        """Make/model pair used to check that a window is from one body."""
        return (self.camera_make or "", self.camera_model or "")

    @property
    def timestamp_seconds(self) -> float | None:
        """Capture time as epoch seconds, safe to compare across files."""
        return _epoch_seconds(self.timestamp)

    def to_dict(self) -> dict[str, Any]:
        return {
            "path": str(self.path),
            "filename": self.filename,
            "file_size": self.file_size,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "shutter_seconds": self.shutter_seconds,
            "aperture": self.aperture,
            "iso": self.iso,
            "exposure_compensation": self.exposure_compensation,
            "camera_make": self.camera_make,
            "camera_model": self.camera_model,
            "width": self.width,
            "height": self.height,
            "backend": self.backend,
            "read_errors": list(self.read_errors),
        }


@dataclass(frozen=True, slots=True)
class BracketImage:
    """A RAW file together with its computed exposure values.

    ``ev_setting`` is ``None`` when the exposure triplet is incomplete.
    ``rel_ev`` is ``None`` until the image has been placed into a group.
    """

    metadata: RawFileMetadata
    ev_setting: float | None = None
    rel_ev: float | None = None

    @property
    def filename(self) -> str:
        return self.metadata.filename

    @property
    def path(self) -> Path:
        return self.metadata.path

    def with_rel_ev(self, rel_ev: float) -> BracketImage:
        return BracketImage(metadata=self.metadata, ev_setting=self.ev_setting, rel_ev=rel_ev)

    def to_dict(self) -> dict[str, Any]:
        return {
            "metadata": self.metadata.to_dict(),
            "ev_setting": self.ev_setting,
            "rel_ev": self.rel_ev,
        }


@dataclass(frozen=True, slots=True)
class ConfidenceWeights:
    """Weights of the four confidence sub-scores.  They must sum to 1.0."""

    spacing: float = 0.40
    metadata: float = 0.20
    timing: float = 0.15
    consistency: float = 0.25

    def __post_init__(self) -> None:
        total = self.spacing + self.metadata + self.timing + self.consistency
        if abs(total - 1.0) > 1e-9:
            raise ValueError(f"confidence weights must sum to 1.0, got {total!r}")

    def combine(self, parts: ConfidenceParts) -> float:
        value = (
            self.spacing * parts.spacing
            + self.metadata * parts.metadata
            + self.timing * parts.timing
            + self.consistency * parts.consistency
        )
        return max(0.0, min(1.0, value))

    def to_dict(self) -> dict[str, float]:
        return {
            "spacing": self.spacing,
            "metadata": self.metadata,
            "timing": self.timing,
            "consistency": self.consistency,
        }


@dataclass(frozen=True, slots=True)
class ConfidenceParts:
    """The four explainable sub-scores behind a group's confidence value."""

    spacing: float
    metadata: float
    timing: float
    consistency: float

    def to_dict(self) -> dict[str, float]:
        return {
            "spacing": self.spacing,
            "metadata": self.metadata,
            "timing": self.timing,
            "consistency": self.consistency,
        }


@dataclass(frozen=True, slots=True)
class BracketGroup:
    """A detected exposure bracket.

    ``images`` is ordered dark -> bright.  ``reference_index`` points at the
    frame whose ``ev_setting`` is the median of the group; by construction its
    ``rel_ev`` is 0.0.

    The confidence score describes only how plausibly the metadata of these
    frames forms a bracket. It says nothing about image quality and must never
    be used as a quality metric.
    """

    images: tuple[BracketImage, ...]
    reference_index: int
    size: int
    capture_order: CaptureOrder
    detected_rel_evs: tuple[float, ...]
    confidence: float
    confidence_parts: ConfidenceParts
    timestamp: datetime | None = None

    @property
    def reference_image(self) -> BracketImage:
        """The median-exposure frame of the group (``rel_ev == 0``)."""
        return self.images[self.reference_index]

    @property
    def filenames(self) -> tuple[str, ...]:
        return tuple(image.filename for image in self.images)

    def to_dict(self) -> dict[str, Any]:
        return {
            "size": self.size,
            "capture_order": self.capture_order.value,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "reference_index": self.reference_index,
            "reference_filename": self.reference_image.filename,
            "detected_rel_evs": list(self.detected_rel_evs),
            "confidence": self.confidence,
            "confidence_parts": self.confidence_parts.to_dict(),
            "images": [image.to_dict() for image in self.images],
        }


@dataclass(frozen=True, slots=True)
class RejectedWindow:
    """A candidate window that was evaluated and turned down, with the reason.

    ``size`` is carried alongside the filenames so the CLI can explain *which*
    pass rejected a frame (the 5-frame pass and the 3-frame pass reject for
    different reasons).
    """

    filenames: tuple[str, ...]
    reason: str
    size: int = 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "filenames": list(self.filenames),
            "reason": self.reason,
            "size": self.size,
        }


@dataclass(frozen=True, slots=True)
class BracketDetectionResult:
    """Everything the ingest stage knows about one shooting folder."""

    groups: tuple[BracketGroup, ...] = ()
    ungrouped_images: tuple[BracketImage, ...] = ()
    rejected_windows: tuple[RejectedWindow, ...] = ()
    backend_used: str = "unknown"
    stats: dict[str, Any] = field(default_factory=dict)

    @property
    def group_sizes(self) -> dict[int, int]:
        counts: dict[int, int] = {}
        for group in self.groups:
            counts[group.size] = counts.get(group.size, 0) + 1
        return dict(sorted(counts.items(), reverse=True))

    def rejections_for(self, filename: str) -> tuple[RejectedWindow, ...]:
        """Every rejected window that contained *filename*."""
        return tuple(w for w in self.rejected_windows if filename in w.filenames)

    def to_dict(self) -> dict[str, Any]:
        return {
            "backend_used": self.backend_used,
            "stats": self.stats,
            "groups": [group.to_dict() for group in self.groups],
            "ungrouped_images": [image.to_dict() for image in self.ungrouped_images],
            "rejected_windows": [window.to_dict() for window in self.rejected_windows],
        }
