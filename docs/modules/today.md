# Today

## Vision

`today` is the daily execution surface and the app's landing screen — the
first thing the Owner sees when opening the app. It answers one question:
"what should I actually do today?" Every `Action` that has left the Inbox
(assigned to a Goal or standalone to a Path) and carries a `scheduledDate`
shows up here, grouped by `Path` so the Owner can see effort distributed
across their life directions rather than one undifferentiated task list.

Two things separate this from a generic to-do list: Paths give the list
structure (sport vs earnings, not one flat pile), and frogs give it honesty
— the valuable-but-uncomfortable Actions are visually called out rather than
left to compete on equal footing with everything else. The module is
deliberately narrow — scheduling and completing happen here, but assigning
an Action to a Path/Goal happens upstream in `capture-triage`, and the tree
itself is owned by `goals`.

A separate **Schedule view** (agenda: day header + tasks, next day header +
tasks) gives a wider look ahead than the single-day Today view, without
turning into a full calendar module.

## User Flows

### Open Today (landing)

1. Owner opens the app → lands directly on Today for the current date.
2. Sections per active `Path`, each listing that Path's Actions with
   `scheduledDate = today`. Frogs are visually distinguished (icon/badge)
   within their section rather than pulled into a separate "frogs" section
   — the Owner still sees them in the context of the Path they serve.
3. A Path with no Actions scheduled today still gets a (collapsed or
   minimal) row acknowledging it exists, rather than disappearing — see
   Edge Cases.

### Complete / un-complete an Action

1. Owner checks an Action off directly in its row (no navigation away).
2. `done = true`, `completedAt` set to now → the row shows a completed
   state (strikethrough / muted) but stays visible for the rest of the day
   rather than vanishing instantly, so the Owner sees the day's progress
   accumulate.
3. Un-checking reverses it — clears `completedAt`, `done = false`. Both
   directions feed `winlog` (completing creates a Win; un-completing
   removes it).

### Abandon an Action

1. From the row's overflow, **Abandon** — for something scheduled today
   that the Owner has decided not to do at all (distinct from just moving
   it to another day).
2. Sets an `abandoned` state; the row leaves today's active list.
3. Abandoned Actions accumulate in a **Review abandoned** surface (not the
   main Today list) — the Owner periodically decides to reschedule or
   delete them for good. This keeps Today focused on live commitments
   without silently losing abandoned work.

### Navigate days

1. Forward/back day-navigation control (not a full calendar picker) steps
   Today to tomorrow, the day after, yesterday, etc. — mirrors the Path
   overview's day-scoped feel.
2. The header always shows which date is in view; a **Today** shortcut
   jumps back to the current date from anywhere in the range.
3. Scheduling/completing on a non-today date works the same as on today —
   Today view is really "day view", defaulted to today.

### Schedule an Action to a day

1. An unscheduled Action (assigned in `capture-triage`/`goals` but no
   `scheduledDate` yet) doesn't appear in Today at all — it lives in its
   Goal/Path until scheduled.
2. Scheduling happens either from the day view itself (an "Add to today"
   picker surfacing eligible Actions) or from within `goals`/`paths`
   (assign a date to an existing Action). Both write the same
   `scheduledDate`.
3. Unscheduling (clearing `scheduledDate`) removes the Action from every
   day view without deleting or abandoning it — it returns to its Goal's
   backlog.

### Open Schedule (agenda) view

1. From Today, a secondary entry point opens the **Schedule view**: a
   scrolling agenda — day header, that day's scheduled Actions, next day
   header, its Actions, and so on — instead of one Path-sectioned day.
2. Same complete/un-complete/abandon interactions as Today, just organized
   by date first instead of by Path first.
3. Gives the Owner a look-ahead across several days without promising a
   full week-planning feature (`WeeklyPlan` stays deferred — see
   `docs/GLOSSARY.md`).

## Screens (rough)

- **Today (day view)**: date header + day-navigation controls + **Today**
  shortcut, sections per active `Path` (Path name, then its scheduled
  Actions as checkable rows with a frog indicator), link to **Schedule
  view**, link to **Review abandoned**.
- **Action row**: checkbox (complete/un-complete), name, frog badge when
  flagged, overflow menu (Abandon, Unschedule, move to another day).
- **Add to today picker**: surfaces assigned-but-unscheduled Actions
  (optionally filtered by Path/Goal) to pull into the current day.
- **Schedule (agenda) view**: vertically stacked day-header + Action-rows
  blocks, one block per upcoming day that has anything scheduled.
- **Review abandoned**: a dedicated list of `abandoned` Actions with
  reschedule / delete-for-good actions — kept out of the main day view.

## Actions

| Action | Description in this module | Entity | Notes |
|--------|------------|--------|-------|
| Open Today view | Land on the current day, sections per Path | Process | The app's landing screen |
| Navigate days | Step forward/back, jump to Today | Process | Same interactions apply to any date in view |
| Open Schedule view | Agenda layout across days | Process | Distinct from Today's per-Path day view |
| Schedule Action | Set `scheduledDate` | `Action` | From Today's "Add to today" picker or from `goals`/`paths` |
| Unschedule Action | Clear `scheduledDate` | `Action` | Returns to Goal/Path backlog, not deleted |
| Complete Action | Set `done = true`, `completedAt` | `Action` | Feeds `winlog`; row stays visible (completed style) for the rest of the day |
| Un-complete Action | Clear `done`/`completedAt` | `Action` | Reverses a Win in `winlog` |
| Abandon Action | Mark `abandoned` | `Action` | Leaves the active day view; lands in Review abandoned |
| Review abandoned Actions | Dedicated list, reschedule or delete-for-good | `Action` | Keeps abandoned work out of the daily focus |
| Delete Action | Permanent removal | `Action` | From Review abandoned (not from the active day view directly) |

No new entities, glossary terms, or actions were discovered — `today` is a
fully derived view over the existing `Action` entity (`docs/ENTITY_MAP.md`)
and every action above already exists in `docs/ACTIONS.md`, either under the
`Action` table (Schedule/Unschedule/Complete/Un-complete/Abandon/Review
abandoned/Delete) or under `Today / Schedule views`. No shared-doc updates
or ADR needed for this pass.

## Edge Cases

- **No Paths at all**: Today has nothing to section by — empty state
  pointing at creating a first Path (mirrors `paths`' own empty state).
- **A Path exists but has nothing scheduled today**: its section still
  renders (name + "nothing scheduled" line) rather than disappearing — the
  Owner should see the Path was considered, not wonder if it silently
  dropped out.
- **Every Path empty today**: Today-wide empty state distinct from the
  per-Path one — encourages scheduling something from the backlog rather
  than showing N identical empty sections.
- **All of today's Actions completed**: the day stays visible with every
  row in its completed style (not cleared away) — finishing the day should
  feel like a visible win, not an emptied list.
- **Very old date navigated to, with completed/abandoned history**: still
  renders read-only-ish (completing/un-completing still works, it's just
  an Action, not a locked record) — no special "past" mode planned for v1.
- **Frog Action inherited from an achieved/abandoned Goal**: if the parent
  Goal is achieved or abandoned while one of its Actions is still scheduled
  today, the Action itself keeps its own state — Today doesn't hide it,
  since completing it is still a real, loggable win.
- **Action deleted or moved to another Path/Goal while scheduled**:
  Today has no direct signal from `goals`/`capture-triage` — self-heals on
  next read the same way `capture-triage` does for a deleted Path (see
  `docs/modules/capture-triage.md`).
- **Large number of Actions scheduled on one day**: no pagination planned
  for v1 — personal-scale data — but rows should stay compact enough that
  a busy day doesn't force excessive scrolling before the frog is visible.

Full systematic edge-case pass deferred to `proto-edgecases`.

## Integration Points

- **paths**: Today's grouping is by Path; an archived Path's Actions drop
  out of the day view the same way an empty one still shows a section for
  an active Path.
- **goals**: every scheduled Action belongs to a Goal or is standalone on a
  Path; frog flag set on the Goal propagates down to its Actions as shown
  here.
- **capture-triage**: Actions arrive already assigned (or standalone) from
  triage — Today never sees `inbox`-state Actions.
- **winlog**: completing an Action here creates a Win; un-completing
  removes it; the per-Path/per-Goal contribution graphs read the same
  `completedAt` data.
