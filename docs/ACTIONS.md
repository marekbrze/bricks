# Action Inventory

Complete list of actions the user can perform, organized by entity. Order-independent — not just CRUD.

## Roles

- **Owner**: The sole user. Full access to everything. No guest, read-only, or shared modes.

## Actions

### Path

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Create Path | Name + a few initial Achievements; Vision optional at this point | Owner | |
| Rename Path | Change the name | Owner | |
| Add Achievements on create | Seed the "along the way" list during Path creation | Owner | |
| Reorder Paths | Arrange active Paths | Owner | Affects Today view ordering |
| Archive Path | Move out of active set, keep all contents | Owner | Reversible |
| Unarchive Path | Return to active | Owner | |
| Delete Path | Cascade-deletes Vision, Achievements, Goals, Actions | Owner | Confirmation dialog ("na pewno?") |
| View Path overview | Vision summary + Goals + Achievements + contribution graph | Owner | |

### Vision

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Open Vision board | Notion-like board of note + image tiles for a Path | Owner | Created lazily on first edit |
| Export Vision | Merge all tiles into one markdown document | Owner | |
| Reorder tiles | Arrange notes and images on the board | Owner | Mixed ordering |

### VisionNote

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Add note | Short text block | Owner | |
| Edit note | Change text | Owner | |
| Delete note | Remove from board | Owner | |
| Reorder note | Move within board | Owner | |

### VisionImage

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Upload image | Add a photo tile from local file | Owner | Stored locally |
| Fetch from Unsplash | Search Unsplash and add a photo tile | Owner | Carries attribution; needs Unsplash API — see Open Questions |
| Remove image | Delete the tile | Owner | |
| Reorder image | Move within board | Owner | |

### Achievement

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Add Achievement | New "along the way" item on a Path | Owner | Order-independent |
| Edit Achievement | Change wording | Owner | |
| Mark achieved | Set to `achieved` with a date | Owner | Feeds WinLog / ContributionGraph |
| Un-mark achieved | Back to `open` | Owner | Reversible — mistakes happen |
| Delete Achievement | Remove | Owner | |

### Goal

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Create Goal | Name + description + optional deadline, under one Path | Owner | |
| Create sub-Goal | Nest a Goal under a parent Goal | Owner | Tree structure |
| Edit Goal | Name, description, deadline | Owner | Deadline shows days-remaining countdown |
| Reorder Goals | Manual priority order within a Path | Owner | Not sequential |
| Move Goal to another Path | Re-parent the Goal (and its Actions) | Owner | |
| Toggle frog | Mark/unmark as a frog | Owner | Marking a Goal frog marks all its Actions frog |
| Mark achieved | Set to `achieved` with a date — manual, not auto when all tasks done | Owner | Feeds WinLog / ContributionGraph |
| Abandon Goal | Set to `abandoned` | Owner | Alternative to achieving |
| Reactivate Goal | Back to `active` from achieved/abandoned | Owner | |
| Delete Goal | Cascade-deletes sub-Goals and every Action under them | Owner | Confirmation dialog (`AlertDialog` with a cascade summary), same pattern as Path delete; no undo |
| View Goal progress | Cumulative action count + contribution graph toward this Goal | Owner | |

### Action

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Capture to Inbox | Quick-add an Action idea with just a name, unassigned | Owner | |
| Create Action under Goal | Add directly to a Goal | Owner | |
| Create standalone Action | Add directly under a Path, no Goal | Owner | |
| Edit Action | Change name (more fields later) | Owner | |
| Triage Action | Card-by-card: assign to Path/Goal or mark standalone | Owner | Dedicated mode (DoItDone / AutoWork pattern) |
| Promote Action to Goal | During triage, convert an Action that needs many actions into a Goal | Owner | Originating Inbox Action is discarded once the Goal is created — its idea now lives as the Goal, not as a leftover Inbox item or a stray child Action |
| Move Action between Goals/Paths | Re-assign | Owner | Core differentiator vs Griply |
| Schedule Action | Set `scheduledDate` (today, tomorrow, any day) | Owner | Drives Today / day-navigation views |
| Unschedule Action | Clear `scheduledDate` | Owner | |
| Toggle frog | Mark/unmark as a frog (star-like toggle) | Owner | |
| Complete Action | Set `done` + `completedAt` | Owner | Appears in WinLog, bumps ContributionGraph |
| Un-complete Action | Back to previous state | Owner | Removes the win from the log |
| Abandon Action | Set to `abandoned` | Owner | |
| Review abandoned Actions | Periodically look through abandoned items | Owner | |
| Delete Action | Remove permanently | Owner | Final step after abandoning; also removes it from history |

### Inbox (process, not an entity)

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Open Inbox review | Enter dedicated triage mode | Owner | Separate from any list view |
| Process next item | Step through Inbox Actions one at a time | Owner | |
| Discard item | Drop an Inbox Action without assigning | Owner | Immediate, no blocking confirm — backed by an Undo toast (same pattern as Path archive) |

### Today / Schedule views (derived, no entity)

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Open Today view | Sections per Path, each with that day's scheduled Actions — the daily focus | Owner | Distinct from any list view |
| Navigate days | Step to tomorrow / day-after / back | Owner | |
| Open Schedule view | Day-header + tasks, day-header + tasks — agenda layout | Owner | Likely its own module later (calendar) |

### WinLog / ContributionGraph (derived views)

| Action | Description | Role | Notes |
|--------|------------|------|-------|
| Open WinLog | Chronological history of completed Actions and achieved Goals | Owner | Main motivational fuel |
| Open ContributionGraph | GitHub-style cumulative graph per Goal / Path | Owner | Emphasis on accumulation, not % |

## Deferred

- **PairwisePrioritization** — comparing items pair-by-pair by Leverage (return on time + energy). Scope undecided: Goals within a Path vs Actions. Skipped for the first version, developed later.
- **WeeklyPlan** — a week-ahead soft selection. Not in the first version; "Today" + day navigation + a Schedule/agenda view cover it for now.
