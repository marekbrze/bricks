import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './shared/components/AppShell'
import { ModulePlaceholder } from './shared/components/ModulePlaceholder'
import { DevToolbar } from './shared/components/DevToolbar'
import { HOME_PATH } from './shared/navigation'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell>
        <Routes>
          {/* Home — straight into the Today view. */}
          <Route index element={<Navigate to={HOME_PATH} replace />} />
          {/* Module screens — proto-lofi replaces this catch-all with real routes. */}
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
