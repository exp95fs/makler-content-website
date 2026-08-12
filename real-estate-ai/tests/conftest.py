"""Shared factories for synthetic RAW metadata.

The bracket detector consumes ``RawFileMetadata`` records, so the whole
grouping algorithm can be tested without a single real RAW file.  Frames are
described by the ``EV_setting`` they should have; the matching shutter speed
is derived from it, which keeps the tests honest about the EV formula instead
of hard-coding exposure times.
"""

from __future__ import annotations

import struct
from datetime import datetime, timedelta
from fractions import Fraction
from pathlib import Path

import pytest

from real_estate_ai.ingest.exposure import shutter_seconds_for_ev
from real_estate_ai.models.bracket import RawFileMetadata

BASE_TIME = datetime(2026, 3, 14, 10, 30, 0)
DEFAULT_MAKE = "SONY"
DEFAULT_MODEL = "ILCE-7RM4"


def make_metadata(
    filename: str,
    ev_setting: float | None = 13.0,
    *,
    offset_seconds: float = 0.0,
    timestamp: datetime | None = None,
    no_timestamp: bool = False,
    aperture: float | None = 8.0,
    iso: int | None = 100,
    shutter_seconds: float | None = None,
    exposure_compensation: float | None = 0.0,
    camera_make: str | None = DEFAULT_MAKE,
    camera_model: str | None = DEFAULT_MODEL,
    directory: str = "/shoot",
    backend: str = "synthetic",
    read_errors: tuple[str, ...] = (),
) -> RawFileMetadata:
    """Build one synthetic metadata record.

    *ev_setting* is the desired camera ``EV_setting``; the shutter time is
    computed from it unless *shutter_seconds* is given explicitly.  Pass
    ``ev_setting=None`` together with ``shutter_seconds=None`` to model a file
    whose exposure time could not be read, and ``no_timestamp=True`` to model
    one whose capture time could not be read.
    """
    if shutter_seconds is None and ev_setting is not None:
        shutter_seconds = shutter_seconds_for_ev(
            ev_setting, aperture=aperture or 8.0, iso=iso or 100
        )
    if no_timestamp:
        timestamp = None
    elif timestamp is None:
        timestamp = BASE_TIME + timedelta(seconds=offset_seconds)

    return RawFileMetadata(
        path=Path(directory) / filename,
        filename=filename,
        file_size=50_000_000,
        timestamp=timestamp,
        shutter_seconds=shutter_seconds,
        aperture=aperture,
        iso=iso,
        exposure_compensation=exposure_compensation,
        camera_make=camera_make,
        camera_model=camera_model,
        width=9504,
        height=6336,
        backend=backend,
        read_errors=read_errors,
    )


def make_bracket(
    start_number: int,
    rel_evs: list[float],
    *,
    start_offset: float = 0.0,
    frame_interval: float = 0.8,
    reference_ev: float = 13.0,
    prefix: str = "DSC",
    extension: str = ".ARW",
    **kwargs: object,
) -> list[RawFileMetadata]:
    """Build a burst of frames in capture order.

    *rel_evs* are brightness offsets: ``-4`` is the dark frame, ``+4`` the
    bright one.  They are converted to ``EV_setting`` values with
    ``EV_setting = reference_ev - rel_ev`` so that the sign convention of the
    production code is mirrored, not re-implemented.
    """
    frames = []
    for index, rel_ev in enumerate(rel_evs):
        frames.append(
            make_metadata(
                f"{prefix}{start_number + index:05d}{extension}",
                ev_setting=reference_ev - rel_ev,
                offset_seconds=start_offset + index * frame_interval,
                **kwargs,  # type: ignore[arg-type]
            )
        )
    return frames


# --------------------------------------------------------------------------
# real EXIF on disk, for the tests that must exercise a backend end to end
# --------------------------------------------------------------------------

#: A real Sony shutter ladder, nominally 2 EV apart, dark -> bright.  The
#: values are quantised the way a camera quantises them, so tests that use it
#: see the same small deviations a real shoot produces.
SHUTTER_LADDER_5 = [Fraction(1, 250), Fraction(1, 60), Fraction(1, 15), Fraction(1, 4), Fraction(1)]
SHUTTER_LADDER_3 = [Fraction(1, 125), Fraction(1, 30), Fraction(1, 8)]


def build_exif_tiff(
    *,
    exposure: Fraction = Fraction(1, 250),
    fnumber: Fraction = Fraction(8),
    iso: int = 100,
    date: str = "2026:03:14 10:30:00",
    subsec: str = "000000",
    make: str = DEFAULT_MAKE,
    model: str = DEFAULT_MODEL,
    width: int = 9504,
    height: int = 6336,
) -> bytes:
    """Build a minimal little-endian TIFF carrying a genuine EXIF IFD.

    Camera RAW files are TIFF containers, so a real EXIF parser accepts this.
    It lets the backends and the CLI be tested against actual parsing instead
    of a mock.  Note that ASCII values of four bytes or fewer would have to be
    stored inline in the IFD entry, so callers must keep *subsec* longer than
    that (six digits is the convention used here).
    """
    strings: list[bytes] = []
    string_offsets: dict[str, int] = {}
    rationals: list[tuple[int, int, bool]] = []

    ifd0_entries = 5  # ImageWidth, ImageLength, Make, Model, ExifIFDPointer
    exif_entries = 6  # ExposureTime, FNumber, ISO, DateTimeOriginal, Bias, SubSec
    ifd0_offset = 8
    exif_offset = ifd0_offset + 2 + ifd0_entries * 12 + 4
    values_offset = exif_offset + 2 + exif_entries * 12 + 4

    def add_string(text: str) -> int:
        if text not in string_offsets:
            string_offsets[text] = values_offset + sum(len(item) for item in strings)
            strings.append(text.encode("ascii") + b"\x00")
        return string_offsets[text]

    make_offset = add_string(make)
    model_offset = add_string(model)
    date_offset = add_string(date)
    subsec_offset = add_string(subsec)
    strings_length = sum(len(item) for item in strings)

    def add_rational(value: Fraction, signed: bool = False) -> int:
        offset = values_offset + strings_length + len(rationals) * 8
        rationals.append((value.numerator, value.denominator, signed))
        return offset

    exposure_offset = add_rational(exposure)
    fnumber_offset = add_rational(fnumber)
    bias_offset = add_rational(Fraction(0), signed=True)

    def entry(tag: int, kind: int, count: int, payload: int) -> bytes:
        return struct.pack("<HHII", tag, kind, count, payload)

    ifd0 = struct.pack("<H", ifd0_entries)
    ifd0 += entry(0x0100, 4, 1, width)  # ImageWidth
    ifd0 += entry(0x0101, 4, 1, height)  # ImageLength
    ifd0 += entry(0x010F, 2, len(make) + 1, make_offset)  # Make
    ifd0 += entry(0x0110, 2, len(model) + 1, model_offset)  # Model
    ifd0 += entry(0x8769, 4, 1, exif_offset)  # ExifIFDPointer
    ifd0 += struct.pack("<I", 0)

    exif = struct.pack("<H", exif_entries)
    exif += entry(0x829A, 5, 1, exposure_offset)  # ExposureTime
    exif += entry(0x829D, 5, 1, fnumber_offset)  # FNumber
    exif += entry(0x8827, 3, 1, iso)  # ISOSpeedRatings
    exif += entry(0x9003, 2, len(date) + 1, date_offset)  # DateTimeOriginal
    exif += entry(0x9204, 10, 1, bias_offset)  # ExposureBiasValue (signed)
    exif += entry(0x9291, 2, len(subsec) + 1, subsec_offset)  # SubSecTimeOriginal
    exif += struct.pack("<I", 0)

    blob = b"".join(strings)
    for numerator, denominator, signed in rationals:
        blob += struct.pack("<ii" if signed else "<II", numerator, denominator)

    return b"II" + struct.pack("<HI", 42, ifd0_offset) + ifd0 + exif + blob


def write_exif_bracket(
    folder: Path,
    start_number: int,
    ladder: list[Fraction],
    *,
    start_second: int = 0,
    prefix: str = "DSC",
    extension: str = ".ARW",
    **kwargs: object,
) -> list[Path]:
    """Write a burst of RAW files with real EXIF, one frame per second."""
    folder.mkdir(parents=True, exist_ok=True)
    written = []
    for index, exposure in enumerate(ladder):
        minute, second = divmod(start_second + index, 60)
        target = folder / f"{prefix}{start_number + index:05d}{extension}"
        target.write_bytes(
            build_exif_tiff(
                exposure=exposure,
                date=f"2026:03:14 {10 + minute // 60:02d}:{30 + minute % 60:02d}:{second:02d}",
                subsec=f"{index * 15:02d}0000",
                **kwargs,  # type: ignore[arg-type]
            )
        )
        written.append(target)
    return written


@pytest.fixture
def bracket_factory():
    return make_bracket


@pytest.fixture
def metadata_factory():
    return make_metadata
