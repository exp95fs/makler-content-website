"""The single most important guarantee of this project.

Original RAW files are immutable.  Nothing in the pipeline may modify, move,
rename or delete them, and nothing may be written into the input directory -
not even a JSON report or a cache file.

These tests fingerprint an input folder (names, sizes, mtimes and SHA-256 of
every file), run the full detection end to end, and compare the fingerprint
afterwards.
"""

from __future__ import annotations

import hashlib
import os
from pathlib import Path

import pytest

from real_estate_ai.cli import main
from real_estate_ai.ingest.bracket_detector import detect_brackets
from real_estate_ai.ingest.metadata import discover_raw_files, select_reader

RAW_PAYLOAD = b"\x49\x49\x2a\x00pretend this is sensor data\x00" * 64


def fingerprint(folder: Path) -> dict[str, tuple[int, int, str]]:
    """Map every file under *folder* to (size, mtime_ns, sha256)."""
    snapshot: dict[str, tuple[int, int, str]] = {}
    for dirpath, dirnames, filenames in os.walk(folder):
        dirnames.sort()
        for filename in sorted(filenames):
            path = Path(dirpath) / filename
            stat = path.stat()
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            snapshot[str(path.relative_to(folder))] = (stat.st_size, stat.st_mtime_ns, digest)
    return snapshot


@pytest.fixture
def shooting_folder(tmp_path):
    """A realistic input folder: RAWs, in-camera JPEGs, sidecars, sub-folders."""
    folder = tmp_path / "input" / "Musterstrasse 12"
    names = [
        "DSC00001.ARW",
        "DSC00002.ARW",
        "DSC00003.ARW",
        "DSC00004.ARW",
        "DSC00005.ARW",
        "DSC00001.JPG",
        "DSC00001.xmp",
        "Thumbs.db",
        "keller/DSC00010.NEF",
        "keller/DSC00011.NEF",
        "keller/notes.txt",
    ]
    for name in names:
        target = folder / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(RAW_PAYLOAD)
    return folder


class TestInputFolderIsNeverTouched:
    def test_detection_leaves_the_folder_byte_identical(self, shooting_folder):
        before = fingerprint(shooting_folder)
        assert before, "fixture produced no files"

        files = discover_raw_files(shooting_folder, recursive=True)
        reader = select_reader()
        metadata = reader.read(files)
        result = detect_brackets(metadata, backend_used=reader.name)

        after = fingerprint(shooting_folder)
        assert after == before
        assert set(after) == set(before), "a file appeared or disappeared"

        # The unreadable dummy files must still all be accounted for.
        assert result.stats["total_files"] == 7
        assert len(result.ungrouped_images) + result.stats["grouped_files"] == 7

    def test_cli_run_leaves_the_folder_byte_identical(self, shooting_folder, tmp_path, capsys):
        before = fingerprint(shooting_folder)
        report = tmp_path / "out" / "report.json"

        exit_code = main(
            [
                "detect",
                str(shooting_folder),
                "--recursive",
                "--verbose",
                "--json",
                str(report),
            ]
        )
        capsys.readouterr()

        assert exit_code == 0
        assert fingerprint(shooting_folder) == before
        assert report.is_file()  # written outside the input folder

    def test_json_output_inside_the_input_folder_is_refused(self, shooting_folder, capsys):
        before = fingerprint(shooting_folder)

        with pytest.raises(SystemExit) as excinfo:
            main(
                [
                    "detect",
                    str(shooting_folder),
                    "--json",
                    str(shooting_folder / "report.json"),
                ]
            )

        assert excinfo.value.code == 2
        assert "read-only" in capsys.readouterr().err
        assert fingerprint(shooting_folder) == before

    @pytest.mark.parametrize("backend", ["auto", "exifread", "exiftool"])
    def test_every_backend_leaves_the_folder_untouched(self, shooting_folder, backend):
        try:
            reader = select_reader(backend)
        except RuntimeError:
            pytest.skip(f"{backend} backend is not installed here")

        before = fingerprint(shooting_folder)
        files = discover_raw_files(shooting_folder, recursive=True)
        detect_brackets(reader.read(files), backend_used=reader.name)

        assert fingerprint(shooting_folder) == before

    def test_no_file_handle_is_opened_for_writing(self, shooting_folder, monkeypatch):
        """Guards against a future backend quietly writing a cache or sidecar."""
        real_open = open
        opened_for_write: list[str] = []

        def watching_open(file, mode="r", *args, **kwargs):
            if any(flag in mode for flag in ("w", "a", "x", "+")):
                opened_for_write.append(str(file))
            return real_open(file, mode, *args, **kwargs)

        monkeypatch.setattr("builtins.open", watching_open)

        files = discover_raw_files(shooting_folder, recursive=True)
        for backend in ("auto", "exifread", "exiftool"):
            try:
                reader = select_reader(backend)
            except RuntimeError:
                continue
            detect_brackets(reader.read(files), backend_used=reader.name)

        inside = [
            path
            for path in opened_for_write
            if str(shooting_folder) in str(Path(path).resolve())
        ]
        assert inside == []

    def test_directory_mtime_is_unchanged(self, shooting_folder):
        before = shooting_folder.stat().st_mtime_ns

        files = discover_raw_files(shooting_folder, recursive=True)
        reader = select_reader()
        detect_brackets(reader.read(files), backend_used=reader.name)

        assert shooting_folder.stat().st_mtime_ns == before
