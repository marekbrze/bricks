import { useEffect, useMemo, useState } from 'react'
import { CloudDownload, CloudUpload, DatabaseBackup, RefreshCw } from 'lucide-react'
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

type LoginStatus = 'idle' | 'sending' | 'awaiting-otp' | 'verifying'
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

/**
 * Data sync (docs/modules/data-sync.md). The app's data lives in this
 * browser; a Dexie Cloud database is optional. Sync is manual and
 * directional — the user picks one: overwrite the server (push) or
 * overwrite this device (pull). There is no merge.
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
    // Clear first, reload immediately: logout() can open an interaction
    // dialog and hang awaiting input (offline, unreachable server) — that
    // must never block disconnecting. Any leftover token state is harmless
    // once the URL is gone and the addon stays unconfigured after reload.
    clearCloudUrl()
    void db.cloud.logout({ force: true }).catch(() => {})
    window.location.reload()
  }

  // --- Account (email + OTP, no passwords) --------------------------------
  const [loginStatus, setLoginStatus] = useState<LoginStatus>('idle')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleSendCode = async () => {
    if (!email.trim()) return
    setLoginStatus('sending')
    setLoginError(null)
    try {
      await db.cloud.login({ email: email.trim(), grant_type: 'otp' })
      setLoginStatus('awaiting-otp')
    } catch (err) {
      setLoginStatus('idle')
      setLoginError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return
    setLoginStatus('verifying')
    setLoginError(null)
    try {
      await db.cloud.login({ email: email.trim(), grant_type: 'otp', otp: otp.trim() })
      setLoginStatus('idle')
      setEmail('')
      setOtp('')
    } catch (err) {
      setLoginStatus('awaiting-otp')
      setLoginError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleSignOut = async () => {
    try {
      await db.cloud.logout()
      showToast('Signed out')
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err))
    }
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
            {user === undefined ? (
              <p className="text-sm text-muted-foreground">Checking sign-in…</p>
            ) : loggedIn ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm">
                  Signed in as{' '}
                  <span className="font-medium">{user.email ?? user.userId ?? 'unknown user'}</span>
                </p>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {loginStatus === 'idle' || loginStatus === 'sending' ? (
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
                      />
                    </div>
                    <Button onClick={handleSendCode} disabled={loginStatus === 'sending' || !email.trim()}>
                      {loginStatus === 'sending' ? 'Sending code…' : 'Send sign-in code'}
                    </Button>
                  </div>
                ) : (
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
                        />
                      </div>
                      <Button onClick={handleVerifyOtp} disabled={loginStatus === 'verifying' || !otp.trim()}>
                        {loginStatus === 'verifying' ? 'Verifying…' : 'Verify'}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setLoginStatus('idle')
                          setOtp('')
                          setLoginError(null)
                        }}
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                )}
                {loginError && (
                  <p role="alert" className="text-sm text-destructive">
                    {loginError}
                  </p>
                )}
              </div>
            )}
            {syncState && (
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
