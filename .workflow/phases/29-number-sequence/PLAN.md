# Plan
1. Replace NumberGenerator.vue input parser with typed controls; retain existing service and shared output actions.
2. Add bilingual labels, semantic color tokens, responsive cards and keyboard focus.
3. Verify service tests, typecheck, production build, scoped lint; review count boundaries and result freshness.
4. Commit and publish isolated feature; leave merge pending. TDD skipped for presentation-only component restructuring; existing service tests cover sequence values. Browser visual acceptance required and recorded separately.

Follow-up: user requests live generation. Replace stored result and submit action with computed output; enable input-time updates; invalid counts clear output and show range guidance. Preserve copy/export and card design.

Follow-up scope: starting value is a lower bound (user confirmed), including Fibonacci. Add service argument with zero default, safe Fibonacci term limit by start, bounded start field and real-time output. RED observed: 3 new tests failed before implementation.

Follow-up: keep starting-value hint on a single line. Shorten bilingual hint to fit the existing 150px field and use nowrap. No behavior changes; new tests not applicable.
