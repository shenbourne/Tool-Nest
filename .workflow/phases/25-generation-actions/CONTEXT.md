# Generation action consistency

Scope: explicit bilingual generation labels, primary teal solid buttons, left parameters/right action for BIP39, UUID, ULID and random-number rows. Existing password/RSA labels and primary styling already conform. Token retains full-width button.

Plan: audit manual generation handlers; update labels/styles and parameter rows; lint/typecheck/test/build; inspect module consistency. No algorithm changes. TDD skipped for presentation-only updates; health review invoked for multiple tool modules and shared row style. No new dependency or component abstraction.

Remote: private fetch succeeded after one TLS failure, private/master 742c5e3. Shared feature branch behind 27 commits; unrelated dirty source/style/locales prevent safe branch replacement. Preserve them; isolate this task for publication after verification.
