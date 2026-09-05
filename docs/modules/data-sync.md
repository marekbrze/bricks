# data-sync

## Vision

`data-sync` moves the app's data between devices. The app is local-first —
the source of truth is this browser's LocalStorage — but the Owner works
from more than one machine, and a prototype locked to one device loses its
history the moment it is opened somewhere else. The module connects an
optional **Dexie Cloud** database (the same service and addon the
`dopadone` project uses) and moves data **directionally, by explicit user
decision**:

- **Push — overwrite the server** with this device's data.
- **Pull — overwrite this device** with the server's data.

There is no merge and no background syncing of app data. One side simply
wins, wholesale, and the user is told exactly what that means before
confirming. This matches the module's honest scope: a single-user tool
does not need conflict resolution, it needs a safe, explicit "copy this
way" operation.

## Design

- The app keeps reading/writing LocalStorage through the existing module
  hooks — nothing in `paths`/`goals`/`capture-triage`/`vision`/`today`
  changes.
- A Dexie database (`bricks`, this module's `lib/db.ts`) mirrors the four
  entity collections (`paths`, `goals`, `actions`, `visions`) row-per-entity
  and is the **sync transport**: `dexie-cloud-addon` keeps it in sync with
  the server while signed in.
- Ids are the app's own `crypto.randomUUID()` values. Dexie Cloud supports
  custom string primary keys for synced tables when they are random and
  globally unique — UUIDs are both — so rows keep their identity and
  foreign keys in both directions, with no remapping step.
- Storage keys: `bricks-cloud-url` (config, not data — scenario switching
  preserves it). The addon itself persists auth in IndexedDB.

## User Flows

### Connect a database

1. Footer → **Data sync** → paste the `*.dexie.cloud` URL (https-only) →
   **Save and reload** (the addon reads the URL at DB construction).
   **Disconnect** signs out, clears the URL and reloads.

### Sign in

1. Enter email → **Send sign-in code** → enter the OTP from the email →
   **Verify**. No passwords; `db.cloud.login({ grant_type: 'otp' })` twice,
   as in `dopadone`. Live sync status ("In sync" / "Syncing…" / "Offline" /
   "Sync error") is shown once signed in.

### Push (overwrite the server)

1. **Push to server** → confirm dialog states what this device holds and
   that everything on the server will be replaced.
2. Tables are cleared and refilled from LocalStorage in one transaction
   (clears sync as deletions → the server becomes an exact copy), then a
   sync round is awaited before success is reported.

### Pull (overwrite this device)

1. **Pull from server** → confirm dialog states what the server holds; if
   the server is empty the dialog warns explicitly that pulling wipes this
   device's data.
2. A sync round is awaited, rows are read back (realm/ownership props the
   addon stamps on synced rows are stripped), written into the four
   LocalStorage keys, and the page reloads so every module re-reads.

## Edge cases

- No database configured → only the setup card renders; direction cards
  require a database **and** a signed-in user.
- Sync round not finishing (offline, wrong URL) → 20 s timeout with a
  readable error; no partial LocalStorage write (pull writes only after
  sync completes).
- Server empty → pull confirm carries a destructive warning.
- Scenario switching (dev) → wipes data keys but keeps `bricks-cloud-url`,
  so the sync setup survives.

## Later

- Auto-push on app close / periodic sync of real app writes (requires the
  modules to write through Dexie rather than LocalStorage — a larger
  refactor, deferred).
- Export/import file-based backup lives with `app-shell` settings, not here.
