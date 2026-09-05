# data-sync

## Vision

`data-sync` keeps the app's data on every device the Owner works from. The
app is local-first — the source of truth is this browser's LocalStorage —
but a prototype locked to one machine loses its history the moment it is
opened somewhere else. The module connects an optional **Dexie Cloud**
database (the same service and addon the `dopadone` and `dopawrite`
projects use) and then **syncs continuously, in both directions, as the
Owner works**. Nothing has to be triggered; nothing waits for a button.

The one directional decision is made **once, at sign-in**, and never asked
again:

- **Upload this device's data** — this device's data becomes the cloud's.
- **Use the cloud's data** — the cloud's data becomes this device's.

That choice exists because the first sync of a device is the only moment
where the two sides can legitimately disagree about everything. Afterwards
they track each other row by row.

## Design

### The mirror

The app keeps reading and writing LocalStorage through the existing module
hooks — nothing in `paths`/`goals`/`capture-triage`/`vision`/`today`
changes, and every screen still renders its data on the first paint. A
Dexie database (`bricks`, this module's `lib/db.ts`) holds the same four
collections row-per-entity and is what `dexie-cloud-addon` syncs.

`lib/mirror.ts` keeps the two in step, continuously and both ways:

```
local write  →  diff against the last mirrored state  →  put / delete rows
row changes  →  liveQuery                             →  write back into the store
```

The hook into local writes is a single callback registered on the shared
LocalStorage store (`registerStorageMirror`); incoming changes come back
through `applyExternalStorageValue`, which updates the same store so every
mounted screen re-renders without a reload.

The **last mirrored state** (`bricks-mirror-base`, a per-row content hash)
is what makes this safe:

- it stops the echo loop — a change is only applied in a direction if it
  actually differs from what was last seen coming the other way;
- it makes the boot pass a real three-way diff — edits made offline are
  pushed up, and rows another device deleted are **not** resurrected;
- it survives reloads, so a device that was offline for a week still knows
  what it had already sent.

Rows arriving from the server carry the addon's `owner` / `realmId` props;
they are stripped before anything reaches app storage. Incoming rows also
keep the order the app already had them in — a single edited row from
another device must not reshuffle a list the Owner is looking at.

### Why LocalStorage stays the source of truth

Making Dexie the source of truth (as `dopadone` does, having been built
that way) would mean every screen waiting on an async first read and every
Storybook story seeding IndexedDB. The mirror buys the same continuous
sync without that cost. The trade is that the two stores can in principle
drift; the base map plus the row-level diff is what keeps them from it.

### Other details

- Ids are the app's own `crypto.randomUUID()` values. Dexie Cloud supports
  custom string primary keys for synced tables when they are random and
  globally unique — UUIDs are both — so rows keep their identity and
  foreign keys in both directions, with no remapping step.
- **The database is opened at boot** (`src/main.tsx` → `startCloudMirror`).
  This is not incidental: `db.cloud.currentUser` holds `{ isLoading: true }`
  until the addon's `ready` handler runs, and that handler runs on
  `db.open()` and nowhere else. Subscribing without opening leaves the UI
  reading that default forever — the sign-in state never resolves and no
  sync ever starts.
- Storage keys: `bricks-cloud-url` (config, not data — scenario switching
  preserves it), `bricks-mirror-base` (the mirror's bookkeeping),
  `bricks-sign-in-intent` (SessionStorage, only during a connect). The
  addon persists auth in IndexedDB, and renames the IndexedDB database
  after the cloud subdomain (`bricks-<subdomain>`).

## User Flows

### Connect a database

1. Footer → **Data sync** → paste the `*.dexie.cloud` URL (https-only) →
   **Save and reload** (the addon reads the URL at DB construction).
   **Disconnect** signs out, clears the URL and reloads.

### Sign in — the one time direction matters

1. Choose **Upload this device's data** or **Use the cloud's data**.
   Choosing the cloud's data asks for confirmation first: it names what
   this device holds and says plainly that all of it is replaced.
2. Enter email → **Send sign-in code** → enter the OTP → **Verify**. No
   passwords. One `db.cloud.login({ email, grant_type: 'otp' })` call drives
   the whole flow: it sends the code and then waits on a `type: 'otp'`
   interaction, which the page answers with `interaction.onSubmit({ otp })`.
   A wrong code returns as a fresh interaction with an INVALID_OTP alert;
   addon error alerts (e.g. an origin not whitelisted, with the exact
   `npx dexie-cloud whitelist <origin>` command to fix it) render in the
   Account card.
3. From then on the card just shows who is signed in and the live sync
   state ("Changes sync automatically, on every device" / "Syncing…" /
   "Offline" / "Sync error"). There are no sync buttons, because there is
   nothing left to trigger.

How each direction is carried out (`lib/sync-ops.ts`):

- **Upload** — the database is brought level with the app's storage, then
  the sign-in itself does the work: on a first login the addon claims every
  local row for the new user and uploads it. Anything that comes down and
  is not local is data the Owner chose to discard, so it is deleted and the
  deletion synced. The server ends up an exact copy of this device.
- **Use the cloud's** — the local database is **deleted** before the
  sign-in, which costs a page reload. It has to be: the same claim-and-
  upload would otherwise send this device's data to the server the Owner
  just chose over it, and a lingering mutation log would push its pending
  deletes onto the server's rows. The app's storage is untouched throughout
  and stays the fallback until the server's rows have actually arrived; the
  intent is parked in SessionStorage so the reload does not lose it. If the
  sign-in fails or is cancelled, the database is rebuilt from the app's
  storage and nothing has been lost.

### Sign out

**Sign out** returns the device to local-only. The addon empties every
table on logout (that is how it drops another user's data), so the mirror
is held while that happens and the database is rebuilt from the app's
storage afterwards — signing out costs the Owner nothing.

## Edge cases

- No database configured → only the setup card renders; the mirror is a
  no-op and the app is a plain local-first prototype.
- Sync round not finishing (offline, wrong URL) → 20 s timeout with a
  readable error; the app's storage is never written from a sync that did
  not complete.
- Sign-in fails mid-connect → `abandonSignIn` restores local-only state in
  both directions.
- Choosing the cloud's data, then closing the tab before signing in → the
  intent lives in SessionStorage, so the next boot is an ordinary local
  start; the database re-seeds from the app's storage.
- Scenario switching (dev) → wipes the data keys **and** empties the synced
  tables, so the outgoing scenario cannot sync itself back up. While signed
  in this reaches the cloud too, which is what "reset all data" has to mean
  once a device is syncing. `bricks-cloud-url` is preserved.
- Two tabs open → a write in one reaches the other through Dexie's
  cross-tab live queries, which is a small bonus the mirror gets for free.

## Later

- Surface sync state outside this page (a header indicator), so the Owner
  can see "offline" without visiting settings.
- Move the app onto Dexie as its source of truth and retire the mirror.
  Worth doing if the data ever outgrows LocalStorage or the two stores are
  observed to drift; not worth the async-first-read rewrite before then.
- Export/import file-based backup lives with `app-shell` settings, not here.
