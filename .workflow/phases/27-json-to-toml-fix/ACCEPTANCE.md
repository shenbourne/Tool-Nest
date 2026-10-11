# Acceptance
- PASS: browser-like VM with no Node global loads bundled converter; original import failed with ReferenceError: global is not defined, fixed import passes.
- PASS: nested JSON outputs expected TOML, blank input stays empty, invalid JSON and null report errors.
- PASS: no dependency addition or global shim; UI and routing unchanged.
- Actual browser clicks/visual verification NOT RUN; module execution regression is verified.
