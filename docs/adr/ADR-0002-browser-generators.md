# ADR-0002: Browser-native entropy and local OTP/BIP39 encoding
- Status: Accepted
- Date: 2026-10-11
- Context: browser reproduction shows otplib default Node crypto adapter crashes; bip39 encoding relies on a global Buffer absent in browser. OTP also used raw TOTP generation for a Base32 authenticator secret, failing RFC 6238 vectors.
- Options: introduce Node crypto/Buffer polyfills; add browser-specific libraries; or reuse existing CryptoJS hash/HMAC and bip39 English wordlist with small standard encoding routines.
- Decision: use Web Crypto getRandomValues for entropy, existing CryptoJS SHA256 for BIP39 checksum and HmacSHA1 for six-digit/30-second TOTP. Base32 decoding is explicit. Keep current synchronous component contracts and current-step verification. No new dependencies.
- Verification: RFC 6238 SHA1 vector, BIP39 known vector, all five word counts independently validated by reference bip39 library, browser generation/validation and OTP rendering.
- Consequence: small encoding routines are maintained locally and require standard-vector regression tests. No Node globals or crypto shims needed for these tools.
