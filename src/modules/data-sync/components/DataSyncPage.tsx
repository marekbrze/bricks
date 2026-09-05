import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, CloudDownload, CloudUpload, DatabaseBackup, RefreshCw } from 'lucide-react'
import type { DXCAlert, DXCUserInteraction } from 'dexie-cloud-addon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/shared/components/toast/toast-context'
import { db } from '../lib/db'
import {
  clearCloudUrl,
  getCloudUrl,
  saveCloudUrl,
  validateCloudUrl,
} from '../lib/cloud-config'
import {
  countEntities,
  describeCounts,
  readLocalData,
  totalEntities,
  type EntityCounts,
} from '../lib/local-data'
import { pullServerToLocal, pushLocalToServer, readServerCounts } from '../lib/sync-ops'
import { useCloudStatus } from '../hooks/use-cloud-status'

type ConfirmDirection = 'push' | 'pull' | null

function syncPhaseLabel(phase: string | undefined): string {
  switch (phase) {
    case 'in-sync':
      return 'In sync'
    case 'pushing':
    case 'pulling':
    case 'not-in-sync':
      return 'Syncing…'
    case 'error':
      return 'Sync error'
    case 'offline':
      return 'Offline'
    default:
      return 'Connecting…'
  }
}

function alertTextClass(type: DXCAlert['type']): string {
  switch (type) {
    case 'error':
      return 'text-destructive'
    case 'warning':
      return 'text-amber-600 dark:text-amber-400'
    default:
      return 'text-muted-foreground'
  }
}

/** Errors the addon raised while waiting for login input (bad code, unlisted origin…). */
function errorAlerts(interaction: DXCUserInteraction | undefined): DXCAlert[] {
  if (!interaction) return []
  return interaction.alerts.filter((a) => a.type === 'error')
}

/**
 * Data sync (docs/modules/data-sync.md). The app's data lives in this
 * browser; a Dexie Cloud database is optional. Sync is manual and
 * directional — the user picks one: overwrite the server (push) or
 * overwrite this device (pull). Nothing merges.
 */
export function DataSyncPage() {
  const { showToast } = useToast()
  const { user, syncState } = useCloudStatus()

  // --- Database URL -------------------------------------------------------
  const [urlDraft, setUrlDraft] = useState(() => getCloudUrl() ?? '')
  const [urlError, setUrlError] = useState<string | null>(null)
  const cloudUrl = useMemo(getCloudUrl, [])

  const handleSaveUrl = () => {
    const error = validateCloudUrl(urlDraft)
    setUrlError(error)
    if (error) return
    // The addon reads the URL at DB construction — reload to apply.
    saveCloudUrl(urlDraft)
    window.location.reload()
  }

  const handleDisconnect = () => {
    // Clear first, reload immediately: logout() can hang awaiting input
    // (interaction prompts nobody renders in between) — that must never
    // block disconnecting. Any leftover token state is harmless once the
    // URL is gone and the addon stays unconfigured after reload.
    clearCloudUrl()
    void db.cloud.logout({ force: true }).catch(() => {})
    window.location.reload()
  }

  // --- Sign-in: driven by the addon's interaction observable ---------------
  // With the default GUI disabled, `login({ email, grant_type: 'otp' })` runs
  // the whole flow itself: it sends the code, then parks on a `type: 'otp'`
  // interaction until `onSubmit({ otp })` completes it. Awaiting the login
  // promise would hang until that point — so the flow below reacts to the
  // interaction instead, and the promise is only used to surface failures
  // (offline, origin not whitelisted) and final success.
  const [interaction, setInteraction] = useState<DXCUserInteraction | undefined>(undefined)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loginInFlight, setLoginInFlight] = useState(false)
  /** True between submitting the OTP and the addon's verdict (new prompt on a bad code). */
  const [verifying, setVerifying] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    const sub = db.cloud.userInteraction.subscribe(setInteraction)
    return () => sub.unsubscribe()
  }, [])

  const otpPrompt = interaction?.type === 'otp' ? interaction : null

  // A fresh prompt means the addon asked again — either the first arrival or
  // a rejected code. Either way we are back at the input, not verifying.
  useEffect(() => {
    if (otpPrompt) setVerifying(false)
  }, [otpPrompt])

  const handleSendCode = () => {
    if (!email.trim() || loginInFlight) return
    setLoginInFlight(true)
    setLoginError(null)
    setOtp('')
    void db.cloud
      .login({ email: email.trim(), grant_type: 'otp' })
      .then(() => {
        // Resolves only after the OTP step succeeds — the user is in.
        setLoginInFlight(false)
        setVerifying(false)
        setEmail('')
        setOtp('')
        showToast('Signed in')
      })
      .catch((err) => {
        setLoginInFlight(false)
        setVerifying(false)
        if (err?.name === 'AbortError') return // cancelled by the user
        setLoginError(err instanceof Error ? err.message : String(err))
      })
  }

  const handleVerifyOtp = () => {
    // NOTE: `loginInFlight` is deliberately not part of this guard — it stays
    // true for the whole flow (set at send, cleared on the final verdict), and
    // gating on it here would disable Verify forever.
    if (!otpPrompt || !otp.trim() || verifying) return
    setVerifying(true)
    // A wrong code comes back as a fresh 'otp' interaction carrying an
    // INVALID_OTP alert — rendered below; the effect above clears `verifying`.
    otpPrompt.onSubmit({ otp: otp.trim() })
  }

  const handleCancelOtp = () => {
    otpPrompt?.onCancel()
    setOtp('')
  }

  const handleSignOut = () => {
    // Best-effort: if the addon raises a logout-confirmation (unsynced
    // changes), it is rendered as a generic interaction below.
    void db.cloud
      .logout()
      .then(() => showToast('Signed out'))
      .catch((err) => {
        if (err?.name !== 'AbortError') showToast(err instanceof Error ? err.message : String(err))
      })
  }

  // --- Sync direction -----------------------------------------------------
  const localCounts = useMemo(() => countEntities(readLocalData()), [])
  const [serverCounts, setServerCounts] = useState<EntityCounts | null>(null)
  const [busy, setBusy] = useState<'push' | 'pull' | null>(null)
  const [confirm, setConfirm] = useState<ConfirmDirection>(null)
  const [opError, setOpError] = useState<string | null>(null)

  const loggedIn = user?.isLoggedIn === true

  // Server counts only mean something once a sync round has completed.
  useEffect(() => {
    if (!loggedIn || syncState?.phase !== 'in-sync') return
    let cancelled = false
    readServerCounts()
      .then((counts) => {
        if (!cancelled) setServerCounts(counts)
      })
      .catch(() => {
        if (!cancelled) setServerCounts(null)
      })
    return () => {
      cancelled = true
    }
  }, [loggedIn, syncState?.phase])

  const handlePush = async () => {
    setConfirm(null)
    setBusy('push')
    setOpError(null)
    try {
      const counts = await pushLocalToServer()
      setServerCounts(counts)
      showToast('Server updated from this device')
    } catch (err) {
      setOpError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(null)
    }
  }

  const handlePull = async () => {
    setConfirm(null)
    setBusy('pull')
    setOpError(null)
    try {
      // Reloads the page on success — localStorage now mirrors the server.
      await pullServerToLocal()
    } catch (err) {
      setOpError(err instanceof Error ? err.message : String(err))
      setBusy(null)
    }
  }

  const localTotal = totalEntities(localCounts)
  const serverTotal = serverCounts === null ? null : totalEntities(serverCounts)

  // Generic addon prompt (message-alert, logout-confirmation) — render its
  // alerts and its own submit/cancel. OTP has its dedicated form above.
  const genericInteraction =
    interaction && interaction.type !== 'otp' ? interaction : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <RefreshCw className="size-5 text-muted-foreground" aria-hidden="true" /> Data sync
        </h1>
        <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">
          Your data lives in this browser. Connect a Dexie Cloud database to move it between
          devices — sync is manual and directional: pushing overwrites the server, pulling
          overwrites this device. Nothing merges.
        </p>
      </div>

      {/* --- Step 1: the database ------------------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DatabaseBackup className="size-4 text-muted-foreground" aria-hidden="true" /> Dexie
            Cloud database
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Create a free database at{' '}
            <a
              href="https://dexie.cloud"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              dexie.cloud
            </a>{' '}
            and paste its URL here.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex min-w-[240px] flex-1 flex-col gap-1">
              <Label htmlFor="cloud-url">Database URL</Label>
              <Input
                id="cloud-url"
                type="url"
                placeholder="https://yourdb.dexie.cloud"
                value={urlDraft}
                onChange={(e) => {
                  setUrlDraft(e.target.value)
                  setUrlError(null)
                }}
              />
            </div>
            <Button onClick={handleSaveUrl}>Save and reload</Button>
            {cloudUrl && (
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            )}
          </div>
          {urlError && (
            <p role="alert" className="text-sm text-destructive">
              {urlError}
            </p>
          )}
          {cloudUrl && (
            <p className="text-sm text-muted-foreground">
              Connected to <span className="font-medium text-foreground">{cloudUrl}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* --- Step 2: sign in ------------------------------------------- */}
      {cloudUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {user === undefined || user.isLoading ? (
              // The addon's currentUser is a BehaviorSubject: it emits its
              // startup default (`isLoading: true`, `isLoggedIn` unset)
              // synchronously on subscribe, before it has read the persisted
              // login from IndexedDB. Without this check that default reads
              // as "logged out" and flashes the sign-in form on every load.
              <p className="text-sm text-muted-foreground">Checking sign-in…</p>
            ) : loggedIn ? (
              <div className="flex flex-col gap-3">
                <div
                  role="status"
                  className="flex flex-col gap-1 rounded-md border border-green-600/40 bg-green-500/10 p-3"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                    <CheckCircle2 className="size-4" aria-hidden="true" /> Signed in as{' '}
                    {user.email ?? user.userId ?? 'unknown user'}
                  </p>
                  <p
                    className={`text-sm ${
                      syncState?.phase === 'in-sync'
                        ? 'font-medium text-green-700 dark:text-green-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {syncState?.phase === 'in-sync'
                      ? '✓ Cloud sync is ready'
                      : 'Connecting to the server…'}
                  </p>
                </div>
                <div>
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </div>
              </div>
            ) : verifying ? (
              <p role="status" className="text-sm text-muted-foreground">
                Verifying code…
              </p>
            ) : otpPrompt ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="sync-otp">
                  Code sent to {email.trim()} — check your inbox
                </Label>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex min-w-[180px] flex-1 flex-col gap-1">
                    <Input
                      id="sync-otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="Sign-in code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                    />
                  </div>
                  <Button onClick={handleVerifyOtp} disabled={!otp.trim()}>
                    Verify
                  </Button>
                  <Button variant="ghost" onClick={handleCancelOtp}>
                    Back
                  </Button>
                </div>
                {errorAlerts(otpPrompt).map((alert, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <p role="alert" className={`text-sm ${alertTextClass(alert.type)}`}>
                      {alert.message.replace('{email}', email.trim())}
                    </p>
                    {alert.copyText && <CopyHint command={alert.copyText} />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-end gap-2">
                <div className="flex min-w-[220px] flex-1 flex-col gap-1">
                  <Label htmlFor="sync-email">Email</Label>
                  <Input
                    id="sync-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                  />
                </div>
                <Button onClick={handleSendCode} disabled={loginInFlight || !email.trim()}>
                  {loginInFlight ? 'Sending code…' : 'Send sign-in code'}
                </Button>
              </div>
            )}

            {loginError && (
              <p role="alert" className="text-sm text-destructive">
                {loginError}
              </p>
            )}

            {genericInteraction && (
              <div className="flex flex-col gap-2 rounded-md border p-3">
                <p className="text-sm font-medium">{genericInteraction.title}</p>
                {genericInteraction.alerts.map((alert, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <p className={`text-sm ${alertTextClass(alert.type)}`}>
                      {alert.message.replace('{email}', email.trim())}
                    </p>
                    {alert.copyText && <CopyHint command={alert.copyText} />}
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => genericInteraction.onSubmit({})}
                  >
                    {genericInteraction.submitLabel || 'OK'}
                  </Button>
                  {genericInteraction.cancelLabel && (
                    <Button variant="ghost" onClick={() => genericInteraction.onCancel()}>
                      {genericInteraction.cancelLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {syncState && !loggedIn && (
              <p role="status" className="text-sm text-muted-foreground">
                Sync status: {syncPhaseLabel(syncState.phase)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- Step 3: pick a direction ---------------------------------- */}
      {cloudUrl && loggedIn && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sync now — pick which side wins</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <section
                aria-labelledby="push-heading"
                className="flex flex-col gap-2 rounded-md border p-4"
              >
                <h2 id="push-heading" className="flex items-center gap-2 text-sm font-semibold">
                  <CloudUpload className="size-4" aria-hidden="true" /> Overwrite the server
                </h2>
                <p className="text-sm text-muted-foreground">
                  Push this device&apos;s data ({describeCounts(localCounts)}) to the server.
                  Anything on the server not on this device is lost.
                </p>
                <div>
                  <Button onClick={() => setConfirm('push')} disabled={busy !== null}>
                    {busy === 'push' ? 'Pushing…' : 'Push to server'}
                  </Button>
                </div>
              </section>

              <section
                aria-labelledby="pull-heading"
                className="flex flex-col gap-2 rounded-md border p-4"
              >
                <h2 id="pull-heading" className="flex items-center gap-2 text-sm font-semibold">
                  <CloudDownload className="size-4" aria-hidden="true" /> Overwrite this device
                </h2>
                <p className="text-sm text-muted-foreground">
                  Pull the server&apos;s data (
                  {serverCounts === null ? 'not read yet' : describeCounts(serverCounts)}) onto
                  this device. Anything here not on the server is lost.
                </p>
                <div>
                  <Button onClick={() => setConfirm('pull')} disabled={busy !== null}>
                    {busy === 'pull' ? 'Pulling…' : 'Pull from server'}
                  </Button>
                </div>
              </section>
            </div>

            {opError && (
              <p role="alert" className="text-sm text-destructive">
                {opError}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- Confirmations ---------------------------------------------- */}
      <AlertDialog open={confirm === 'push'} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite the server with this device&apos;s data?</AlertDialogTitle>
            <AlertDialogDescription>
              This device holds {describeCounts(localCounts)} ({localTotal}{' '}
              {localTotal === 1 ? 'item' : 'items'} in total). Everything currently on the server
              will be replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p className="text-sm font-medium text-destructive">This cannot be undone.</p>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
            <AlertDialogClose render={<Button onClick={handlePush}>Push to server</Button>} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirm === 'pull'} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace this device&apos;s data with the server&apos;s?</AlertDialogTitle>
            <AlertDialogDescription>
              The server holds{' '}
              {serverCounts === null ? 'an unknown set of items' : describeCounts(serverCounts)} (
              {serverTotal === null ? '?' : serverTotal} {serverTotal === 1 ? 'item' : 'items'} in
              total). Everything on this device will be replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {serverTotal === 0 && (
            <p className="text-sm font-medium text-destructive">
              The server is empty — pulling will wipe this device&apos;s data.
            </p>
          )}
          <p className="text-sm font-medium text-destructive">This cannot be undone.</p>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
            <AlertDialogClose render={<Button onClick={handlePull}>Pull from server</Button>} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** The addon's whitelist hint arrives as a shell command — make it copyable. */
function CopyHint({ command }: { command: string }) {
  return (
    <code className="rounded bg-muted px-2 py-1 text-xs break-all text-muted-foreground">
      {command}
    </code>
  )
}
