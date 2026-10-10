# Issue tracker: Local Markdown

Issues and specs for this repo live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are stored separately at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`
- Ticket numbers start at `01`
- Triage state is recorded with a `Status:` line near the top
- Comments are appended under a `## Comments` heading

## Publishing

When a skill says “publish to the issue tracker”, create the corresponding file under `.scratch/<feature-slug>/`.

## Fetching

Read the referenced Markdown file directly. The user will normally provide its path or ticket number.

## Wayfinding

- Map: `.scratch/<effort>/map.md`
- Child ticket: `.scratch/<effort>/issues/<NN>-<slug>.md`
- Ticket type is recorded with `Type:`
- Ticket state is recorded with `Status:`
- Dependencies are recorded with `Blocked by:`
- Claim work by setting `Status: claimed`
- Resolve work by adding `## Answer`, setting `Status: resolved`, and updating the map
