# [0023] - Data sync module decisions
**Date**: 2026-09-05
**Module**: data-sync
**Status**: Accepted
## Context
The prototype's data lives in LocalStorage only, so it cannot move between
devices. The user asked for Dexie sync modelled on the `dopadone` project:
the user explicitly chooses to overwrite the server (push) or the local
device (pull), implemented as a `data-sync` module.
## Decision
- **Manual, directional sync — no merge, no background sync of app data.**
  Two explicit operations, each behind a confirm dialog: push replaces the
  server with this device's data; pull replaces this device's data with the
  server's. Single-user tool → no conflict resolution needed.
- **LocalStorage stays the app's source of truth.** The module hooks are
  untouched; sync moves whole collections at the migration boundary only.
  Continuous sync would require rewriting every module's data layer to
  Dexie (deferred — see docs/modules/data-sync.md "Later").
- **Dexie (`bricks` DB) is the sync transport**, row-per-entity for
  `paths`/`goals`/`actions`/`visions`, with `dexie-cloud-addon` always
  loaded — unconfigured (no URL) it is inert (every hook early-returns
  without `databaseUrl`, verified in addon source).
- **Custom UUID primary keys, not `@id`.** Unlike `dopadone` (which
  migrates to cloud-generated ids), Bricks already uses
  `crypto.randomUUID()` everywhere. The addon rejects caller-supplied keys
  only for `@`-marked tables and states custom ids are supported "as long
  as they are random and globally unique" — so rows sync 1:1 with no FK
  remapping, no topological insert order, and no schema-switch/reload
  dance.
- **Auth: email OTP, driven through `db.cloud.userInteraction`.**
  With the addon's default GUI disabled (`customLoginGui: true`), a single
  `login({ email, grant_type: 'otp' })` runs the whole flow: it sends the
  code, then parks on a `type: 'otp'` interaction until the page calls
  `onSubmit({ otp })` (a second login call's `otp` hint is ignored by the
  addon — verified in source). The login promise is fire-and-forget; it is
  only used to surface failures (offline, origin not whitelisted) and
  success. `requireAuth` is left off: it would start an unattended login
  flow on every page load while signed out. Addon alerts (INVALID_OTP,
  whitelist hints with their `npx dexie-cloud whitelist <origin>` command)
  are rendered inside the Account card.
- **URL config**: `bricks-cloud-url`, https-validated (no `*.dexie.cloud`
  host check — on-prem Dexie Cloud servers stay possible), applied on
  reload; a dedicated Disconnect button signs out and clears it.
- **Surface**: footer secondary-nav link (`/data-sync`), not the 5-item
  main nav — it is a settings-level, rarely-used surface.
- **Pull writes LocalStorage only after a completed sync round** and then
  reloads, so a failed pull never half-replaces local data.
## Impact
New module `src/modules/data-sync/` (lib: db, cloud-config, local-data,
sync-ops; hooks: use-cloud-status; one page). Route `/data-sync` +
footer link; `loadScenario` preserves `bricks-cloud-url`. Bundle grows to
~900 kB (addon) — acceptable for a prototype; code-split if it ships.
