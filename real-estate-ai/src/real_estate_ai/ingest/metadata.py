"""RAW file discovery and metadata reading.

Two interchangeable backends are provided behind the :class:`MetadataReader`
protocol:

``ExifToolReader``
    Shells out to the external ``exiftool`` binary.  Preferred backend: it is
    the only reliable way to read CR3 and other newer proprietary formats.
    The binary is invoked ONCE for the whole batch, never once per file.

``ExifReadReader``
    Pure-Python fallback based on ``exifread``.  Works for classic TIFF-based
    RAW formats (ARW, CR2, NEF, DNG, ...) but cannot read CR3.

Both backends open files strictly read-only and never write anything.  A file
whose metadata cannot be read is still returned, with ``None`` fields and a
populated ``read_errors`` tuple - files are never silently dropped and a
failure never raises out of a reader.
"""

from __future__ import annotations

import contextlib
import json
import logging
import os
import re
import shutil
import subprocess
from collections.abc import Iterable, Iterator, Sequence
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Protocol, runtime_checkable

from real_estate_ai.models.bracket import RawFileMetadata

__all__ = [
    "ExifReadReader",
    "ExifToolReader",
    "MetadataReader",
    "NullMetadataReader",
    "RAW_EXTENSIONS",
    "discover_raw_files",
    "is_raw_file",
    "parse_exif_timestamp",
    "select_reader",
]

#: Camera RAW extensions this project understands, lower-case.
RAW_EXTENSIONS: frozenset[str] = frozenset(
    {".arw", ".cr2", ".cr3", ".nef", ".dng", ".raf", ".orf", ".rw2", ".pef", ".srw"}
)

#: Files that are ignored even if something renamed them to a RAW extension.
IGNORED_FILENAMES: frozenset[str] = frozenset({".ds_store", "thumbs.db", "desktop.ini"})

_ZERO_TIMESTAMPS = frozenset({"0000:00:00 00:00:00", "    :  :     :  :  ", ""})


# --------------------------------------------------------------------------
# discovery
# --------------------------------------------------------------------------


def is_raw_file(path: Path) -> bool:
    """True when *path* looks like a camera RAW file we support.

    Hidden files (leading dot), OS junk files and every non-RAW extension
    (JPEG, TIFF, XMP sidecars, ...) are rejected.
    """
    name = path.name
    if not name or name.startswith("."):
        return False
    if name.lower() in IGNORED_FILENAMES:
        return False
    return path.suffix.lower() in RAW_EXTENSIONS


def discover_raw_files(root: Path, recursive: bool = False) -> list[Path]:
    """Return the RAW files in *root*, sorted deterministically.

    The input directory is only ever read: no file is created, modified,
    renamed or deleted.  Hidden directories are skipped when recursing.
    """
    root = Path(root)
    if not root.is_dir():
        raise NotADirectoryError(f"not a directory: {root}")

    found: list[Path] = []
    if recursive:
        for dirpath, dirnames, filenames in os.walk(root):
            # Prune hidden directories in place so os.walk does not descend.
            dirnames[:] = sorted(d for d in dirnames if not d.startswith("."))
            for filename in filenames:
                candidate = Path(dirpath) / filename
                if is_raw_file(candidate):
                    found.append(candidate)
    else:
        for candidate in root.iterdir():
            if candidate.is_file() and is_raw_file(candidate):
                found.append(candidate)

    return sorted(found, key=lambda p: (str(p.parent).lower(), p.name.lower()))


# --------------------------------------------------------------------------
# helpers shared by the backends
# --------------------------------------------------------------------------


def parse_exif_timestamp(
    value: str | None,
    subsec: str | int | None = None,
    offset: str | None = None,
) -> datetime | None:
    """Parse an EXIF ``DateTimeOriginal`` string into a ``datetime``.

    *subsec* is the ``SubSecTimeOriginal`` value - a string of digits that
    represents the fractional part of the second (``"05"`` means 0.05 s, not
    5 s), so leading zeros matter.  *offset* is ``OffsetTimeOriginal``
    (e.g. ``"+02:00"``); when present an aware datetime is returned.

    Returns ``None`` for missing or all-zero timestamps rather than raising.
    """
    if value is None:
        return None
    text = str(value).strip()
    if text in _ZERO_TIMESTAMPS or text.startswith("0000:00:00"):
        return None

    moment: datetime | None = None
    for pattern in ("%Y:%m:%d %H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y:%m:%d %H:%M:%S.%f"):
        try:
            moment = datetime.strptime(text.split("+")[0].split("Z")[0].strip(), pattern)
            break
        except ValueError:
            continue
    if moment is None:
        return None

    digits = re.sub(r"\D", "", str(subsec)) if subsec is not None else ""
    if digits:
        # "05" -> 0.05 s ; "123" -> 0.123 s
        fraction = float(f"0.{digits}")
        moment = moment.replace(microsecond=min(999_999, int(round(fraction * 1_000_000))))

    if offset:
        match = re.match(r"^([+-])(\d{2}):?(\d{2})$", str(offset).strip())
        if match:
            sign = 1 if match.group(1) == "+" else -1
            delta = timedelta(hours=int(match.group(2)), minutes=int(match.group(3)))
            moment = moment.replace(tzinfo=timezone(sign * delta))

    return moment


def _stat_size(path: Path) -> int:
    try:
        return path.stat().st_size
    except OSError:
        return 0


def _coerce_float(value: Any) -> float | None:
    """Best-effort conversion of an EXIF value to ``float``."""
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, (list, tuple)):
        return _coerce_float(value[0]) if value else None

    # exifread Ratio objects (and anything else exposing a numerator/denominator)
    for num_attr, den_attr in (("num", "den"), ("numerator", "denominator")):
        numerator = getattr(value, num_attr, None)
        denominator = getattr(value, den_attr, None)
        if numerator is not None and denominator is not None:
            try:
                if float(denominator) == 0.0:
                    return None
                return float(numerator) / float(denominator)
            except (TypeError, ValueError):
                return None

    text = str(value).strip()
    if not text:
        return None
    if "/" in text:
        numerator_text, _, denominator_text = text.partition("/")
        try:
            denominator = float(denominator_text)
            if denominator == 0.0:
                return None
            return float(numerator_text) / denominator
        except ValueError:
            return None
    try:
        return float(text)
    except ValueError:
        return None


def _coerce_int(value: Any) -> int | None:
    number = _coerce_float(value)
    if number is None:
        return None
    return int(round(number))


def _coerce_str(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, (list, tuple)):
        return _coerce_str(value[0]) if value else None
    text = str(value).strip()
    return text or None


# --------------------------------------------------------------------------
# the backend protocol
# --------------------------------------------------------------------------


@runtime_checkable
class MetadataReader(Protocol):
    """A swappable metadata backend.

    The protocol has a single method.  It takes a *sequence* of paths rather
    than one path, because the preferred backend (ExifTool) must be invoked
    once for the whole batch - starting the binary per file is roughly two
    orders of magnitude slower on a real shoot.  Use :func:`read_single` when
    a one-file convenience call is wanted.
    """

    @property
    def name(self) -> str:
        """Human-readable backend name including version, for the CLI."""
        ...

    def read(self, paths: Sequence[Path]) -> list[RawFileMetadata]:
        """Return one :class:`RawFileMetadata` per input path, in input order.

        Must never raise for unreadable files and must never drop a file.
        """
        ...


def read_single(reader: MetadataReader, path: Path) -> RawFileMetadata:
    """Read the metadata of exactly one file through *reader*."""
    return reader.read([path])[0]


# --------------------------------------------------------------------------
# backend 1: exiftool
# --------------------------------------------------------------------------


class ExifToolReader:
    """Metadata backend using the external ``exiftool`` binary (preferred).

    ExifTool is called once per batch through its argument-file interface
    (``-@ -`` reading from stdin), which keeps the command line short enough
    for Windows and handles UTF-8 filenames.  Only read operations are issued;
    no ExifTool write option is ever passed.
    """

    #: Tags requested from exiftool.  A trailing '#' forces the numeric value
    #: for that tag; DateTimeOriginal/SubSecTimeOriginal are requested as
    #: strings because a numeric SubSecTimeOriginal would lose leading zeros
    #: ("05" -> 0.05 s would become 45 -> 0.45 s).
    _TAG_ARGS: tuple[str, ...] = (
        "-DateTimeOriginal",
        "-SubSecTimeOriginal",
        "-OffsetTimeOriginal",
        "-ExposureTime#",
        "-FNumber#",
        "-ISO#",
        "-ExposureCompensation#",
        "-Make",
        "-Model",
        "-ImageWidth#",
        "-ImageHeight#",
        "-ExifImageWidth#",
        "-ExifImageHeight#",
    )

    def __init__(
        self,
        executable: str | Sequence[str] = "exiftool",
        timeout: float = 600.0,
    ) -> None:
        self._command: list[str] = [executable] if isinstance(executable, str) else list(executable)
        self._timeout = timeout
        self._version: str | None = None

    # -- availability -----------------------------------------------------

    @staticmethod
    def is_available(executable: str = "exiftool") -> bool:
        return shutil.which(executable) is not None

    @property
    def version(self) -> str:
        if self._version is None:
            self._version = self._probe_version()
        return self._version

    def _probe_version(self) -> str:
        try:
            completed = subprocess.run(  # noqa: S603 - fixed, local, read-only command
                [*self._command, "-ver"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=30.0,
            )
        except (OSError, subprocess.SubprocessError):
            return "unknown"
        return completed.stdout.strip() or "unknown"

    @property
    def name(self) -> str:
        return f"exiftool {self.version}"

    # -- reading ----------------------------------------------------------

    def read(self, paths: Sequence[Path]) -> list[RawFileMetadata]:
        paths = list(paths)
        if not paths:
            return []

        entries, batch_error = self._run_batch(paths)
        results: list[RawFileMetadata] = []
        for path in paths:
            entry = entries.get(_path_key(path))
            if entry is None:
                errors = (batch_error or "exiftool returned no data for this file",)
                results.append(self._empty(path, errors))
                continue
            results.append(self._from_entry(path, entry))
        return results

    def _run_batch(self, paths: Sequence[Path]) -> tuple[dict[str, dict[str, Any]], str | None]:
        # -m  tolerate minor errors instead of refusing the file
        # -j  JSON output
        # -charset filename=utf8  needed for non-ASCII paths on Windows
        argument_lines = [
            "-json",
            "-m",
            "-charset",
            "filename=utf8",
            *self._TAG_ARGS,
            *(str(path) for path in paths),
        ]
        try:
            completed = subprocess.run(  # noqa: S603 - fixed, local, read-only command
                [*self._command, "-@", "-"],
                input="\n".join(argument_lines) + "\n",
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=self._timeout,
            )
        except subprocess.TimeoutExpired:
            return {}, f"exiftool timed out after {self._timeout:g} s"
        except OSError as error:
            return {}, f"exiftool could not be started: {error}"

        stdout = (completed.stdout or "").strip()
        if not stdout:
            stderr = (completed.stderr or "").strip().splitlines()
            detail = stderr[0] if stderr else f"exit code {completed.returncode}"
            return {}, f"exiftool produced no output ({detail})"

        try:
            payload = json.loads(stdout)
        except json.JSONDecodeError as error:
            return {}, f"exiftool output was not valid JSON: {error}"
        if not isinstance(payload, list):
            return {}, "exiftool output had an unexpected shape"

        entries: dict[str, dict[str, Any]] = {}
        for item in payload:
            if not isinstance(item, dict):
                continue
            source = item.get("SourceFile")
            if source is None:
                continue
            entries[_path_key(Path(str(source)))] = item
        return entries, None

    def _empty(self, path: Path, errors: tuple[str, ...]) -> RawFileMetadata:
        return RawFileMetadata(
            path=path.resolve(),
            filename=path.name,
            file_size=_stat_size(path),
            backend=self.name,
            read_errors=errors,
        )

    def _from_entry(self, path: Path, entry: dict[str, Any]) -> RawFileMetadata:
        errors: list[str] = []
        reported = _coerce_str(entry.get("Error"))
        if reported:
            errors.append(f"exiftool: {reported}")
        warning = _coerce_str(entry.get("Warning"))
        if warning:
            errors.append(f"exiftool warning: {warning}")

        timestamp = parse_exif_timestamp(
            _coerce_str(entry.get("DateTimeOriginal")),
            entry.get("SubSecTimeOriginal"),
            _coerce_str(entry.get("OffsetTimeOriginal")),
        )
        shutter = _coerce_float(entry.get("ExposureTime"))
        aperture = _coerce_float(entry.get("FNumber"))
        iso = _coerce_int(entry.get("ISO"))
        width = _coerce_int(entry.get("ImageWidth")) or _coerce_int(entry.get("ExifImageWidth"))
        height = _coerce_int(entry.get("ImageHeight")) or _coerce_int(entry.get("ExifImageHeight"))

        errors.extend(_missing_field_errors(timestamp, shutter, aperture, iso))

        return RawFileMetadata(
            path=path.resolve(),
            filename=path.name,
            file_size=_stat_size(path),
            timestamp=timestamp,
            shutter_seconds=shutter,
            aperture=aperture,
            iso=iso,
            exposure_compensation=_coerce_float(entry.get("ExposureCompensation")),
            camera_make=_coerce_str(entry.get("Make")),
            camera_model=_coerce_str(entry.get("Model")),
            width=width,
            height=height,
            backend=self.name,
            read_errors=tuple(errors),
        )


def _path_key(path: Path) -> str:
    """Normalised key so exiftool's SourceFile can be matched to our paths."""
    try:
        resolved = path.resolve()
    except OSError:
        resolved = path
    return os.path.normcase(str(resolved))


def _missing_field_errors(
    timestamp: datetime | None,
    shutter: float | None,
    aperture: float | None,
    iso: int | None,
) -> list[str]:
    missing = [
        label
        for label, value in (
            ("DateTimeOriginal", timestamp),
            ("ExposureTime", shutter),
            ("FNumber", aperture),
            ("ISO", iso),
        )
        if value is None
    ]
    return [f"missing metadata: {', '.join(missing)}"] if missing else []


# --------------------------------------------------------------------------
# backend 2: exifread (pure Python fallback)
# --------------------------------------------------------------------------


class ExifReadReader:
    """Pure-Python fallback backend based on ``exifread``.

    Reads classic TIFF-based RAW containers.  It cannot parse the ISO-BMFF
    based CR3 format; such files come back with ``None`` fields and an
    explanatory entry in ``read_errors`` instead of raising.
    """

    _SHUTTER_TAGS = ("EXIF ExposureTime", "Image ExposureTime")
    _APERTURE_TAGS = ("EXIF FNumber", "Image FNumber")
    _ISO_TAGS = (
        "EXIF ISOSpeedRatings",
        "EXIF PhotographicSensitivity",
        "EXIF ISOSpeed",
        "MakerNote ISOSetting",
    )
    _BIAS_TAGS = ("EXIF ExposureBiasValue", "Image ExposureBiasValue")
    _WIDTH_TAGS = ("EXIF ExifImageWidth", "Image ImageWidth")
    _HEIGHT_TAGS = ("EXIF ExifImageLength", "Image ImageLength")

    def __init__(self) -> None:
        self._version: str | None = None

    @staticmethod
    def is_available() -> bool:
        try:
            import exifread  # noqa: F401
        except Exception:  # pragma: no cover - exercised only without the dep
            return False
        return True

    @property
    def version(self) -> str:
        if self._version is None:
            try:
                import exifread

                self._version = str(getattr(exifread, "__version__", "unknown"))
            except Exception:  # pragma: no cover
                self._version = "unavailable"
        return self._version

    @property
    def name(self) -> str:
        return f"exifread {self.version}"

    def read(self, paths: Sequence[Path]) -> list[RawFileMetadata]:
        return [self._read_one(Path(path)) for path in paths]

    def _read_one(self, path: Path) -> RawFileMetadata:
        errors: list[str] = []
        tags: dict[str, Any] = {}
        with _captured_exifread_logs() as captured:
            try:
                import exifread

                # Strictly read-only; details=False skips thumbnails and
                # makernote blobs we do not need.
                with open(path, "rb") as handle:
                    tags = exifread.process_file(handle, details=False)
            except Exception as error:  # noqa: BLE001 - a backend must never raise
                errors.append(f"exifread failed: {type(error).__name__}: {error}")

        if not tags and not errors:
            errors.append(
                "exifread found no EXIF data (format may be unsupported, e.g. CR3)"
            )
        errors.extend(f"exifread: {message}" for message in captured)

        timestamp = parse_exif_timestamp(
            _tag_value(tags, "EXIF DateTimeOriginal", "Image DateTimeOriginal"),
            _tag_value(tags, "EXIF SubSecTimeOriginal"),
            _tag_value(tags, "EXIF OffsetTimeOriginal"),
        )
        shutter = _coerce_float(_tag_value(tags, *self._SHUTTER_TAGS))
        aperture = _coerce_float(_tag_value(tags, *self._APERTURE_TAGS))
        iso = _coerce_int(_tag_value(tags, *self._ISO_TAGS))

        errors.extend(_missing_field_errors(timestamp, shutter, aperture, iso))

        return RawFileMetadata(
            path=path.resolve(),
            filename=path.name,
            file_size=_stat_size(path),
            timestamp=timestamp,
            shutter_seconds=shutter,
            aperture=aperture,
            iso=iso,
            exposure_compensation=_coerce_float(_tag_value(tags, *self._BIAS_TAGS)),
            camera_make=_coerce_str(_tag_value(tags, "Image Make")),
            camera_model=_coerce_str(_tag_value(tags, "Image Model")),
            width=_coerce_int(_tag_value(tags, *self._WIDTH_TAGS)),
            height=_coerce_int(_tag_value(tags, *self._HEIGHT_TAGS)),
            backend=self.name,
            read_errors=tuple(errors),
        )


class _CollectingHandler(logging.Handler):
    def __init__(self) -> None:
        super().__init__(level=logging.WARNING)
        self.messages: list[str] = []

    def emit(self, record: logging.LogRecord) -> None:
        self.messages.append(record.getMessage())


@contextlib.contextmanager
def _captured_exifread_logs() -> Iterator[list[str]]:
    """Divert exifread's own logging into a list.

    exifread installs a stream handler that prints things like "File format
    not recognized." straight to stdout.  That would corrupt the CLI report,
    so its handlers are swapped out for the duration of the call and the
    messages are surfaced through ``read_errors`` instead - where they are
    actually useful to the photographer.
    """
    logger = logging.getLogger("exifread")
    handler = _CollectingHandler()
    previous_handlers = logger.handlers[:]
    previous_level = logger.level
    previous_propagate = logger.propagate
    logger.handlers = [handler]
    logger.setLevel(logging.WARNING)
    logger.propagate = False
    try:
        yield handler.messages
    finally:
        logger.handlers = previous_handlers
        logger.setLevel(previous_level)
        logger.propagate = previous_propagate


def _tag_value(tags: dict[str, Any], *names: str) -> Any:
    """First present tag value out of *names*, unwrapping exifread objects."""
    for name in names:
        tag = tags.get(name)
        if tag is None:
            continue
        values = getattr(tag, "values", None)
        if values is None:
            return tag
        if isinstance(values, (list, tuple)):
            if not values:
                continue
            return values[0]
        return values
    return None


# --------------------------------------------------------------------------
# backend 3: last resort
# --------------------------------------------------------------------------


class NullMetadataReader:
    """Used when no metadata backend is installed at all.

    Returns stat-only records so that the rest of the pipeline still reports
    every file (as unreadable) instead of crashing.
    """

    @property
    def name(self) -> str:
        return "none (install exiftool or exifread)"

    def read(self, paths: Sequence[Path]) -> list[RawFileMetadata]:
        return [
            RawFileMetadata(
                path=Path(path).resolve(),
                filename=Path(path).name,
                file_size=_stat_size(Path(path)),
                backend=self.name,
                read_errors=("no metadata backend available",),
            )
            for path in paths
        ]


# --------------------------------------------------------------------------
# selection
# --------------------------------------------------------------------------


def select_reader(preference: str = "auto") -> MetadataReader:
    """Pick a metadata backend.

    *preference* is ``"auto"`` (ExifTool if on PATH, else exifread),
    ``"exiftool"`` or ``"exifread"``.  Explicit choices raise ``RuntimeError``
    when the backend is unavailable; ``"auto"`` never raises.
    """
    preference = preference.lower()
    if preference == "exiftool":
        if not ExifToolReader.is_available():
            raise RuntimeError("exiftool was requested but is not on PATH")
        return ExifToolReader()
    if preference == "exifread":
        if not ExifReadReader.is_available():
            raise RuntimeError("exifread was requested but is not installed")
        return ExifReadReader()
    if preference != "auto":
        raise ValueError(f"unknown backend preference: {preference!r}")

    if ExifToolReader.is_available():
        return ExifToolReader()
    if ExifReadReader.is_available():
        return ExifReadReader()
    return NullMetadataReader()


def read_directory(
    root: Path,
    recursive: bool = False,
    reader: MetadataReader | None = None,
) -> tuple[list[RawFileMetadata], MetadataReader]:
    """Discover and read every RAW file under *root* with one backend call."""
    backend = reader if reader is not None else select_reader()
    files: Iterable[Path] = discover_raw_files(root, recursive=recursive)
    return backend.read(list(files)), backend
