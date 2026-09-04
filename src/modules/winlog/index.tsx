import { Route } from 'react-router-dom'
import { LogPage } from './components/LogPage'

/**
 * Routes for the `winlog` module. Spread into <Routes> in src/App.tsx.
 * The dedicated Log page — embedded `ContributionGraph`s live inline in
 * `paths` (Path overview) and `goals` (Goal progress), not routed here.
 *
 *   /winlog  — global Log: graph + Path filter + full chronological history
 */
export const winlogRoutes = [<Route key="winlog" path="/winlog" element={<LogPage />} />]
