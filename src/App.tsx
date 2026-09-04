import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './shared/components/AppShell'
import { ModulePlaceholder } from './shared/components/ModulePlaceholder'
import { DevToolbar } from './shared/components/DevToolbar'
import { ToastProvider } from './shared/components/toast/toast-context'
import { Toaster } from './shared/components/toast/Toaster'
import { HOME_PATH } from './shared/navigation'
import { pathsRoutes } from './modules/paths'
import { captureTriageRoutes } from './modules/capture-triage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <AppShell>
          <Routes>
            {/* Home — straight into the Today view. */}
            <Route index element={<Navigate to={HOME_PATH} replace />} />
            {/* paths — first module through proto-lofi. */}
            {pathsRoutes}
            {/* capture-triage — second module through proto-lofi. */}
            {captureTriageRoutes}
            {/* Other modules — proto-lofi replaces this catch-all as each is built. */}
            <Route path=":moduleName" element={<ModulePlaceholder />} />
            {/* Unknown paths fall back home. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
        <Toaster />
      </ToastProvider>
      <DevToolbar />
    </BrowserRouter>
  )
}

export default App
