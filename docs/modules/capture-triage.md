# Capture / Triage

## Vision

`capture-triage` is the front door for every `Action` and the antidote to
decision paralysis. It has two deliberately decoupled halves:

1. **Capture** — near-zero-friction. Drop an idea into the Inbox with just a
   name, from anywhere in the app, without deciding anything else. Capturing
   must never interrupt whatever the Owner is currently doing.
2. **Triage** — a dedicated, full-screen, card-by-card review mode (the
   DoItDone / AutoWork pattern) entered separately, later. One Inbox `Action`
   at a time: assign it to a `Goal`, assign it standalone to a `Path`, promote
   it into a `Goal` of its own if it turns out to need many actions, or
   discard it.

Splitting capture from triage is the point — it lets the Owner get an idea
out of their head instantly, and defers every decision about it to a
dedicated moment instead of forcing a choice mid-flow. This is the most
novel interaction in the app; there's no obvious reference for it in
mainstream goal-tracking tools.

## User Flows

### Quick capture

1. A lightweight capture entry point is available from the app shell on
   every screen (not just inside this module) — e.g. a persistent "+ Capture"
   affordance.
2. Owner opens it → a single-field input (name only) → types the idea →
   submits (Enter or a small button).
3. The `Action` is created in `inbox` state — no `Path`, no `Goal`. A toast
   confirms ("Added to Inbox") without navigating away.
4. The input stays ready for another entry — capturing several ideas in a
   row shouldn't require reopening it each time.

### Open Inbox review

1. Owner opens the Inbox (nav entry, shows a count badge when non-empty) →
   sees the raw list of captured items and a **Start Triage** primary action.
2. Starting triage transitions into the dedicated full-screen mode — visually
   and structurally distinct from browsing the list.

### Process next item (the triage loop)

1. Triage shows **one** Inbox `Action` at a time as a large card: the name,
   plus the four resolution choices below.
2. Whichever choice the Owner makes, the card resolves immediately and the
   next Inbox item slides in automatically — no separate "next" click needed.
3. **Skip**: the Owner can defer a hard decision without leaving triage. A
   skipped item moves to the end of the *current session's* queue, so a
   single tough call doesn't block the rest of the pass. If everything gets
   skipped, the queue naturally loops back to the first one.
4. **Exit anytime**: leaving triage mid-session is always allowed — undecided
   items simply stay in the Inbox untouched, no penalty, no forced
   completion.
5. When the queue empties (every item resolved this session) → a completion
   screen ("Inbox zero — 6 items processed") → back to the Inbox / previous
   screen.

### Assign to Goal, standalone to Path, create a Goal, or promote to one

One unified control, two steps — no separate dialog, no confirm click. See
ADR 0024 and ADR 0025.

1. **Step 1 — Path**: the Owner picks a `Path` (single-select chips, one
   step). Chips 1-9 carry number-key shortcuts.
2. **Step 2 — Goal search**: a search field for that Path's `Goal`s opens
   immediately, autofocused. Typing filters the list live; arrow keys move
   the highlight, Enter (or a click) resolves the card **immediately** —
   there's no separate "Assign" button to press afterwards.
   - An empty query surfaces **Standalone (no Goal)** first — so a plain
     Action with no Goal is Path pick → Enter, nothing typed.
   - Typing a name with no exact match appends **two** rows, not one (ADR
     0025 — a single row here used to silently discard the Action, which
     surprised an Owner who came back looking for it):
     - **Create Goal "…" and assign here** (highlighted by default): makes a
       new Goal under the chosen Path and assigns the current Action to it.
       The Action survives — this is the safe, common case.
     - **Promote to Goal "…" instead**: the deliberate choice for "this
       Action's idea *is* the Goal" — the Action is discarded, its idea now
       lives as the Goal itself instead of as a leftover Inbox item or a
       stray first child Action. See ADR 0004.
3. Whichever row is picked, the card resolves and the loop advances. Every
   outcome that keeps the Action (existing Goal, standalone, or a freshly
   created one) gets an **Undo** toast; Promote already had one.

### Keyboard shortcuts

Triage is designed to run mostly without a mouse:

| Key | Action |
|-----|--------|
| `1`-`9` | Pick a Path by position (step 1) |
| `A` | Jump back into the Goal search (once a Path is chosen) |
| `↑` / `↓` / `Enter` | Move / commit the highlighted row in the Goal search |
| `D` | Discard the current item |
| `S` | Skip the current item |

Letter shortcuts are ignored while focus is inside a text field, so typing a
Goal name (or a Path/Goal name that happens to contain "d" or "s") is never
hijacked.

### Discard item

1. Card → **Discard** → the `Action` is removed immediately (no blocking
   confirmation — triage has to stay fast), backed by a short **Undo** toast
   as the safety net, matching the pattern used elsewhere in the app (e.g.
   Path archive).
2. The next card slides in.

## Screens (rough)

- **Quick capture**: a single-field input reachable from anywhere in the app
  shell (not a full page) — name field + submit, non-blocking confirmation
  toast, stays open for repeat entries.
- **Inbox list**: lightweight list of captured `Action`s (name + capture
  order), Inbox count, **Start Triage** primary action. Not the main working
  view — mostly a staging area and an entry point into triage.
- **Triage (card-by-card)**: full-screen, one `Action` card at a time — large
  name, the Path → Goal assign control (which also covers standalone and
  promote-to-Goal), a Discard control, a Skip control, session progress
  (`3 of 9`), an exit affordance. Discard/Skip carry `D`/`S` keyboard hints.
- **Assign picker**: `Path` chips (step 1, number-key shortcuts) → a live
  Goal search (step 2, autofocused) with arrow-key highlight and
  Enter-to-commit; an unmatched query offers an inline **Create Goal "…"**
  row in the same list. Falls back to an inline **New Path** button + dialog
  when there are no Paths yet. Picking any row resolves the card immediately
  — no separate confirm step and no separate Promote dialog.
- **Inbox Zero / completion**: short celebratory state with a processed
  count, link back to the Inbox or wherever triage was entered from.

## Actions

| Action | Description in this module | Entity | Notes |
|--------|------------|--------|-------|
| Capture to Inbox | Global, single-field, name-only add | `Action` | Available from every screen via the app shell, not just this module |
| Open Inbox review | Enter the dedicated triage mode from the Inbox list | Process | Distinct visual mode from list browsing |
| Process next item | Card-by-card loop; resolving a card auto-advances | Process | Skip defers within the session queue; exiting anytime is allowed |
| Triage Action → assign to Goal | Path chips → Goal search row pick on the card | `Action` | Sets `assigned` + `Goal`; resolves on pick, no confirm step — see ADR 0024 |
| Triage Action → assign standalone to Path | "Standalone (no Goal)" row in the same Goal search | `Action` | Sets `assigned` + `Path`, no `Goal` |
| Triage Action → create Goal and assign | "Create Goal '…' and assign here" row, named from the typed query | `Action` + `Goal` | New `Goal` created under the Path; Action set `assigned` to it and **survives** — see ADR 0025 |
| Promote Action to Goal | "Promote to Goal '…' instead" row, right below Create above | `Action` → `Goal` | Originating Action is discarded, not kept as a child — see ADR 0004; entry point moved inline, kept distinct from Create — see ADR 0024 / ADR 0025 |
| Discard item | Immediate removal, card-level | `Action` | Undo toast, no blocking confirm — see ADR 0004 |

No new entities or glossary terms were discovered — everything maps to the
existing `Action` entity in `docs/ENTITY_MAP.md` and the `Action`/`Inbox` rows
in `docs/ACTIONS.md`. The disposal behavior for "Promote Action to Goal" and
the Undo pattern for "Discard item" were ambiguous there and are now settled
— `docs/ACTIONS.md` updated, see ADR 0004.

## Edge Cases

Systematically audited in `docs/modules/capture-triage-edgecases.md` and
hardened (proto-harden, 2026-09-04). Decided behaviors:

- **Empty Inbox**: quick capture stays available everywhere; **Start Triage**
  is disabled/hidden with an explanatory message rather than opening an empty
  loop.
- **Single item in the Inbox**: triage still works — a one-card session that
  goes straight to the completion screen after the first decision.
- **Capture with an empty name**: blocked — **Add** stays disabled until the
  field has non-whitespace text; never creates an unnamed `Action`.
- **No Paths at all**: the Assign picker's step 1 offers an inline **New
  Path** button (opens the same `NewPathDialog` `paths` uses) instead of a
  dead end — the Owner never has to leave triage, and never loses session
  progress, just to unblock assigning.
- **Promote to Goal without picking a Path**: structurally impossible now
  rather than validated against — the Goal search (and its Create-Goal row)
  only renders after step 1 has a `Path`, so there's no dirty-form-discard
  guard to build or explain (ADR 0024 retires that guard from ADR 0006 along
  with the dialog it protected).
- **Promote to Goal — what the Owner is told**: the confirmation toast is
  deliberately honest that no Goal exists yet anywhere else in the app
  ("retired — noted as a future Goal under …") until `goals` is built.
- **A Path is deleted while it still has assigned Actions**: `capture-triage`
  has no way to hear about the deletion directly, so `useActions` self-heals
  on the next read — any `Action` pointing at a Path that no longer exists is
  returned to the Inbox (not left as a dangling reference) with a toast
  explaining why.
- **Discard, then re-capture the same idea**: allowed, no dedupe — personal
  tool, no uniqueness constraint (consistent with Path naming).
- **Skipping every item in a session**: the queue cycles back to the first
  skipped item after a full pass rather than stalling; completion only
  triggers once every item has an actual decision (assign / promote /
  discard), not merely been seen.
- **Exiting triage with items left undecided**: no penalty — they remain in
  the Inbox exactly as they were, resumable later.
- **Very long Action / Path / Goal name**: wraps everywhere it can appear —
  the triage card, the Inbox list, and the Path/Goal picker chips.
- **Corrupt stored `actions` value**: a dedicated recovery screen (distinct
  from the empty-Inbox state) on both `/capture-triage` and
  `/capture-triage/triage` — the second route used to silently show a fake
  "Inbox zero" instead.
- **Picker keyboard semantics**: Path chips (step 1) are plain toggle buttons
  (`aria-pressed`), not an ARIA `radiogroup` — matching their real
  (non-roving) keyboard behavior, each chip its own Tab stop, plus `1`-`9`
  shortcuts. The Goal search (step 2) is a real `combobox`/`listbox` pair
  with `aria-activedescendant` and arrow-key roving highlight — the two
  steps intentionally don't share one ARIA pattern, since they're genuinely
  different controls (single-select chips vs. a filtered, keyboard-driven
  list).
- **Single-letter shortcuts vs. typing a name**: `D`/`S` (discard/skip) and
  `A` (focus the Goal search) are ignored whenever a text field has focus,
  so a Path or Goal name containing those letters is never intercepted
  mid-keystroke — see ADR 0024.
- **Creating a Goal must not disappear the Action**: an unmatched Goal
  search query offers **Create Goal and assign here** (Action survives,
  highlighted by default) *and*, as a visually secondary row right below
  it, **Promote to Goal instead** (Action discarded, per ADR 0004) — never
  just one row that quietly does the destructive thing. Every outcome that
  keeps the Action (existing Goal, standalone, or newly created) now gets
  an Undo toast too, not just Promote/Discard. See ADR 0025.

Deferred: a double-submit guard on Capture/Assign/Promote (harmless while
every mutation is synchronous — revisit with a Dexie migration), session
progress resetting on a mid-triage refresh, and Inbox-list virtualization at
very large scale.

## Integration Points

- **goals**: an Inbox `Action` can be assigned into an existing `Goal`, or
  promoted into a brand-new `Goal` during triage.
- **paths**: an Inbox `Action` can be assigned standalone directly to a
  `Path` (no Goal); promoting to a Goal also requires picking a `Path`.
- **today**: once an `Action` leaves `inbox` (assigned, standalone, or via
  promotion) it becomes schedulable and can appear in the Today view.
