"""Tests for RAW discovery and the two metadata backends."""

from __future__ import annotations

import json
import subprocess
import sys
import textwrap
from datetime import datetime, timedelta
from pathlib import Path

import pytest

from real_estate_ai.ingest.metadata import (
    RAW_EXTENSIONS,
    ExifReadReader,
    ExifToolReader,
    MetadataReader,
    NullMetadataReader,
    discover_raw_files,
    is_raw_file,
    parse_exif_timestamp,
    read_directory,
    read_single,
    select_reader,
)
from tests.conftest import build_exif_tiff

# A tiny, structurally invalid "RAW" file: enough to exist on disk, not enough
# for any parser to find EXIF in.  Backends must report it, not crash on it.
DUMMY_RAW_BYTES = b"\x00\x01\x02\x03not a real raw file\x00" * 8


def write_files(root: Path, names: list[str]) -> list[Path]:
    created = []
    for name in names:
        target = root / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(DUMMY_RAW_BYTES)
        created.append(target)
    return created


# --------------------------------------------------------------------------
# discovery
# --------------------------------------------------------------------------


class TestDiscovery:
    def test_all_documented_extensions_are_supported(self):
        assert RAW_EXTENSIONS == {
            ".arw",
            ".cr2",
            ".cr3",
            ".nef",
            ".dng",
            ".raf",
            ".orf",
            ".rw2",
            ".pef",
            ".srw",
        }

    def test_uppercase_and_lowercase_extensions_are_both_found(self, tmp_path):
        write_files(
            tmp_path,
            ["A.ARW", "b.arw", "C.Cr2", "D.nef", "E.NEF", "F.cr3", "G.RW2"],
        )
        found = {path.name for path in discover_raw_files(tmp_path)}

        assert found == {"A.ARW", "b.arw", "C.Cr2", "D.nef", "E.NEF", "F.cr3", "G.RW2"}

    def test_empty_directory_yields_no_files(self, tmp_path):
        assert discover_raw_files(tmp_path) == []

    def test_directory_without_raw_files(self, tmp_path):
        write_files(tmp_path, ["notes.txt", "preview.jpg", "scan.tiff", "sidecar.xmp"])

        assert discover_raw_files(tmp_path) == []

    def test_non_raw_neighbours_are_ignored(self, tmp_path):
        write_files(
            tmp_path,
            [
                "DSC00001.ARW",
                "DSC00001.JPG",  # in-camera JPEG next to the RAW
                "DSC00001.xmp",  # sidecar
                "DSC00002.ARW",
                "export.tif",
                "export.tiff",
                "contact_sheet.jpeg",
                "Thumbs.db",
                ".DS_Store",
                ".hidden.ARW",
            ],
        )
        found = sorted(path.name for path in discover_raw_files(tmp_path))

        assert found == ["DSC00001.ARW", "DSC00002.ARW"]

    def test_nested_directories_without_recursive(self, tmp_path):
        write_files(tmp_path, ["top.ARW", "livingroom/a.ARW", "kitchen/deep/b.NEF"])

        assert [path.name for path in discover_raw_files(tmp_path)] == ["top.ARW"]

    def test_nested_directories_with_recursive(self, tmp_path):
        write_files(tmp_path, ["top.ARW", "livingroom/a.ARW", "kitchen/deep/b.NEF"])
        found = sorted(path.name for path in discover_raw_files(tmp_path, recursive=True))

        assert found == ["a.ARW", "b.NEF", "top.ARW"]

    def test_hidden_directories_are_skipped_when_recursing(self, tmp_path):
        write_files(tmp_path, ["top.ARW", ".trash/old.ARW", ".git/objects/x.ARW"])
        found = [path.name for path in discover_raw_files(tmp_path, recursive=True)]

        assert found == ["top.ARW"]

    def test_missing_directory_raises(self, tmp_path):
        with pytest.raises(NotADirectoryError):
            discover_raw_files(tmp_path / "nope")

    def test_is_raw_file_predicate(self, tmp_path):
        assert is_raw_file(Path("DSC00001.ARW"))
        assert is_raw_file(Path("DSC00001.cr3"))
        assert not is_raw_file(Path("DSC00001.jpg"))
        assert not is_raw_file(Path(".DSC00001.ARW"))
        assert not is_raw_file(Path("Thumbs.db"))
        assert not is_raw_file(Path("DSC00001"))


# --------------------------------------------------------------------------
# timestamp parsing
# --------------------------------------------------------------------------


class TestTimestampParsing:
    def test_plain_timestamp(self):
        assert parse_exif_timestamp("2026:03:14 10:30:00") == datetime(2026, 3, 14, 10, 30, 0)

    def test_subsecond_keeps_leading_zeros(self):
        """'05' means 0.05 s, not 0.5 s - leading zeros must not be dropped."""
        moment = parse_exif_timestamp("2026:03:14 10:30:00", subsec="05")
        assert moment is not None
        assert moment.microsecond == 50_000

    def test_subsecond_three_digits(self):
        moment = parse_exif_timestamp("2026:03:14 10:30:00", subsec="123")
        assert moment is not None
        assert moment.microsecond == 123_000

    def test_offset_produces_aware_datetime(self):
        moment = parse_exif_timestamp("2026:03:14 10:30:00", offset="+02:00")
        assert moment is not None
        assert moment.utcoffset() == timedelta(hours=2)

    def test_negative_offset(self):
        moment = parse_exif_timestamp("2026:03:14 10:30:00", offset="-05:00")
        assert moment is not None
        assert moment.utcoffset() == timedelta(hours=-5)

    @pytest.mark.parametrize(
        "value", [None, "", "0000:00:00 00:00:00", "not a timestamp", "2026-13-45 99:99:99"]
    )
    def test_unusable_values_return_none(self, value):
        assert parse_exif_timestamp(value) is None


# --------------------------------------------------------------------------
# exiftool backend (driven by a stand-in binary)
# --------------------------------------------------------------------------


FAKE_EXIFTOOL = textwrap.dedent(
    '''
    """Stand-in for the exiftool binary, speaking just enough of its protocol."""
    import json
    import sys

    RAW_SUFFIXES = (".arw", ".cr2", ".cr3", ".nef", ".dng")

    if "-ver" in sys.argv[1:]:
        print("13.10")
        raise SystemExit(0)

    lines = [line.strip() for line in sys.stdin.read().splitlines() if line.strip()]
    files = [line for line in lines if line.lower().endswith(RAW_SUFFIXES)]

    payload = []
    for index, path in enumerate(files):
        lower = path.lower()
        if "broken" in lower:
            payload.append({"SourceFile": path, "Error": "Unknown file type"})
            continue
        if "vanish" in lower:
            continue
        entry = {
            "SourceFile": path,
            "DateTimeOriginal": "2026:03:14 10:30:0%d" % index,
            "SubSecTimeOriginal": "05",
            "ExposureTime": 0.008,
            "FNumber": 8.0,
            "ISO": 100,
            "ExposureCompensation": 0,
            "Make": "SONY",
            "Model": "ILCE-7RM4",
            "ImageWidth": 9504,
            "ImageHeight": 6336,
        }
        if "nodate" in lower:
            del entry["DateTimeOriginal"]
            del entry["SubSecTimeOriginal"]
        if "noshutter" in lower:
            del entry["ExposureTime"]
        payload.append(entry)

    print(json.dumps(payload))
    '''
)


@pytest.fixture
def fake_exiftool(tmp_path_factory):
    script = tmp_path_factory.mktemp("bin") / "fake_exiftool.py"
    script.write_text(FAKE_EXIFTOOL, encoding="utf-8")
    return ExifToolReader(executable=[sys.executable, str(script)])


class TestExifToolReader:
    def test_backend_name_includes_version(self, fake_exiftool):
        assert fake_exiftool.name == "exiftool 13.10"

    def test_reads_a_batch_in_one_call(self, fake_exiftool, tmp_path, monkeypatch):
        paths = write_files(tmp_path, ["DSC00001.ARW", "DSC00002.ARW", "DSC00003.ARW"])

        calls = []
        original = subprocess.run

        def counting_run(*args, **kwargs):
            calls.append(args[0])
            return original(*args, **kwargs)

        monkeypatch.setattr(subprocess, "run", counting_run)
        records = fake_exiftool.read(paths)

        assert len(records) == 3
        # One call for the batch (the version probe is cached separately).
        assert len([call for call in calls if "-@" in call]) == 1

    def test_parses_every_field(self, fake_exiftool, tmp_path):
        (path,) = write_files(tmp_path, ["DSC00001.ARW"])
        record = read_single(fake_exiftool, path)

        assert record.filename == "DSC00001.ARW"
        assert record.file_size == len(DUMMY_RAW_BYTES)
        assert record.timestamp == datetime(2026, 3, 14, 10, 30, 0, 50_000)
        assert record.shutter_seconds == pytest.approx(0.008)
        assert record.aperture == pytest.approx(8.0)
        assert record.iso == 100
        assert record.exposure_compensation == pytest.approx(0.0)
        assert record.camera_make == "SONY"
        assert record.camera_model == "ILCE-7RM4"
        assert (record.width, record.height) == (9504, 6336)
        assert record.backend.startswith("exiftool")
        assert record.read_errors == ()
        assert record.has_exposure_triplet

    def test_results_keep_input_order(self, fake_exiftool, tmp_path):
        paths = write_files(tmp_path, ["c.ARW", "a.ARW", "b.ARW"])
        records = fake_exiftool.read(paths)

        assert [record.filename for record in records] == ["c.ARW", "a.ARW", "b.ARW"]

    def test_file_reported_as_error_still_appears(self, fake_exiftool, tmp_path):
        paths = write_files(tmp_path, ["DSC00001.ARW", "broken.ARW"])
        records = fake_exiftool.read(paths)

        assert len(records) == 2
        broken = records[1]
        assert broken.filename == "broken.ARW"
        assert not broken.has_exposure_triplet
        assert any("Unknown file type" in error for error in broken.read_errors)

    def test_file_missing_from_the_output_still_appears(self, fake_exiftool, tmp_path):
        paths = write_files(tmp_path, ["DSC00001.ARW", "vanish.ARW"])
        records = fake_exiftool.read(paths)

        assert [record.filename for record in records] == ["DSC00001.ARW", "vanish.ARW"]
        assert records[1].read_errors

    def test_partial_metadata_is_reported(self, fake_exiftool, tmp_path):
        paths = write_files(tmp_path, ["noshutter.ARW", "nodate.ARW"])
        no_shutter, no_date = fake_exiftool.read(paths)

        assert no_shutter.shutter_seconds is None
        assert not no_shutter.has_exposure_triplet
        assert any("ExposureTime" in error for error in no_shutter.read_errors)

        assert no_date.timestamp is None
        assert no_date.has_exposure_triplet  # exposure data is still usable

    def test_empty_input_does_not_start_the_binary(self, fake_exiftool):
        assert fake_exiftool.read([]) == []

    def test_missing_binary_is_reported_not_raised(self, tmp_path):
        reader = ExifToolReader(executable="exiftool-that-does-not-exist")
        (path,) = write_files(tmp_path, ["DSC00001.ARW"])
        record = read_single(reader, path)

        assert record.filename == "DSC00001.ARW"
        assert record.read_errors
        assert not record.has_exposure_triplet

    def test_availability_probe(self):
        assert ExifToolReader.is_available("definitely-not-a-real-binary") is False

    def test_satisfies_the_protocol(self, fake_exiftool):
        assert isinstance(fake_exiftool, MetadataReader)


# --------------------------------------------------------------------------
# exifread backend
# --------------------------------------------------------------------------


@pytest.mark.skipif(
    not ExifToolReader.is_available(), reason="the exiftool binary is not on PATH"
)
class TestRealExifTool:
    """Exercised only where the real binary is installed (CI, dev machines)."""

    def test_reads_a_real_exif_block(self, tmp_path):
        target = tmp_path / "DSC00001.ARW"
        target.write_bytes(build_exif_tiff(subsec="050000"))
        record = read_single(ExifToolReader(), target)

        assert record.camera_make == "SONY"
        assert record.camera_model == "ILCE-7RM4"
        assert record.shutter_seconds == pytest.approx(1 / 250)
        assert record.aperture == pytest.approx(8.0)
        assert record.iso == 100
        assert (record.width, record.height) == (9504, 6336)
        assert record.timestamp == datetime(2026, 3, 14, 10, 30, 0, 50_000)
        assert record.read_errors == ()

    def test_subsecond_leading_zeros_survive_the_json_round_trip(self, tmp_path):
        """exiftool quotes values like "0500"; a numeric read would corrupt them."""
        target = tmp_path / "DSC00001.ARW"
        target.write_bytes(build_exif_tiff(subsec="0500"))
        record = read_single(ExifToolReader(), target)

        assert record.timestamp is not None
        assert record.timestamp.microsecond == 50_000

    def test_unreadable_file_is_reported_not_dropped(self, tmp_path):
        paths = write_files(tmp_path, ["DSC00001.ARW"])
        records = ExifToolReader().read(paths)

        assert len(records) == 1
        assert not records[0].has_exposure_triplet
        assert records[0].read_errors

    def test_batch_of_mixed_files(self, tmp_path):
        good = tmp_path / "good.ARW"
        good.write_bytes(build_exif_tiff(subsec="000000"))
        (bad,) = write_files(tmp_path, ["bad.ARW"])
        records = ExifToolReader().read([good, bad])

        assert [record.filename for record in records] == ["good.ARW", "bad.ARW"]
        assert records[0].has_exposure_triplet
        assert not records[1].has_exposure_triplet


class TestExifReadReader:
    def test_availability(self):
        assert ExifReadReader.is_available() is True

    def test_backend_name(self):
        assert ExifReadReader().name.startswith("exifread ")

    def test_unparseable_file_is_reported_not_dropped(self, tmp_path):
        paths = write_files(tmp_path, ["DSC00001.ARW", "DSC00002.CR3"])
        records = ExifReadReader().read(paths)

        assert [record.filename for record in records] == ["DSC00001.ARW", "DSC00002.CR3"]
        for record in records:
            assert record.read_errors
            assert record.shutter_seconds is None
            assert not record.has_exposure_triplet
            assert record.file_size == len(DUMMY_RAW_BYTES)

    def test_reads_a_real_jpeg_style_exif_block(self, tmp_path):
        """exifread is exercised against a real, minimal EXIF structure."""
        target = tmp_path / "DSC00001.DNG"
        target.write_bytes(build_exif_tiff(subsec="050000"))
        record = read_single(ExifReadReader(), target)

        assert record.camera_make == "SONY"
        assert record.camera_model == "ILCE-7RM4"
        assert record.shutter_seconds == pytest.approx(1 / 250)
        assert record.aperture == pytest.approx(8.0)
        assert record.iso == 100
        assert record.timestamp == datetime(2026, 3, 14, 10, 30, 0, 50_000)
        assert (record.width, record.height) == (9504, 6336)
        assert record.has_exposure_triplet

    def test_missing_file_is_reported_not_raised(self, tmp_path):
        record = read_single(ExifReadReader(), tmp_path / "gone.ARW")

        assert record.filename == "gone.ARW"
        assert record.file_size == 0
        assert record.read_errors

    def test_satisfies_the_protocol(self):
        assert isinstance(ExifReadReader(), MetadataReader)


# --------------------------------------------------------------------------
# selection and the directory helper
# --------------------------------------------------------------------------


class TestSelection:
    def test_auto_prefers_exiftool_when_present(self, monkeypatch):
        monkeypatch.setattr(ExifToolReader, "is_available", staticmethod(lambda *a: True))
        assert isinstance(select_reader("auto"), ExifToolReader)

    def test_auto_falls_back_to_exifread(self, monkeypatch):
        monkeypatch.setattr(ExifToolReader, "is_available", staticmethod(lambda *a: False))
        assert isinstance(select_reader("auto"), ExifReadReader)

    def test_auto_never_raises_without_any_backend(self, monkeypatch):
        monkeypatch.setattr(ExifToolReader, "is_available", staticmethod(lambda *a: False))
        monkeypatch.setattr(ExifReadReader, "is_available", staticmethod(lambda: False))
        reader = select_reader("auto")

        assert isinstance(reader, NullMetadataReader)
        assert isinstance(reader, MetadataReader)

    def test_null_reader_still_reports_every_file(self, tmp_path):
        paths = write_files(tmp_path, ["a.ARW", "b.ARW"])
        records = NullMetadataReader().read(paths)

        assert [record.filename for record in records] == ["a.ARW", "b.ARW"]
        assert all(record.read_errors for record in records)

    def test_explicit_missing_backend_raises(self, monkeypatch):
        monkeypatch.setattr(ExifToolReader, "is_available", staticmethod(lambda *a: False))
        with pytest.raises(RuntimeError):
            select_reader("exiftool")

    def test_unknown_preference_raises(self):
        with pytest.raises(ValueError):
            select_reader("magic")

    def test_read_directory_uses_one_backend_for_everything(self, tmp_path, fake_exiftool):
        write_files(tmp_path, ["DSC00001.ARW", "sub/DSC00002.ARW", "note.txt"])
        records, backend = read_directory(tmp_path, recursive=True, reader=fake_exiftool)

        assert [record.filename for record in records] == ["DSC00001.ARW", "DSC00002.ARW"]
        assert backend is fake_exiftool
        assert all(record.backend == "exiftool 13.10" for record in records)


def test_json_roundtrip_of_metadata(tmp_path, fake_exiftool):
    (path,) = write_files(tmp_path, ["DSC00001.ARW"])
    payload = json.loads(json.dumps(read_single(fake_exiftool, path).to_dict()))

    assert payload["filename"] == "DSC00001.ARW"
    assert payload["timestamp"].startswith("2026-03-14T10:30:00")
    assert payload["read_errors"] == []
