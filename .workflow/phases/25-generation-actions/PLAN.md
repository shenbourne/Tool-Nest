# Generation action consistency

Scope: explicit bilingual generation labels, primary teal solid buttons, left parameters/right action for BIP39, UUID, ULID and random-number rows. Existing password/RSA labels and primary styling already conform. Token retains full-width button.

Plan: audit manual generation handlers; update labels/styles and parameter rows; lint/typecheck/test/build; inspect module consistency. No algorithm changes. TDD skipped for presentation-only updates; health review invoked for multiple tool modules and shared row style. No new dependency or component abstraction.

Remote: private fetch succeeded after one TLS failure, private/master 742c5e3. Shared feature branch behind 27 commits; unrelated dirty source/style/locales prevent safe branch replacement. Preserve them; isolate this task for publication after verification.

Fix follow-up scope authorized: browser-native secure entropy/BIP39 checksum and standard Base32 TOTP, regression vectors, narrow sidebar collapse without persisting preference, and explicit visible switch labels. Existing browser reproductions are the red UI loop; RFC OTP vector also failed before fix. Hypotheses confirmed: Node crypto/Buffer paths, fixed sidebar and unsupported switch default label slot. Use existing CryptoJS and bip39 wordlist, no dependency added. Recheck services and browser widths before completion.
