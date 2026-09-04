# UI Strategy

The application shell — the frame every module screen renders inside. Structure only (where things are, how the user moves between them); visual decisions belong to `proto-brand` / `proto-design`.

## Platform

**Responsive.** Desktop and mobile both matter: planning and the Vision board suit a wide screen; capturing to the Inbox and ticking off Actions happen on the phone. Two navigation variants.

## Navigation

- **Desktop**: **top bar** — brand on the left, 4 module links inline in the header. Hidden below the `md` breakpoint.
- **Mobile**: **bottom tabs** — 4 fixed icons + labels at the viewport bottom. Hidden at `md` and up.
- Only **4 of the 6 design modules** are top-level destinations. `vision` and `goals` are sub-navigation reached from inside a Path (Path overview → its Vision board / its Goals), not the main nav.

## Home page

`/` redirects straight to **`/today`** (the Today view). No separate dashboard — the summary/stats/streak surface lives inside the **Log** module (`winlog`), which already owns `ContributionGraph` and win history.

## Module navigation

| Module (code) | Label (display) | Route | Order |
|---|---|---|---|
| `today` | Dziś | `/today` | 1 |
| `paths` | Drogi | `/paths` | 2 |
| `capture-triage` | Inbox | `/capture-triage` | 3 |
| `winlog` | Log | `/winlog` | 4 |

Route segment == module code name, so `proto-lofi` maps each route to its module folder directly. `vision` and `goals` get nested routes under `/paths/:pathId/...` when `proto-lofi` reaches them.

## Content layout

- **Container**: responsive — centred, `max-width: 1200px`, `px-4` gutters on desktop; full-width with the same gutters on mobile.
- **Breadcrumbs**: **no.** Path and Goal names run long; a breadcrumb trail would be more text than signal. `proto-lofi` uses contextual headers / back affordances inside deep flows instead.

## Shared elements

- **Header**: yes — always visible, sticky. Brand ("Bricks", links home) + desktop top-bar nav + an empty right-side slot reserved for future actions (settings, export).
- **Footer**: yes — **non-fixed**, at the end of the content flow. Mostly for mobile, where the user scrolls past content to reach it (the fixed bottom tabs sit below it; the content wrapper carries `pb-16` so it clears them). Placeholder links: Ustawienia, Eksport, O aplikacji.
- **Notifications**: no — single-user local tool.
- **Skip link**: "Przejdź do treści" jump to `#main-content` (WCAG 2.2 AAA target).

## Files

| File | Role |
|---|---|
| `src/shared/navigation.ts` | `NAV_ITEMS` config + `HOME_PATH` |
| `src/shared/components/AppShell.tsx` | Layout wrapper: skip link, header, content container, footer, bottom tabs |
| `src/shared/components/AppHeader.tsx` | Sticky header, brand + slot |
| `src/shared/components/TopNav.tsx` | Desktop top-bar nav (`hidden md:flex`) |
| `src/shared/components/BottomTabs.tsx` | Mobile fixed bottom tabs (`md:hidden`) |
| `src/shared/components/AppFooter.tsx` | Non-fixed footer |
| `src/shared/components/ModulePlaceholder.tsx` | Stand-in for module screens until `proto-lofi` |
| `src/App.tsx` | `BrowserRouter` (`basename` = Vite `BASE_URL`) + routes |
