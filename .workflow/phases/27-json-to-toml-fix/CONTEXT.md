# Context
JSON to TOML fails on module initialization in browsers: @iarna/toml loads create-date.js, which references global.Date. Serializer-only import avoids unrelated parser and stream code. Preserve all conversion and error semantics.
