"""Tests for the grouping algorithm.

Every test here feeds synthetic metadata into the detector, so the algorithm
is exercised completely independently of the metadata backends.
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from real_estate_ai.ingest.bracket_detector import (
    BracketDetectionError,
    DetectionSettings,
    _assert_no_frame_reused,
    detect_brackets,
)
from real_estate_ai.models.bracket import CaptureOrder
from tests.conftest import BASE_TIME, make_bracket, make_metadata

FIVE = [-4.0, -2.0, 0.0, 2.0, 4.0]
THREE = [-2.0, 0.0, 2.0]


def rel_evs(group) -> list[float]:
    return [round(value, 2) for value in group.detected_rel_evs]


class TestPerfectBrackets:
    def test_perfect_five_frame_bracket(self):
        result = detect_brackets(make_bracket(1, FIVE))

        assert len(result.groups) == 1
        group = result.groups[0]
        assert group.size == 5
        assert rel_evs(group) == FIVE
        assert group.capture_order is CaptureOrder.DARK_TO_BRIGHT
        assert group.reference_image.filename == "DSC00003.ARW"
        assert group.reference_image.rel_ev == pytest.approx(0.0)
        assert group.confidence == pytest.approx(1.0)
        assert result.ungrouped_images == ()

    def test_perfect_three_frame_bracket(self):
        result = detect_brackets(make_bracket(1, THREE))

        assert len(result.groups) == 1
        group = result.groups[0]
        assert group.size == 3
        assert rel_evs(group) == THREE
        assert group.reference_image.filename == "DSC00002.ARW"
        assert result.stats["groups_by_size"] == {"3": 1}

    def test_images_are_ordered_dark_to_bright(self):
        result = detect_brackets(make_bracket(1, list(reversed(FIVE))))
        group = result.groups[0]

        assert [image.rel_ev for image in group.images] == sorted(
            image.rel_ev for image in group.images
        )
        # Brightest frame last, and it was shot first in this reverse bracket.
        assert group.images[-1].filename == "DSC00001.ARW"

    def test_confidence_sub_scores_are_reported(self):
        group = detect_brackets(make_bracket(1, FIVE)).groups[0]
        parts = group.confidence_parts

        assert parts.spacing == pytest.approx(1.0)
        assert parts.metadata == pytest.approx(1.0)
        assert parts.timing == pytest.approx(1.0)
        assert parts.consistency == pytest.approx(1.0)


class TestTolerance:
    def test_small_deviations_are_still_a_bracket(self):
        """Real cameras quantise shutter speeds; +/- 0.3 EV must still group."""
        deviated = [-4.2, -1.9, 0.0, 2.1, 3.8]
        result = detect_brackets(make_bracket(1, deviated))

        assert len(result.groups) == 1
        group = result.groups[0]
        assert rel_evs(group) == deviated
        assert 0.6 <= group.confidence < 1.0
        assert group.confidence_parts.spacing < 1.0

    def test_specification_example_sequence(self):
        """EV_settings 17.0/15.1/13.0/11.0/9.1 -> -4.0/-2.1/0.0/+2.0/+3.9."""
        frames = [
            make_metadata(f"DSC{index:05d}.ARW", ev_setting=ev, offset_seconds=index * 0.8)
            for index, ev in enumerate([17.0, 15.1, 13.0, 11.0, 9.1], start=1)
        ]
        group = detect_brackets(frames).groups[0]

        assert rel_evs(group) == [-4.0, -2.1, 0.0, 2.0, 3.9]

    def test_step_outside_tolerance_is_rejected(self):
        result = detect_brackets(
            make_bracket(1, [-4.0, -2.0, 0.0, 2.0, 6.0]), DetectionSettings(sizes=(5,))
        )

        assert result.groups == ()
        assert len(result.ungrouped_images) == 5
        assert any("EV steps" in window.reason for window in result.rejected_windows)

    def test_a_broken_five_frame_bracket_degrades_to_a_three_frame_one(self):
        """With the default sizes the 3-frame pass rescues the valid sub-run."""
        result = detect_brackets(make_bracket(1, [-4.0, -2.0, 0.0, 2.0, 6.0]))

        assert [group.size for group in result.groups] == [3]
        assert result.groups[0].filenames == ("DSC00001.ARW", "DSC00002.ARW", "DSC00003.ARW")
        assert [image.filename for image in result.ungrouped_images] == [
            "DSC00004.ARW",
            "DSC00005.ARW",
        ]


class TestCaptureOrder:
    def test_reverse_capture_order_is_detected(self):
        result = detect_brackets(make_bracket(1, list(reversed(FIVE))))
        group = result.groups[0]

        assert group.capture_order is CaptureOrder.BRIGHT_TO_DARK
        assert rel_evs(group) == FIVE  # normalised output stays dark -> bright

    def test_three_frame_reverse_order(self):
        group = detect_brackets(make_bracket(1, list(reversed(THREE)))).groups[0]

        assert group.capture_order is CaptureOrder.BRIGHT_TO_DARK
        assert rel_evs(group) == THREE


class TestMultipleGroups:
    def test_two_consecutive_five_frame_brackets(self):
        frames = make_bracket(1, FIVE) + make_bracket(6, FIVE, start_offset=7.0)
        result = detect_brackets(frames)

        assert [group.size for group in result.groups] == [5, 5]
        assert result.groups[0].filenames == tuple(f"DSC{i:05d}.ARW" for i in range(1, 6))
        assert result.groups[1].filenames == tuple(f"DSC{i:05d}.ARW" for i in range(6, 11))
        assert result.ungrouped_images == ()

    def test_two_brackets_separated_by_a_tripod_move(self):
        frames = make_bracket(1, FIVE) + make_bracket(6, FIVE, start_offset=120.0)
        result = detect_brackets(frames)

        assert [group.size for group in result.groups] == [5, 5]
        assert result.stats["runs"] == 2

    def test_five_frame_pass_does_not_steal_from_a_leading_three_frame_bracket(self):
        """A 3-bracket followed by a 5-bracket inside one burst."""
        frames = make_bracket(1, THREE, reference_ev=12.0) + make_bracket(
            4, FIVE, start_offset=3.0, reference_ev=13.0
        )
        result = detect_brackets(frames)

        assert [group.size for group in result.groups] == [3, 5]
        assert result.groups[0].filenames == ("DSC00001.ARW", "DSC00002.ARW", "DSC00003.ARW")
        assert result.groups[1].filenames == tuple(f"DSC{i:05d}.ARW" for i in range(4, 9))
        assert result.ungrouped_images == ()

    def test_five_frame_bracket_followed_by_three_frame_bracket(self):
        frames = make_bracket(1, FIVE) + make_bracket(6, THREE, start_offset=7.0)
        result = detect_brackets(frames)

        assert [group.size for group in result.groups] == [5, 3]
        assert result.ungrouped_images == ()


class TestNonBrackets:
    def test_random_single_shots_are_not_grouped(self):
        """Unrelated frames with unrelated exposures must stay ungrouped."""
        settings_evs = [13.0, 13.0, 12.5, 16.0, 9.0, 13.2, 11.1]
        frames = [
            make_metadata(
                f"DSC{index:05d}.ARW", ev_setting=ev, offset_seconds=index * 25.0
            )
            for index, ev in enumerate(settings_evs, start=1)
        ]
        result = detect_brackets(frames)

        assert result.groups == ()
        assert len(result.ungrouped_images) == len(settings_evs)

    def test_identical_exposures_are_not_a_bracket(self):
        frames = make_bracket(1, [0.0, 0.0, 0.0, 0.0, 0.0])
        result = detect_brackets(frames)

        assert result.groups == ()
        assert any("EV steps" in window.reason for window in result.rejected_windows)

    def test_mixed_cameras_are_rejected(self):
        frames = make_bracket(1, FIVE)
        frames[2] = make_metadata(
            frames[2].filename,
            ev_setting=13.0,
            offset_seconds=1.6,
            camera_make="Canon",
            camera_model="EOS R5",
        )
        result = detect_brackets(frames)

        assert result.groups == ()
        assert any("different cameras" in window.reason for window in result.rejected_windows)

    def test_span_that_is_too_long_is_rejected(self):
        # 30 s from first to last frame, but the individual gaps stay below the
        # 8 s run threshold, so this really is one run that must be turned down.
        frames = make_bracket(1, FIVE, frame_interval=7.5)
        result = detect_brackets(frames, DetectionSettings(max_bracket_span=10.0))

        assert result.groups == ()
        assert any("capture span" in window.reason for window in result.rejected_windows)

    def test_min_confidence_can_reject_an_otherwise_valid_window(self):
        frames = make_bracket(1, [-4.2, -1.9, 0.0, 2.1, 3.8])
        result = detect_brackets(frames, DetectionSettings(min_confidence=1.0))

        assert result.groups == ()
        assert any("below the minimum" in window.reason for window in result.rejected_windows)


class TestMetadataGaps:
    def test_missing_exposure_compensation_does_not_matter(self):
        """Manual shutter bracketing leaves the bias field at 0 or absent."""
        frames = make_bracket(1, FIVE, exposure_compensation=None)
        result = detect_brackets(frames)

        assert len(result.groups) == 1
        assert all(
            image.metadata.exposure_compensation is None for image in result.groups[0].images
        )

    def test_all_frames_share_a_zero_exposure_compensation(self):
        frames = make_bracket(1, FIVE, exposure_compensation=0.0)
        assert len(detect_brackets(frames).groups) == 1

    def test_missing_shutter_time_is_reported_not_crashed(self):
        frames = make_bracket(1, FIVE)
        frames[2] = make_metadata(
            frames[2].filename,
            ev_setting=None,
            shutter_seconds=None,
            offset_seconds=1.6,
            read_errors=("missing metadata: ExposureTime",),
        )
        result = detect_brackets(frames)

        assert result.groups == ()
        assert result.stats["unreadable_files"] == 1
        assert len(result.ungrouped_images) == 5
        assert any(
            "incomplete exposure metadata" in window.reason
            for window in result.rejected_windows
        )

    def test_unreadable_frame_next_to_a_valid_bracket(self):
        frames = [
            make_metadata(
                "DSC00000.ARW",
                ev_setting=None,
                shutter_seconds=None,
                offset_seconds=-3.0,
                read_errors=("missing metadata: ExposureTime, FNumber, ISO",),
            ),
            *make_bracket(1, FIVE),
        ]
        result = detect_brackets(frames)

        assert [group.size for group in result.groups] == [5]
        assert [image.filename for image in result.ungrouped_images] == ["DSC00000.ARW"]

    def test_frames_without_timestamps_can_still_be_grouped_by_name(self):
        frames = [
            make_metadata(f"DSC{index:05d}.ARW", ev_setting=ev, no_timestamp=True)
            for index, ev in enumerate([17.0, 15.0, 13.0, 11.0, 9.0], start=1)
        ]
        result = detect_brackets(frames)

        assert len(result.groups) == 1
        group = result.groups[0]
        assert group.timestamp is None
        # The span cannot be verified, so timing scores neutral rather than perfect.
        assert group.confidence_parts.timing == pytest.approx(0.5)


class TestTimestamps:
    def test_identical_timestamps_still_group(self):
        """1-second EXIF resolution: all five frames report the same second."""
        frames = [
            make_metadata(f"DSC{index:05d}.ARW", ev_setting=ev, timestamp=BASE_TIME)
            for index, ev in enumerate([17.0, 15.0, 13.0, 11.0, 9.0], start=1)
        ]
        result = detect_brackets(frames)

        assert len(result.groups) == 1
        group = result.groups[0]
        assert rel_evs(group) == FIVE
        assert group.capture_order is CaptureOrder.DARK_TO_BRIGHT
        assert group.confidence_parts.timing == pytest.approx(1.0)

    def test_subsecond_timestamps_drive_the_ordering(self):
        """Filename order and capture order disagree; sub-seconds decide."""
        frames = [
            make_metadata(
                "IMG_0003.ARW", ev_setting=15.0, timestamp=BASE_TIME + timedelta(milliseconds=100)
            ),
            make_metadata(
                "IMG_0001.ARW", ev_setting=13.0, timestamp=BASE_TIME + timedelta(milliseconds=500)
            ),
            make_metadata(
                "IMG_0002.ARW", ev_setting=11.0, timestamp=BASE_TIME + timedelta(milliseconds=900)
            ),
        ]
        group = detect_brackets(frames).groups[0]
        assert group.capture_order is CaptureOrder.DARK_TO_BRIGHT

        # Without sub-second precision the same files sort by filename instead,
        # which reverses the apparent capture order.
        coarse = [
            make_metadata(
                record.filename,
                shutter_seconds=record.shutter_seconds,
                timestamp=BASE_TIME,
            )
            for record in frames
        ]
        coarse_group = detect_brackets(coarse).groups[0]
        assert coarse_group.capture_order is CaptureOrder.BRIGHT_TO_DARK

    def test_timezone_aware_and_naive_timestamps_do_not_crash_sorting(self):

        frames = make_bracket(1, FIVE)
        frames.append(
            make_metadata(
                "DSC00099.ARW",
                ev_setting=13.0,
                timestamp=datetime(2026, 3, 14, 12, 0, 0, tzinfo=UTC),
            )
        )
        result = detect_brackets(frames)

        assert [group.size for group in result.groups] == [5]
        assert [image.filename for image in result.ungrouped_images] == ["DSC00099.ARW"]

    def test_frame_gap_splits_a_long_sequence_into_runs(self):
        frames = make_bracket(1, FIVE, frame_interval=9.0)
        result = detect_brackets(frames)

        assert result.stats["runs"] == 5
        assert result.groups == ()


class TestInvariants:
    def test_no_frame_appears_in_two_groups_across_a_large_set(self):
        frames = []
        offset = 0.0
        for index in range(20):
            pattern = FIVE if index % 3 else THREE
            frames.extend(
                make_bracket(
                    1 + index * 10,
                    pattern,
                    start_offset=offset,
                    reference_ev=11.0 + (index % 4),
                )
            )
            offset += 60.0
        # A handful of unrelated single shots between the brackets.
        for index in range(5):
            frames.append(
                make_metadata(
                    f"SOLO{index:04d}.ARW",
                    ev_setting=12.3 + index,
                    offset_seconds=offset + index * 45.0,
                )
            )

        result = detect_brackets(frames)

        assert len(result.groups) == 20
        grouped = [str(image.metadata.path) for group in result.groups for image in group.images]
        assert len(grouped) == len(set(grouped))
        assert len(set(grouped)) == result.stats["grouped_files"]

        ungrouped = {str(image.metadata.path) for image in result.ungrouped_images}
        assert ungrouped.isdisjoint(set(grouped))
        assert len(grouped) + len(ungrouped) == len(frames)

    def test_duplicate_assignment_raises(self):
        group = detect_brackets(make_bracket(1, FIVE)).groups[0]

        with pytest.raises(BracketDetectionError):
            _assert_no_frame_reused([group, group])

    def test_empty_input_is_handled(self):
        result = detect_brackets([])

        assert result.groups == ()
        assert result.ungrouped_images == ()
        assert result.stats["total_files"] == 0

    def test_result_serialises_to_json_friendly_types(self):
        import json

        result = detect_brackets(make_bracket(1, FIVE), backend_used="synthetic")
        payload = json.loads(json.dumps(result.to_dict()))

        assert payload["backend_used"] == "synthetic"
        assert payload["groups"][0]["capture_order"] == "dark_to_bright"
        assert payload["groups"][0]["reference_filename"] == "DSC00003.ARW"


class TestSettings:
    def test_custom_sizes_allow_seven_frame_brackets(self):
        seven = [-6.0, -4.0, -2.0, 0.0, 2.0, 4.0, 6.0]
        result = detect_brackets(
            make_bracket(1, seven), DetectionSettings(sizes=(7, 5, 3))
        )

        assert [group.size for group in result.groups] == [7]
        assert rel_evs(result.groups[0]) == seven

    def test_custom_expected_step(self):
        one_ev = [-2.0, -1.0, 0.0, 1.0, 2.0]
        result = detect_brackets(make_bracket(1, one_ev), DetectionSettings(expected_step=1.0))

        assert [group.size for group in result.groups] == [5]

    @pytest.mark.parametrize(
        "kwargs",
        [
            {"sizes": ()},
            {"sizes": (1,)},
            {"expected_step": 0.0},
            {"tolerance": -1.0},
            {"min_confidence": 1.5},
            {"max_frame_gap": 0.0},
        ],
    )
    def test_invalid_settings_are_rejected(self, kwargs):
        with pytest.raises(ValueError):
            DetectionSettings(**kwargs)

    def test_iso_bracketing_lowers_consistency_but_still_groups(self):
        """A bracket shot by varying ISO instead of shutter is still a bracket."""
        frames = []
        for index, (iso, rel) in enumerate(
            zip([1600, 400, 100, 100, 100], FIVE, strict=True)
        ):
            shutter = None
            frames.append(
                make_metadata(
                    f"DSC{index + 1:05d}.ARW",
                    ev_setting=13.0 - rel,
                    iso=iso,
                    shutter_seconds=shutter,
                    offset_seconds=index * 0.8,
                )
            )
        result = detect_brackets(frames)

        assert [group.size for group in result.groups] == [5]
        assert result.groups[0].confidence_parts.consistency == pytest.approx(0.5)
