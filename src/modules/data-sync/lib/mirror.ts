import { liveQuery, type Subscription } from 'dexie'
import {
  applyExternalStorageValue,
  readStorageValue,
  registerStorageMirror,
} from '@/shared/hooks/use-local-storage'
import { db, isCloudConfigured, openDb, SYNCED_TABLES } from './db'
import { isPullPending } from './sign-in-intent'

/**
 * The bridge between the app's storage and the synced database.
 *
 * The app reads and writes LocalStorage synchronously through the module
 * hooks — that is what makes every screen render its data on the first paint
 * and what the Storybook stories seed. Dexie Cloud, meanwhile, needs rows in
 * IndexedDB to sync. So the two are kept in step continuously and in both
 * directions:
 *
 *   local write  →  diff against the last mirrored state  →  put/delete rows
 *   row changes  →  liveQuery  →  write back into the LocalStorage store
 *
 * The "last mirrored state" (`bricks-mirror-base`) is a per-row content hash,
 * and it is what keeps the loop from running away: a change is only applied in
 * a direction if the value actually differs from what was last seen going the
 * other way. It also makes the boot pass a real three-way diff — edits made
 * offline are pushed up, rows another device deleted are not resurrected.
 */

export const SYNCED_KEYS = ['paths', 'goals', 'actions', 'visions'] as const
export type SyncedKey = (typeof SYNCED_KEYS)[number]

interface Row {
  id: string
  createdAt?: string
  [prop: string]: unknown
}

/** Props the addon stamps on synced rows — they must not leak into app storage. */
const SYNC_ONLY_PROPS = new Set(['owner', 'realmId', '$ts'])

const BASE_KEY = 'bricks-mirror-base'
type Base = Partial<Record<SyncedKey, Record<string, string>>>

function isSyncedKey(key: string): key is SyncedKey {
  return (SYNCED_KEYS as readonly string[]).includes(key)
}

function tableFor(key: SyncedKey) {
  return SYNCED_TABLES[key]()
}

function readRows(key: SyncedKey): Row[] {
  const value = readStorageValue<Row[]>(key, [])
  return Array.isArray(value) ? value.filter((row) => row && typeof row.id === 'string') : []
}

function strip(row: Row): Row {
  const clean: Row = { id: row.id }
  for (const [prop, value] of Object.entries(row)) {
    if (!SYNC_ONLY_PROPS.has(prop)) clean[prop] = value
  }
  return clean
}

/**
 * Key-order-independent JSON. Rows that have been through the server come back
 * with their props in a different order than they were written in, and an
 * order-sensitive hash would read that as a change and ping-pong forever.
 */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`
}

/** djb2 over the stable JSON — short enough to keep a whole base map small. */
function hashRow(row: Row): string {
  const text = stableStringify(row)
  let hash = 5381
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0
  return (hash >>> 0).toString(36)
}

function hashRows(rows: Row[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const row of rows) map[row.id] = hashRow(row)
  return map
}

function sameHashes(a: Record<string, string> | undefined, b: Record<string, string>): boolean {
  if (!a) return false
  const aKeys = Object.keys(a)
  if (aKeys.length !== Object.keys(b).length) return false
  return aKeys.every((id) => a[id] === b[id])
}

function readBase(): Base {
  try {
    const raw = localStorage.getItem(BASE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Base) : {}
  } catch {
    return {}
  }
}

function writeBase(base: Base): void {
  try {
    localStorage.setItem(BASE_KEY, JSON.stringify(base))
  } catch {
    // A base we cannot persist only costs an extra full pass on the next boot.
  }
}

/** Forget what was mirrored — the next pass treats everything local as new. */
export function resetMirrorBase(): void {
  try {
    localStorage.removeItem(BASE_KEY)
  } catch {
    // ignore
  }
}

// --- Mirror state ---------------------------------------------------------

let started = false
let suspendCount = 0
let subscriptions: Subscription[] = []
/** Serialises every write into Dexie, so two quick local edits cannot interleave. */
let queue: Promise<void> = Promise.resolve()
let booted: Promise<void> = Promise.resolve()

/**
 * Stop mirroring in both directions. Sync operations that rearrange the
 * database wholesale (sign-in, sign-out) hold this so their intermediate
 * states — an emptied table, a logout wipe — never reach the app's storage.
 */
export function suspendMirror(): void {
  suspendCount++
}

export function resumeMirror(): void {
  if (suspendCount > 0) suspendCount--
}

export async function withMirrorSuspended<T>(fn: () => Promise<T>): Promise<T> {
  suspendMirror()
  try {
    return await fn()
  } finally {
    resumeMirror()
  }
}

function enqueue(work: () => Promise<void>): Promise<void> {
  queue = queue.then(work).catch((err) => {
    console.error('[data-sync] mirror write failed', err)
  })
  return queue
}

// --- local → Dexie --------------------------------------------------------

/**
 * Apply one collection's local state to its table, as the difference from
 * what was last mirrored: rows whose content changed are put, ids that
 * disappeared are deleted. Rows untouched since the last pass are left alone,
 * so a boot does not re-upload the whole database.
 */
async function pushCollection(key: SyncedKey, rows: Row[]): Promise<void> {
  const base = readBase()
  const previous = base[key] ?? {}
  const next = hashRows(rows)

  const toPut = rows.filter((row) => previous[row.id] !== next[row.id])
  const toDelete = Object.keys(previous).filter((id) => !(id in next))

  base[key] = next
  writeBase(base)

  if (toPut.length === 0 && toDelete.length === 0) return

  const table = tableFor(key)
  await db.transaction('rw', table, async () => {
    if (toDelete.length > 0) await table.bulkDelete(toDelete)
    if (toPut.length > 0) await table.bulkPut(toPut)
  })
}

/** Push every collection — the boot pass, and the rebuild after a logout wipe. */
export async function pushAllToDexie(): Promise<void> {
  await openDb()
  for (const key of SYNCED_KEYS) {
    await pushCollection(key, readRows(key))
  }
}

/**
 * Empty the synced tables. Only for wiping data on purpose — the dev
 * scenario switch, which replaces the app's data wholesale and must not leave
 * the previous scenario's rows behind for the next pass to sync back up.
 */
export async function clearSyncedTables(): Promise<void> {
  if (!isCloudConfigured()) return
  await openDb()
  await enqueue(async () => {
    for (const key of SYNCED_KEYS) await tableFor(key).clear()
    resetMirrorBase()
  })
}

// --- Dexie → local --------------------------------------------------------

function byCreatedAt(a: Row, b: Row): number {
  const at = typeof a.createdAt === 'string' ? a.createdAt : ''
  const bt = typeof b.createdAt === 'string' ? b.createdAt : ''
  if (at !== bt) return at < bt ? -1 : 1
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

/**
 * Order the incoming rows the way the app already has them: rows it knows keep
 * their current position, genuinely new ones are appended oldest-first. A
 * single edited row arriving from another device must not reshuffle a list the
 * user is looking at.
 */
function orderLikeLocal(key: SyncedKey, rows: Row[]): Row[] {
  const remaining = new Map(rows.map((row) => [row.id, row]))
  const ordered: Row[] = []
  for (const local of readRows(key)) {
    const row = remaining.get(local.id)
    if (row) {
      ordered.push(row)
      remaining.delete(local.id)
    }
  }
  return [...ordered, ...[...remaining.values()].sort(byCreatedAt)]
}

/**
 * Write one collection's rows into the app's storage, unless they are what the
 * app already has — which is the common case, since every local write echoes
 * back through liveQuery moments later.
 */
function applyRemote(key: SyncedKey, incoming: Row[]): void {
  if (suspendCount > 0) return
  const rows = incoming.map(strip)
  const next = hashRows(rows)
  const base = readBase()
  if (sameHashes(base[key], next)) return

  base[key] = next
  writeBase(base)
  applyExternalStorageValue(key, orderLikeLocal(key, rows))
}

/** Read the tables and adopt them as the app's data, whatever the app holds now. */
export async function adoptDexieIntoLocal(): Promise<void> {
  await openDb()
  const base = readBase()
  for (const key of SYNCED_KEYS) {
    const rows = (await tableFor(key).toArray()).map((row) => strip(row as Row))
    base[key] = hashRows(rows)
    applyExternalStorageValue(key, [...rows].sort(byCreatedAt))
  }
  writeBase(base)
}

// --- Boot -----------------------------------------------------------------

/**
 * Start mirroring. Safe to call when no cloud database is configured (it does
 * nothing) and safe to call twice.
 *
 * Opening the database is the first thing it does, and the reason it runs at
 * boot rather than when the sync page is visited: until `db.open()` resolves
 * the addon has not read the persisted login, so the app neither knows it is
 * signed in nor syncs anything.
 */
export function startCloudMirror(): Promise<void> {
  if (started) return booted
  if (!isCloudConfigured()) return Promise.resolve()
  started = true

  // Registered before the first pass so a write landing mid-boot is queued
  // rather than dropped; `enqueue` keeps it behind the boot pass, and applying
  // it twice is harmless (the diff finds nothing the second time).
  registerStorageMirror((key, value) => {
    if (!isSyncedKey(key) || suspendCount > 0) return
    const rows = Array.isArray(value) ? (value as Row[]) : []
    void enqueue(() => pushCollection(key, rows))
  })

  if (isPullPending()) {
    // A "use the cloud's data" connect is mid-flight: the local database was
    // deleted on purpose and the app's storage still holds the data this
    // device is about to give up. Touch neither until the sign-in lands — the
    // flow calls `activateMirror` once the server's rows have been adopted.
    suspendMirror()
    return booted
  }

  booted = enqueue(async () => {
    await pushAllToDexie()
    subscribeRemote()
  })

  return booted
}

function subscribeRemote(): void {
  if (subscriptions.length > 0) return
  for (const key of SYNCED_KEYS) {
    subscriptions.push(
      liveQuery(() => tableFor(key).toArray()).subscribe({
        next: (rows) => applyRemote(key, rows as Row[]),
        error: (err) => console.error(`[data-sync] live query failed for "${key}"`, err),
      }),
    )
  }
}

/**
 * Bring the mirror up after a sign-in that had it held back — the `pull`
 * hand-off, whose boot deliberately did nothing. The caller has already
 * decided what the app's data is; from here the two sides just track.
 */
export async function activateMirror(): Promise<void> {
  await openDb()
  await enqueue(async () => {
    subscribeRemote()
  })
}

/** Test/teardown helper — drops the live subscriptions. */
export function stopCloudMirror(): void {
  for (const sub of subscriptions) sub.unsubscribe()
  subscriptions = []
  started = false
}
