<!--
Sync Impact Report
- Version change: (template) -> 1.0.0
- Principles added: I. SOLID Design; II. DRY, Single Source of Truth; III. Test-First with 80% Coverage Gate;
  IV. Pure Domain Core; V. Offline-First PWA; VI. Accessible, Mobile-First UI; VII. Simplicity
- Sections added: Technology Constraints; Development Workflow and Quality Gates; Governance
- Templates checked: plan-template.md (Constitution Check gate, compatible), spec-template.md (compatible),
  tasks-template.md (compatible; tests are mandatory for this project per Principle III)
- Deferred TODOs: none
-->

# nōmən Constitution

## Core Principles

### I. SOLID Design

- **Single responsibility**: every module, component and hook has one reason to change. Scoring,
  board generation, solvability checking, word validation, level rules and state transitions are
  separate modules.
- **Open/closed**: difficulty tuning, letter values and letter weights are data. Changing them MUST
  NOT require editing game logic.
- **Liskov substitution**: any implementation of a port (dictionary, random source, clock, score
  store) MUST be usable wherever the port is expected, including test fakes.
- **Interface segregation**: ports are small and specific. No consumer depends on methods it does
  not call.
- **Dependency inversion**: game logic depends on port interfaces, never on browser APIs. Concrete
  implementations are wired in exactly one composition root.

### II. DRY, Single Source of Truth

Every rule and constant is defined once: letter values, letter weights, the vowel set, board size,
word-length bounds and the level table each live in one module and are imported everywhere else,
including tests and UI. Duplicated logic found in review MUST be extracted before merge. Derived
values (for example the minimum vowel count) are computed from their sources, not restated.

### III. Test-First with 80% Coverage Gate (NON-NEGOTIABLE)

- Tests are written before the code they cover and MUST be seen to fail first.
- Unit test coverage MUST be at least 80% for lines, branches, functions and statements. The
  threshold is enforced by the test runner; a run below threshold fails the build.
- Domain modules target 95% or higher, since they hold the game rules.
- Tests MUST be deterministic: randomness and time are injected and faked. No test may depend on
  real timers, real randomness or the network.
- Generated assets and pure configuration/bootstrap files may be excluded from coverage; each
  exclusion MUST be listed and justified in the test configuration.

### IV. Pure Domain Core

Game rules live in framework-free, side-effect-free code. Domain modules MUST NOT import the UI
framework, touch the DOM, read the system clock, call a random number generator directly, or use
browser storage. The UI layer renders state and forwards intents; it contains no game rules.

### V. Offline-First PWA

The game MUST be fully playable with no network after the first successful load. Word validation
and the board guarantees are computed on the device. The app MUST be installable to a home screen
and launch standalone. No gameplay feature may require a server.

### VI. Accessible, Mobile-First UI

Layouts are designed for a 320 px wide portrait phone first and scale up. Interactive targets are
at least 44 by 44 CSS pixels. Everything is operable by touch and by keyboard, labelled for screen
readers, and meets WCAG 2.1 AA contrast. Information is never conveyed by colour alone, and
`prefers-reduced-motion` is honoured.

### VII. Simplicity

Build only what the specification requires. No abstraction without at least one real consumer plus
a test fake, no dependency added where a few lines of code suffice, no speculative features.
Complexity that violates this principle MUST be justified in the plan's Complexity Tracking table.

## Technology Constraints

- **UI**: React with TypeScript in strict mode.
- **Delivery**: progressive web application (web app manifest, service worker, offline cache),
  installable on mobile as an HTML5 application.
- **Testing**: a unit test runner with built-in coverage thresholds, plus component tests that
  exercise the UI through user-visible behaviour.
- **Data**: all game data is local to the device. No accounts, no analytics, no personal data
  collection.
- **Licensing**: bundled word data MUST come from a source whose licence permits redistribution,
  and the licence notice MUST ship with the app.

## Development Workflow and Quality Gates

A change is mergeable only when all of the following hold:

1. Lint and type-check pass with zero errors.
2. All tests pass and coverage meets Principle III.
3. The production build succeeds and the offline/installability checks in the quickstart pass.
4. The change traces to a requirement in the feature spec or a task in the task list.
5. Any principle violation is recorded and justified in the plan's Complexity Tracking table.

Work proceeds through spec-kit's phases: specify, plan, tasks, implement. Requirements change in
the spec first, then flow to the plan and tasks.

## Governance

This constitution supersedes other project conventions. Amendments are made by editing this file
with a Sync Impact Report, bumping the version (major: principle removed or redefined; minor:
principle or section added; patch: clarification), and updating dependent templates and documents.
Every plan MUST include a Constitution Check, and every review MUST verify compliance.

**Version**: 1.0.0 | **Ratified**: 2026-10-11 | **Last Amended**: 2026-10-11
