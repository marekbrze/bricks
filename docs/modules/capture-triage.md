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

### Assign to Goal or standalone to Path

1. On the card, the Owner picks a `Path` first, then optionally narrows to a
   `Goal` within it — or explicitly leaves it at "standalone on this Path".
2. Confirming sets `Action.state = assigned` with the chosen `Path`/`Goal`,
   resolves the card, and advances the loop.

### Promote Action to Goal

1. Owner picks **Promote to Goal** on a card whose idea turned out to need
   many actions, not just one.
2. A minimal Goal-creation dialog opens, prefilled with the Action's name;
   the Owner picks the `Path` (required) and optionally a description /
   deadline, then saves.
3. The new `Goal` is created; the originating Inbox `Action` is **discarded**
   — its idea now lives as the Goal itself, not as a leftover Inbox item or a
   stray first child Action. See Edge Cases / ADR 0004.

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
- **Triage (card-by-card)**: full-screen, one `Action` card at a time —
  large name, four resolution controls (Assign to Goal, Assign standalone to
  Path, Promote to Goal, Discard), a Skip control, session progress (`3 of 9`),
  an exit affordance.
- **Assign picker**: `Path` → `Goal` cascading selection (toggle-button chips,
  not a dropdown — no such primitive was installed yet), with an explicit
  "standalone, no Goal" option. Falls back to an inline **New Path** button +
  dialog when there are no Paths yet.
- **Promote to Goal dialog**: minimal Goal-creation form prefilled with the
  Action's name — Path (required, same picker/inline-create fallback),
  description and deadline (optional); warns before discarding unsaved input.
- **Inbox Zero / completion**: short celebratory state with a processed
  count, link back to the Inbox or wherever triage was entered from.

## Actions

| Action | Description in this module | Entity | Notes |
|--------|------------|--------|-------|
| Capture to Inbox | Global, single-field, name-only add | `Action` | Available from every screen via the app shell, not just this module |
| Open Inbox review | Enter the dedicated triage mode from the Inbox list | Process | Distinct visual mode from list browsing |
| Process next item | Card-by-card loop; resolving a card auto-advances | Process | Skip defers within the session queue; exiting anytime is allowed |
| Triage Action → assign to Goal | Path → Goal picker on the card | `Action` | Sets `assigned` + `Goal` |
| Triage Action → assign standalone to Path | Path-only picker on the card | `Action` | Sets `assigned` + `Path`, no `Goal` |
| Promote Action to Goal | Minimal Goal-creation dialog prefilled with the Action's name | `Action` → `Goal` | Originating Action is discarded, not kept as a child — see ADR 0004 |
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
- **No Paths at all**: both the Assign picker and the Promote-to-Goal dialog
  offer an inline **New Path** button (opens the same `NewPathDialog` `paths`
  uses) instead of a dead end — the Owner never has to leave triage, and
  never loses session progress, just to unblock assigning.
- **Promote to Goal without picking a Path**: blocked — a `Goal` always needs
  exactly one `Path`; the dialog also warns before discarding a typed name or
  chosen Path on Cancel / Escape / backdrop.
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
- **Picker keyboard semantics**: Path/Goal chips are plain toggle buttons
  (`aria-pressed`), not an ARIA `radiogroup` — the markup never implemented
  roving-tabindex/arrow-key navigation, so promising that role would have
  been the actual accessibility gap.

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
