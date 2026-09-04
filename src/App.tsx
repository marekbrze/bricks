import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './shared/components/AppShell'
import { ModulePlaceholder } from './shared/components/ModulePlaceholder'
import { DevToolbar } from './shared/components/DevToolbar'
import { ToastProvider } from './shared/components/toast/toast-context'
import { Toaster } from './shared/components/toast/Toaster'
import { HOME_PATH } from './shared/navigation'
import { pathsRoutes } from './modules/paths'
import { captureTriageRoutes } from './modules/capture-triage'
import { goalsRoutes } from './modules/goals'
import { todayRoutes } from './modules/today'
import { winlogRoutes } from './modules/winlog'
import { visionRoutes } from './modules/vision'
import { actionsRoutes } from './modules/actions'

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
            {/* goals — third module through proto-lofi. */}
            {goalsRoutes}
            {/* today — fourth module through proto-lofi; also the landing screen. */}
            {todayRoutes}
            {/* winlog — fifth module through proto-lofi. */}
            {winlogRoutes}
            {/* vision — sixth and last module through proto-lofi. */}
            {visionRoutes}
            {/* actions — planned via proto-feature (docs/changes/actions-page.md). */}
            {actionsRoutes}
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
