# 0001 - Navigation and app shell structure

**Date**: 2026-09-04
**Module**: app-shell
**Status**: Accepted

## Context

Need to define how users navigate between modules and what the overall app frame
looks like, before `proto-lofi` builds module screens.

## Decision

**Responsive** shell with two navigation variants:

- Desktop: **top bar** in the header (brand + 4 module links).
- Mobile: **fixed bottom tabs** (4 icons + labels).

Only 4 of the 6 design modules are top-level nav destinations — `Today` (`today`),
`Paths` (`paths`), `Inbox` (`capture-triage`), `Log` (`winlog`). `vision` and
`goals` are sub-navigation inside a Path.

- **Home** (`/`) redirects to `/today`. No separate dashboard — stats/streaks live
  in the Log module.
- **Content container**: responsive, centred, max-width 1200px.
- **No breadcrumbs** — Path/Goal names run too long.
- **Header** always visible (sticky), with a reserved right-side slot for future
  settings/export. **Footer** non-fixed at the end of the content flow, mainly for
  mobile. **No notifications.** Skip link to `#main-content` for WCAG 2.2 AAA.

Routing via `react-router-dom` v7; `BrowserRouter` `basename` bound to Vite's
`BASE_URL` so it works under the `/bricks/` GitHub Pages path. Route segments equal
module code names.

## Impact

All `proto-lofi` modules render inside `AppShell`. Navigation between modules is
the shell's responsibility. `proto-lofi` replaces the catch-all `/:moduleName`
route with real per-module routes (and nests `vision` / `goals` under
`/paths/:pathId`). Changing navigation = edit `src/shared/navigation.ts` +
`docs/UI-STRATEGY.md`.
