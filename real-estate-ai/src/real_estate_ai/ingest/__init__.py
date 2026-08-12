"""Ingest stage: RAW discovery, metadata reading and bracket detection.

This is the first stage of the pipeline and the only one implemented so far.
It reads metadata only - no pixel data is decoded here.
"""

from real_estate_ai.ingest.bracket_detector import (
    BracketDetectionError,
    DetectionSettings,
    detect_brackets,
)
from real_estate_ai.ingest.exposure import (
    ev_setting,
    ev_setting_for_metadata,
    expected_rel_ev_pattern,
    relative_ev,
    relative_ev_sequence,
)
from real_estate_ai.ingest.metadata import (
    RAW_EXTENSIONS,
    ExifReadReader,
    ExifToolReader,
    MetadataReader,
    NullMetadataReader,
    discover_raw_files,
    read_directory,
    select_reader,
)

__all__ = [
    "BracketDetectionError",
    "DetectionSettings",
    "ExifReadReader",
    "ExifToolReader",
    "MetadataReader",
    "NullMetadataReader",
    "RAW_EXTENSIONS",
    "detect_brackets",
    "discover_raw_files",
    "ev_setting",
    "ev_setting_for_metadata",
    "expected_rel_ev_pattern",
    "read_directory",
    "relative_ev",
    "relative_ev_sequence",
    "select_reader",
]
