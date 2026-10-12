# ADR-0002: Primary categories describe tool objects/domains

- Status: Accepted
- Date: 2026-10-12
- Context: Conversion/generation operation groups overlap with text, data, security, network and media domains. Related JSON, list, password and date tools were scattered. User approved the proposed reclassification.
- Decision: Use 13 primary categories: text, data, encoding, crypto, web, developer, network, math, datetime, image, video, audio, pdf. Keep one primary category per tool. Operations are functional tags used for cross-category discovery. Runtime tags stay in metadata/details but leave filter/card surfaces. Shared category definitions drive sidebar, pages and routing metadata; tool module metadata owns individual assignments.
- Compatibility: Tool URLs, aliases and persisted favorites/recents are unchanged. Retired generator/converter routes and home anchors open tag filters. Measurement/network-test redirect to datetime/network; platform redirects home. Info masking is a security tool; screenshot share is an image tool. Settings/reports retain their standalone routes.
- Tradeoff: A tool processing multiple objects uses its most likely discovery domain (Wi-Fi QR under network, image animation under video). Tags and keywords provide the other discovery paths. Retained category IDs stay stable; only encoding and datetime are new.
- Alternatives: Retain mixed classification (continued ambiguity); merge all media into one category (less precise discovery); duplicate tools into multiple primary categories (duplicate cards and counts).
