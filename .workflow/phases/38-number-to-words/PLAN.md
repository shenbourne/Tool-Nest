# Plan
1. Reproduce numeric-input rejection with an executable component-script regression test.
2. Correct the digit expression; reject values outside safe integer precision to avoid incorrect wording.
3. Expand existing Chinese/English description strings: purpose, examples, syntax/range, exclusions, browser processing.
4. Run regression/full frontend tests, scoped lint, typecheck and build; review the scoped diff.
5. Mirror only scoped changes into the shared preview; commit and publish private feature branch. No master merge.
