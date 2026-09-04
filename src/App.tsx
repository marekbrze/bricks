import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './shared/components/AppShell'
import { ModulePlaceholder } from './shared/components/ModulePlaceholder'
import { DevToolbar } from './shared/components/DevToolbar'
import { HOME_PATH } from './shared/navigation'
import { pathsRoutes } from './modules/paths'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell>
        <Routes>
          {/* Home — straight into the Today view. */}
          <Route index element={<Navigate to={HOME_PATH} replace />} />
          {/* paths — first module through proto-lofi. */}
          {pathsRoutes}
          {/* Other modules — proto-lofi replaces this catch-all as each is built. */}
          <Route path=":moduleName" element={<ModulePlaceholder />} />
          {/* Unknown paths fall back home. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
      <DevToolbar />
    </BrowserRouter>
  )
}

export default App
