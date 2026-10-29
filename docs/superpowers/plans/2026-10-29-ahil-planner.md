# Ahil Planner Implementation Plan

> Execute inline using superpowers:executing-plans.

**Goal:** Build the approved browser-based task planner.
**Architecture:** React owns task state; localStorage persists it. Vite builds a static application.
**Tech Stack:** React, Vite, Vitest, Testing Library, jsdom.
**Spec:** docs/superpowers/specs/2026-10-29-ahil-planner-design.md

## Global Constraints
No accounts, backend, or cross-device sync. Maximum three active priorities. Responsive layout and optional deadlines.

## Review Focus
Whitespace-only titles; priority cap; completed priorities; malformed storage; unavailable storage.

### Task 1: Working planner
Files: package.json, index.html, src/App.jsx, src/main.jsx, src/styles.css, src/App.test.jsx.
Interface: App component loads/saves task objects {id,title,due,completed,priority} under ahil-planner-v1.
- [x] Write interaction tests covering creation/editing/deletion/completion, persistence, empty titles, priority cap/release, and storage failures.
- [x] Run tests and observe missing-app failure.
- [x] Implement accessible responsive UI and storage handling.
- [x] Run npm test and npm run build; inspect served HTML.

### Task 2: Handoff
Files: README.md, .gitignore.
- [x] Document install, test, build, startup, and browser-only storage limitations.
- [x] Review implementation and rerun required checks.

Execution: continue directly under the user's instruction to proceed; no additional approval needed. Use the existing isolated cloud checkout. Leave changes uncommitted for review.

## Verification record
Eight Vitest tests pass. Production build passes. Chromium checks passed at desktop and 390px mobile widths: create, prioritize, reload, complete, no page errors or horizontal overflow. Independent review identified corrupt-storage preservation, multi-tab conflicts, and low-contrast secondary text; these were addressed, with two storage regressions observed failing before fixes and passing afterward.
