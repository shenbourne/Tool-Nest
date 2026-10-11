# Context — TOML converter browser loading
User requested fixing JSON to TOML, TOML to JSON, and every other tool with the same problem. All four @iarna/toml consumers were identified: JSON to TOML, YAML to TOML, TOML to JSON, TOML to YAML.
Library entry loads parser with global.Date at initialization. Parser also uses global.Buffer checks and global.BigInt. Browser has globalThis, not Node global. Serialization-only imports avoid parser entirely; Vite maps the three concrete globals for parser tools in development pre-bundling and production builds. No runtime global shim.
