import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  CloudDownload,
  CloudUpload,
  DatabaseBackup,
  RefreshCw,
} from 'lucide-react'
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
import { clearCloudUrl, getCloudUrl, saveCloudUrl, validateCloudUrl } from '../lib/cloud-config'
import { countEntities, describeCounts, readLocalData, totalEntities } from '../lib/local-data'
import { abandonSignIn, beginSignIn, completeSignIn, signOut } from '../lib/sync-ops'
import { clearPendingSignIn, isPullPending, type SyncDirection } from '../lib/sign-in-intent'
import { useCloudStatus } from '../hooks/use-cloud-status'

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
 * Data sync (docs/modules/data-sync.md). The app's data lives in this browser;
 * a Dexie Cloud database is optional. Once connected, syncing is continuous
 * and automatic in both directions — the one directional decision, whether
 * this device's data or the server's wins, is made here at sign-in and never
 * asked again.
 */
export function DataSyncPage() {
  const { showToast } = useToast()
  const { user, syncState, resolved, loggedIn } = useCloudStatus()

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
    clearPendingSignIn()
    void db.cloud.logout({ force: true }).catch(() => {})
    window.location.reload()
  }

  // --- Direction: chosen once, when connecting -----------------------------
  // A pending `pull` means the choice was already made and the page has since
  // reloaded (the local database had to be deleted before signing in) — pick
  // the flow back up at the sign-in step.
  const [direction, setDirection] = useState<SyncDirection | null>(() =>
    isPullPending() ? 'pull' : null,
  )
  const [confirmPull, setConfirmPull] = useState(false)
  const [preparing, setPreparing] = useState(false)

  const localCounts = useMemo(() => countEntities(readLocalData()), [])
  const localTotal = totalEntities(localCounts)

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
  /** True while the first sync round after a successful sign-in is running. */
  const [finishing, setFinishing] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    const sub = db.cloud.userInteraction.subscribe(setInteraction)
    return () => sub.unsubscribe()
  }, [])

  const handleChoosePull = async () => {
    setConfirmPull(false)
    setPreparing(true)
    try {
      // Reloads the page — the local database is deleted so the sign-in cannot
      // push this device's data up to the server the user just chose over it.
      await beginSignIn('pull')
    } catch (err) {
      setPreparing(false)
      setLoginError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleStartOver = () => {
    const chosen = direction
    setDirection(null)
    setLoginError(null)
    setEmail('')
    setOtp('')
    if (!chosen) return
    void abandonSignIn(chosen).catch((err) => {
      console.error('[data-sync] could not restore local-only state', err)
    })
  }

  const otpPrompt = interaction?.type === 'otp' ? interaction : null

  // A fresh prompt means the addon asked again — either the first arrival or
  // a rejected code. Either way we are back at the input, not verifying.
  useEffect(() => {
    if (otpPrompt) setVerifying(false)
  }, [otpPrompt])

  const handleSendCode = () => {
    if (!email.trim() || !direction || loginInFlight) return
    setLoginInFlight(true)
    setLoginError(null)
    setOtp('')
    const chosen = direction
    void beginSignIn(chosen)
      .then((reloading) => {
        if (reloading) return
        return db.cloud
          .login({ email: email.trim(), grant_type: 'otp' })
          .then(async () => {
            // Resolves only after the OTP step succeeds — the user is in.
            setVerifying(false)
            setFinishing(true)
            await completeSignIn(chosen)
            setLoginInFlight(false)
            setFinishing(false)
            setEmail('')
            setOtp('')
            showToast(
              chosen === 'pull' ? 'Signed in — cloud data loaded' : 'Signed in — data uploaded',
            )
          })
      })
      .catch(async (err) => {
        setLoginInFlight(false)
        setVerifying(false)
        setFinishing(false)
        await abandonSignIn(chosen).catch(() => {})
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
    void signOut()
      .then(() => {
        setDirection(null)
        showToast('Signed out — this device keeps its data')
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') showToast(err instanceof Error ? err.message : String(err))
      })
  }

  // Generic addon prompt (message-alert, logout-confirmation) — render its
  // alerts and its own submit/cancel. OTP has its dedicated form above.
  const genericInteraction = interaction && interaction.type !== 'otp' ? interaction : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <RefreshCw className="size-5 text-muted-foreground" aria-hidden="true" /> Data sync
        </h1>
        <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">
          Your data lives in this browser. Connect a Dexie Cloud database and it syncs across your
          devices automatically, as you work. You only choose a direction once — when you sign in
          on a device, you say whether its data or the cloud&apos;s wins.
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

      {/* --- Step 2: sign in, choosing a direction --------------------- */}
      {cloudUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!resolved ? (
              // The addon's currentUser is a BehaviorSubject holding
              // `{ isLoading: true }` until db.open() lets it read the
              // persisted login — boot opens the database, so this is a
              // moment, not a state the page can get stuck in.
              <p role="status" className="text-sm text-muted-foreground">
                Checking sign-in…
              </p>
            ) : loggedIn ? (
              <div className="flex flex-col gap-3">
                <div
                  role="status"
                  className="flex flex-col gap-1 rounded-md border border-green-600/40 bg-green-500/10 p-3"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                    <CheckCircle2 className="size-4" aria-hidden="true" /> Signed in as{' '}
                    {user?.email ?? user?.userId ?? 'unknown user'}
                  </p>
                  <p
                    className={`text-sm ${
                      syncState?.phase === 'in-sync'
                        ? 'font-medium text-green-700 dark:text-green-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {syncState?.phase === 'in-sync'
                      ? '✓ Changes sync automatically, on every device'
                      : syncPhaseLabel(syncState?.phase)}
                  </p>
                </div>
                <div>
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign out
                  </Button>
                </div>
              </div>
            ) : finishing ? (
              <p role="status" className="text-sm text-muted-foreground">
                {direction === 'pull'
                  ? 'Signed in — loading the cloud’s data…'
                  : 'Signed in — uploading this device’s data…'}
              </p>
            ) : direction === null ? (
              <DirectionChoice
                localSummary={describeCounts(localCounts)}
                busy={preparing}
                onPush={() => setDirection('push')}
                onPull={() => setConfirmPull(true)}
              />
            ) : verifying ? (
              <p role="status" className="text-sm text-muted-foreground">
                Verifying code…
              </p>
            ) : otpPrompt ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="sync-otp">Code sent to {email.trim()} — check your inbox</Label>
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
              <div className="flex flex-col gap-3">
                <ChosenDirectionNote direction={direction} localSummary={describeCounts(localCounts)} />
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
                  <Button variant="ghost" onClick={handleStartOver}>
                    Change direction
                  </Button>
                </div>
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
                  <Button variant="outline" onClick={() => genericInteraction.onSubmit({})}>
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
          </CardContent>
        </Card>
      )}

      {/* --- Confirmation: pulling discards this device's data ---------- */}
      <AlertDialog open={confirmPull} onOpenChange={(open) => !open && setConfirmPull(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Replace this device&apos;s data with the cloud&apos;s?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This device holds {describeCounts(localCounts)} ({localTotal}{' '}
              {localTotal === 1 ? 'item' : 'items'} in total). Signing in this way replaces all of
              it with whatever the cloud database holds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p className="text-sm font-medium text-destructive">This cannot be undone.</p>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="ghost">Cancel</Button>} />
            <AlertDialogClose
              render={<Button onClick={() => void handleChoosePull()}>Use the cloud&apos;s data</Button>}
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** The one directional decision: which side wins the first time this device syncs. */
function DirectionChoice({
  localSummary,
  busy,
  onPush,
  onPull,
}: {
  localSummary: string
  busy: boolean
  onPush: () => void
  onPull: () => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Before signing in, say which side wins this once. Afterwards everything syncs both ways,
        automatically.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={onPush}
          disabled={busy}
          className="flex flex-col gap-1 rounded-md border p-4 text-left transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <CloudUpload className="size-4" aria-hidden="true" /> Upload this device&apos;s data
          </span>
          <span className="text-sm text-muted-foreground">
            {localSummary} goes to the cloud. Anything already in the cloud database is replaced.
          </span>
        </button>
        <button
          type="button"
          onClick={onPull}
          disabled={busy}
          className="flex flex-col gap-1 rounded-md border p-4 text-left transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <CloudDownload className="size-4" aria-hidden="true" /> Use the cloud&apos;s data
          </span>
          <span className="text-sm text-muted-foreground">
            This device takes what the cloud database holds. Everything on this device is replaced.
          </span>
        </button>
      </div>
    </div>
  )
}

function ChosenDirectionNote({
  direction,
  localSummary,
}: {
  direction: SyncDirection
  localSummary: string
}) {
  return (
    <p className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
      {direction === 'push' ? (
        <CloudUpload className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      ) : (
        <CloudDownload className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      )}
      <span>
        {direction === 'push'
          ? `On sign-in, this device's data (${localSummary}) becomes the cloud's.`
          : "On sign-in, the cloud's data replaces this device's."}
      </span>
    </p>
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
