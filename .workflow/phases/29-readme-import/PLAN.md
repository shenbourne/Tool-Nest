# Plan

1. Add README-specific file/URL selector to directory editor.
2. Import into existing README override; retain original on failure.
3. Test URL validation/failures and ZIP persistence; run tests, typecheck, build and scoped lint.
4. Review, record acceptance and synchronize isolated feature branch.

Scope extension: import existing single-app ZIP, parse editable metadata and source version, preserve old versions/root files/binary assets, clone source version to a distinct new version, preserve custom YAML fields and parameter forms. Add archive loader/composer and regression tests first. Support official direct version directories and existing ToolNest versions/ layout. Reject ambiguous/malformed/unsafe archives; no server extraction. Browser verification pending.

User refinement: remove instruction alert and manual exit button; empty upload selection exits package mode. Guard stale async imports on removal/replacement. Browser verification and scoped checks. No structural changes; further health review not applicable.
