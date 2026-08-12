"""Tests for the exposure mathematics - especially the sign convention."""

from __future__ import annotations

import math

import pytest

from real_estate_ai.ingest.exposure import (
    ev_setting,
    ev_setting_for_metadata,
    expected_rel_ev_pattern,
    reference_position,
    relative_ev,
    relative_ev_sequence,
    shutter_seconds_for_ev,
)
from tests.conftest import make_metadata


class TestEvSetting:
    def test_sunny_reference_value(self):
        # f/1.0, 1 s, ISO 100 -> log2(1/1) - log2(1) = 0
        assert ev_setting(1.0, 1.0, 100) == pytest.approx(0.0)

    def test_known_value(self):
        # f/8, 1/250 s, ISO 100 -> log2(64 * 250) = log2(16000)
        assert ev_setting(8.0, 1 / 250, 100) == pytest.approx(math.log2(16000.0))

    def test_doubling_iso_lowers_ev_by_one(self):
        base = ev_setting(8.0, 1 / 250, 100)
        doubled = ev_setting(8.0, 1 / 250, 200)
        assert base is not None and doubled is not None
        assert base - doubled == pytest.approx(1.0)

    def test_doubling_exposure_time_lowers_ev_by_one(self):
        short = ev_setting(8.0, 1 / 250, 100)
        long = ev_setting(8.0, 1 / 125, 100)
        assert short is not None and long is not None
        assert short - long == pytest.approx(1.0)

    @pytest.mark.parametrize(
        "aperture,shutter,iso",
        [
            (None, 1 / 250, 100),
            (8.0, None, 100),
            (8.0, 1 / 250, None),
            (0.0, 1 / 250, 100),
            (8.0, 0.0, 100),
            (8.0, 1 / 250, 0),
            (-8.0, 1 / 250, 100),
        ],
    )
    def test_missing_or_impossible_values_yield_none(self, aperture, shutter, iso):
        assert ev_setting(aperture, shutter, iso) is None

    def test_roundtrip_through_shutter_helper(self):
        for target in (-3.5, 0.0, 9.0, 17.25):
            shutter = shutter_seconds_for_ev(target, aperture=5.6, iso=400)
            assert ev_setting(5.6, shutter, 400) == pytest.approx(target)

    def test_metadata_wrapper(self):
        record = make_metadata("DSC00001.ARW", ev_setting=13.0)
        assert ev_setting_for_metadata(record) == pytest.approx(13.0)

    def test_metadata_wrapper_without_shutter(self):
        record = make_metadata("DSC00001.ARW", ev_setting=None, shutter_seconds=None)
        assert ev_setting_for_metadata(record) is None


class TestSignConvention:
    def test_longer_exposure_time_gets_positive_rel_ev(self):
        """Requirement: same aperture and ISO -> the longer exposure is brighter."""
        short = ev_setting(8.0, 1 / 250, 100)
        long = ev_setting(8.0, 1 / 60, 100)
        assert short is not None and long is not None

        # The darker (shorter) frame has the HIGHER EV_setting.
        assert short > long

        # Take the short frame as reference: the long exposure must be positive.
        assert relative_ev(short, long) > 0
        assert relative_ev(long, short) < 0

    def test_reference_frame_is_zero(self):
        sequence, reference = relative_ev_sequence([17.0, 15.0, 13.0, 11.0, 9.0])
        assert sequence[reference] == pytest.approx(0.0)

    def test_measured_sequence_normalises_to_expected_pattern(self):
        """The exact example from the specification."""
        sequence, reference = relative_ev_sequence([17.0, 15.1, 13.0, 11.0, 9.1])
        assert reference == 2
        assert [round(value, 6) for value in sequence] == [-4.0, -2.1, 0.0, 2.0, 3.9]

    def test_sequence_is_order_independent(self):
        shuffled, _ = relative_ev_sequence([11.0, 17.0, 9.1, 13.0, 15.1])
        ordered, _ = relative_ev_sequence([17.0, 15.1, 13.0, 11.0, 9.1])
        assert shuffled == ordered

    def test_three_frame_sequence(self):
        sequence, reference = relative_ev_sequence([15.0, 13.0, 11.0])
        assert reference == 1
        assert [round(value, 6) for value in sequence] == [-2.0, 0.0, 2.0]

    def test_empty_sequence_rejected(self):
        with pytest.raises(ValueError):
            relative_ev_sequence([])


class TestExpectedPattern:
    def test_five_frame_pattern(self):
        assert expected_rel_ev_pattern(5, 2.0) == (-4.0, -2.0, 0.0, 2.0, 4.0)

    def test_three_frame_pattern(self):
        assert expected_rel_ev_pattern(3, 2.0) == (-2.0, 0.0, 2.0)

    def test_seven_frame_pattern_is_supported_without_code_changes(self):
        assert expected_rel_ev_pattern(7, 1.0) == (-3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0)

    def test_custom_step(self):
        assert expected_rel_ev_pattern(3, 1.5) == (-1.5, 0.0, 1.5)

    @pytest.mark.parametrize("size,expected", [(3, 1), (5, 2), (7, 3), (9, 4)])
    def test_reference_position(self, size, expected):
        assert reference_position(size) == expected

    def test_reference_position_rejects_degenerate_size(self):
        with pytest.raises(ValueError):
            reference_position(1)
