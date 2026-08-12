"""Exposure-value mathematics.

This module is pure arithmetic over plain numbers so that it can be tested
without touching files, EXIF libraries or the bracket detector.

The one thing that is easy to get subtly wrong here is the *sign*, so it is
spelled out:

``EV_setting`` is the exposure value of the camera setting::

    EV_setting = log2(N^2 / t) - log2(ISO / 100)

with ``N`` the f-number, ``t`` the exposure time in seconds and ``ISO`` the
sensitivity.  A HIGHER ``EV_setting`` means LESS light reaches the sensor,
i.e. a DARKER image.

The photographer's "-4 EV / 0 EV / +4 EV" labels describe image *brightness*
and therefore run in the opposite direction.  The brightness offset of a
frame relative to the reference frame of its group is::

    rel_ev(i) = EV_setting(reference) - EV_setting(i)

so ``rel_ev(reference) == 0`` by construction, a longer exposure time yields a
POSITIVE ``rel_ev`` (brighter), and a shorter exposure time yields a NEGATIVE
``rel_ev`` (darker).

Absolute EV values are irrelevant to bracket detection - only the differences
within a group are used.
"""

from __future__ import annotations

import math
from collections.abc import Sequence

from real_estate_ai.models.bracket import RawFileMetadata

__all__ = [
    "ev_setting",
    "ev_setting_for_metadata",
    "expected_rel_ev_pattern",
    "reference_position",
    "relative_ev",
    "relative_ev_sequence",
    "shutter_seconds_for_ev",
]


def ev_setting(
    aperture: float | None,
    shutter_seconds: float | None,
    iso: float | None,
) -> float | None:
    """Return ``log2(N^2 / t) - log2(ISO / 100)`` or ``None``.

    ``None`` is returned whenever one of the three values is missing or
    physically impossible (zero or negative).  Missing metadata is a normal
    condition, not an error.
    """
    if aperture is None or shutter_seconds is None or iso is None:
        return None
    if aperture <= 0 or shutter_seconds <= 0 or iso <= 0:
        return None
    return math.log2((aperture * aperture) / shutter_seconds) - math.log2(iso / 100.0)


def ev_setting_for_metadata(metadata: RawFileMetadata) -> float | None:
    """Convenience wrapper around :func:`ev_setting` for a metadata record."""
    return ev_setting(metadata.aperture, metadata.shutter_seconds, metadata.iso)


def shutter_seconds_for_ev(target_ev: float, aperture: float = 8.0, iso: float = 100.0) -> float:
    """Inverse of :func:`ev_setting` - the exposure time giving *target_ev*.

    Used by the test-suite to build synthetic frames with exact EV values, and
    handy when explaining a detected bracket to a user.
    """
    if aperture <= 0 or iso <= 0:
        raise ValueError("aperture and iso must be positive")
    return (aperture * aperture) * 100.0 / (iso * (2.0**target_ev))


def relative_ev(reference_ev_setting: float, frame_ev_setting: float) -> float:
    """Brightness offset of a frame relative to the group's reference frame."""
    return reference_ev_setting - frame_ev_setting


def reference_position(size: int) -> int:
    """Index of the reference frame inside a dark -> bright ordered group.

    The reference is the frame with the median ``EV_setting``.  For the odd
    group sizes this project supports (3, 5, and later 7 or 9) this is
    unambiguous and equals ``size // 2``.  For an even size there is no single
    median frame; ``size // 2`` then picks the upper median, which keeps the
    algorithm total but makes the expected pattern asymmetric.
    """
    if size < 2:
        raise ValueError(f"a bracket needs at least 2 frames, got {size}")
    return size // 2


def expected_rel_ev_pattern(size: int, step: float) -> tuple[float, ...]:
    """The nominal ``rel_ev`` pattern of a bracket, dark -> bright.

    ``expected_rel_ev_pattern(5, 2.0)`` -> ``(-4.0, -2.0, 0.0, 2.0, 4.0)``
    ``expected_rel_ev_pattern(3, 2.0)`` -> ``(-2.0, 0.0, 2.0)``
    """
    reference = reference_position(size)
    return tuple((index - reference) * step for index in range(size))


def relative_ev_sequence(ev_settings: Sequence[float]) -> tuple[tuple[float, ...], int]:
    """Normalise measured ``EV_setting`` values to a ``rel_ev`` sequence.

    *ev_settings* may be given in any order.  The returned sequence is sorted
    dark -> bright (ascending ``rel_ev``, i.e. descending ``EV_setting``) and
    the second element is the index of the reference frame within it.

    Example::

        >>> seq, ref = relative_ev_sequence([17.0, 15.1, 13.0, 11.0, 9.1])
        >>> [round(value, 6) for value in seq]
        [-4.0, -2.1, 0.0, 2.0, 3.9]
        >>> ref
        2
    """
    if not ev_settings:
        raise ValueError("ev_settings must not be empty")
    ordered = sorted(ev_settings, reverse=True)  # darkest (highest EV) first
    reference = reference_position(len(ordered)) if len(ordered) > 1 else 0
    reference_ev = ordered[reference]
    return tuple(relative_ev(reference_ev, value) for value in ordered), reference
