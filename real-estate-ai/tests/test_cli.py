"""End-to-end tests for the CLI.

These run against real files with a real EXIF block, parsed by a real backend
- so they cover discovery, metadata reading, detection and formatting in one
go, which is exactly the path a user exercises on a shoot.
"""

from __future__ import annotations

import json

import pytest

from real_estate_ai.cli import build_parser, main
from tests.conftest import SHUTTER_LADDER_3, SHUTTER_LADDER_5, write_exif_bracket


@pytest.fixture
def shoot(tmp_path):
    """Two 5-frame brackets, one 3-frame bracket, one single shot, noise."""
    folder = tmp_path / "Musterstrasse 12"
    write_exif_bracket(folder, 1, SHUTTER_LADDER_5, start_second=0)
    write_exif_bracket(folder, 6, SHUTTER_LADDER_5, start_second=40)
    write_exif_bracket(folder, 11, SHUTTER_LADDER_3, start_second=80)
    write_exif_bracket(folder, 20, SHUTTER_LADDER_5[:1], start_second=200)  # single shot
    (folder / "DSC00001.JPG").write_bytes(b"\xff\xd8\xff\xe0 not a raw")
    (folder / "DSC00001.xmp").write_text("<x:xmpmeta/>", encoding="utf-8")
    return folder


def run(argv, capsys) -> tuple[int, str]:
    code = main(argv)
    return code, capsys.readouterr().out


class TestDetectOutput:
    def test_summary_lines(self, shoot, capsys):
        code, out = run(["detect", str(shoot), "--backend", "exifread"], capsys)

        assert code == 0
        assert "Metadata backend: exifread" in out
        assert "Found 14 RAW files" in out
        assert "Detected 2 five-shot brackets, 1 three-shot bracket" in out
        assert "Ungrouped RAW files: 1" in out

    def test_bracket_block_layout(self, shoot, capsys):
        _, out = run(["detect", str(shoot), "--backend", "exifread"], capsys)

        assert "Bracket 001  (5 frames, dark -> bright)" in out
        assert "<- reference" in out
        assert "Confidence: " in out
        assert "spacing " in out and "consistency " in out

    def test_reference_frame_is_zero_and_signs_are_correct(self, shoot, capsys):
        _, out = run(["detect", str(shoot), "--backend", "exifread"], capsys)
        block = out.split("Bracket 001")[1].split("Bracket 002")[0].splitlines()
        rows = [line for line in block if " EV" in line]

        assert len(rows) == 5
        values = [float(line.split()[1]) for line in rows]
        assert values == sorted(values)  # dark -> bright
        assert values[0] < 0 and values[-1] > 0
        assert values[2] == pytest.approx(0.0)
        assert "<- reference" in rows[2]

    def test_singleton_is_reported_as_ungrouped(self, shoot, capsys):
        _, out = run(["detect", str(shoot), "--backend", "exifread"], capsys)

        assert "Ungrouped RAW files: 1" in out
        assert "--verbose" in out  # hint how to find out why

    def test_verbose_explains_every_ungrouped_file(self, shoot, capsys):
        _, out = run(["detect", str(shoot), "--backend", "exifread", "--verbose"], capsys)

        assert "Time-based runs:" in out
        assert "Ungrouped files" in out
        assert "DSC00020.ARW" in out
        assert "only 1 frame left in this burst" in out

    def test_empty_folder(self, tmp_path, capsys):
        code, out = run(["detect", str(tmp_path), "--backend", "exifread"], capsys)

        assert code == 0
        assert "Found 0 RAW files" in out
        assert "Detected no brackets" in out

    def test_folder_with_only_non_raw_files(self, tmp_path, capsys):
        (tmp_path / "a.jpg").write_bytes(b"x")
        (tmp_path / "b.tiff").write_bytes(b"x")
        code, out = run(["detect", str(tmp_path), "--backend", "exifread"], capsys)

        assert code == 0
        assert "Found 0 RAW files" in out

    def test_recursive_flag(self, shoot, capsys):
        write_exif_bracket(shoot / "keller", 30, SHUTTER_LADDER_3, start_second=300)

        _, shallow = run(["detect", str(shoot), "--backend", "exifread"], capsys)
        _, deep = run(["detect", str(shoot), "--backend", "exifread", "--recursive"], capsys)

        assert "Found 14 RAW files" in shallow
        assert "Found 17 RAW files" in deep
        assert "2 three-shot brackets" in deep


class TestJsonOutput:
    def test_json_contains_the_full_result(self, shoot, tmp_path, capsys):
        report = tmp_path / "reports" / "shoot.json"
        code, out = run(
            ["detect", str(shoot), "--backend", "exifread", "--json", str(report)], capsys
        )

        assert code == 0
        assert str(report) in out
        payload = json.loads(report.read_text(encoding="utf-8"))

        assert payload["backend_used"].startswith("exifread")
        assert len(payload["groups"]) == 3
        assert payload["stats"]["total_files"] == 14
        assert payload["stats"]["settings"]["sizes"] == [5, 3]

        group = payload["groups"][0]
        assert group["size"] == 5
        assert group["capture_order"] == "dark_to_bright"
        assert group["detected_rel_evs"][group["reference_index"]] == pytest.approx(0.0)
        assert group["images"][0]["metadata"]["camera_model"] == "ILCE-7RM4"
        assert 0.0 <= group["confidence"] <= 1.0

    def test_json_lists_ungrouped_files_and_reasons(self, shoot, tmp_path, capsys):
        report = tmp_path / "shoot.json"
        run(["detect", str(shoot), "--backend", "exifread", "--json", str(report)], capsys)
        payload = json.loads(report.read_text(encoding="utf-8"))

        assert [image["metadata"]["filename"] for image in payload["ungrouped_images"]] == [
            "DSC00020.ARW"
        ]
        assert payload["rejected_windows"]


class TestOptions:
    def test_sizes_option_is_parsed(self):
        args = build_parser().parse_args(["detect", ".", "--sizes", "7,5,3"])
        assert args.sizes == (7, 5, 3)

    def test_sizes_option_rejects_nonsense(self, capsys):
        with pytest.raises(SystemExit):
            build_parser().parse_args(["detect", ".", "--sizes", "1"])

    def test_tolerance_can_be_tightened_to_split_a_bracket(self, shoot, capsys):
        """The real shutter ladder deviates ~0.06 EV; a 0.05 tolerance rejects it."""
        _, out = run(
            ["detect", str(shoot), "--backend", "exifread", "--tolerance", "0.05"], capsys
        )
        assert "Detected no brackets" in out

    def test_min_confidence_can_be_raised(self, shoot, capsys):
        _, out = run(
            ["detect", str(shoot), "--backend", "exifread", "--min-confidence", "1.0"], capsys
        )
        assert "Detected no brackets" in out

    def test_max_frame_gap_splits_the_shoot(self, shoot, capsys):
        _, out = run(
            ["detect", str(shoot), "--backend", "exifread", "--max-frame-gap", "0.5"], capsys
        )
        assert "Detected no brackets" in out

    def test_unknown_folder_exits_with_usage_error(self, tmp_path, capsys):
        with pytest.raises(SystemExit) as excinfo:
            main(["detect", str(tmp_path / "missing")])

        assert excinfo.value.code == 2
        assert "does not exist" in capsys.readouterr().err

    def test_missing_subcommand_exits_with_usage_error(self, capsys):
        with pytest.raises(SystemExit) as excinfo:
            main([])

        assert excinfo.value.code == 2

    def test_version_flag(self, capsys):
        with pytest.raises(SystemExit) as excinfo:
            main(["--version"])

        assert excinfo.value.code == 0
        assert "real-estate-ai" in capsys.readouterr().out
