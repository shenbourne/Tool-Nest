# Context
Fix otp-generator blank route (crypto.randomBytes is not a function). Preserve existing shared edits. Remote private/master fetched at 742c5e3; local master ahead 34/behind 0. Isolated feature/phase-33-otp-fix starts at remote base. No relevant ADR: file-upload ADR unrelated.
# Plan
1. Reproduce browser failure and add deterministic service regressions.
2. Replace Node-only OTP preset with existing crypto-js HMAC-SHA1 and secure browser-compatible randomness; decode Base32 for authenticator compatibility.
3. Test RFC vectors, verification, QR URI, countdown, live route, regenerate and verify. Run web tests, typecheck, lint and build.
4. Review, record acceptance, publish feature branch; mirror scoped service fix into shared working tree without changing existing UI edits. No merge.
Workflow health audit skipped: localized service fix, no abstraction or dependency change. Deep diagnosis skipped: exact deterministic browser stack identifies dependency failure.
