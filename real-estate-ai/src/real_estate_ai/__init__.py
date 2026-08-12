"""real_estate_ai - local-only processing pipeline for real-estate photography.

Step 01 implements the ingest stage only: RAW file discovery, metadata
reading and exposure-bracket detection.  No pixel data is read or written.

Pipeline (later stages are NOT implemented yet)::

    ingest -> RAW decode -> alignment -> HDR merge -> tone mapping
           -> window pull -> retouch -> export
"""

__version__ = "0.1.0"

__all__ = ["__version__"]
