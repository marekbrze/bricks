import { Route } from 'react-router-dom'
import { LogPage } from './components/LogPage'

/**
 * Routes for the `winlog` module. Spread into <Routes> in src/App.tsx.
 * The dedicated Log page — the win balance and day-grouped history are
 * embedded (scoped) in `paths` (Path overview, PathCard) and `goals`
 * (Goal progress) via the shared components, not routed here.
 *
 *   /winlog  — global Log: win balance + Path filter + day-grouped history
 */
export const winlogRoutes = [<Route key="winlog" path="/winlog" element={<LogPage />} />]
