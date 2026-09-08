import { Route } from 'react-router-dom'
import { PathsPage } from './components/PathsPage'
import { ArchivedPathsPage } from './components/ArchivedPathsPage'
import { PathOverviewPage } from './components/PathOverviewPage'
import { PathActionsPage } from './components/PathActionsPage'

/**
 * Routes for the `paths` module. Spread into <Routes> in src/App.tsx.
 *
 *   /paths                     — card grid of active Paths
 *   /paths/archived            — archived Paths
 *   /paths/:pathId             — Path overview (the hub): Vision, Stats, Goals (ADR 0043)
 *   /paths/:pathId/actions     — this Path's Goals + Actions, drag-and-drop
 *
 * These sit on one tab bar (`PathTabs`) together with `/paths/:pathId/vision`
 * (owned by `vision`, registered separately in App.tsx). The Path's Goal tree
 * is no longer its own route — `PathGoalsSection` renders it on the overview.
 * `/paths/:pathId/goals/:goalId` (Goal progress) is still owned by `goals`.
 */
export const pathsRoutes = [
  <Route key="paths" path="/paths" element={<PathsPage />} />,
  <Route key="paths-archived" path="/paths/archived" element={<ArchivedPathsPage />} />,
  <Route key="path-overview" path="/paths/:pathId" element={<PathOverviewPage />} />,
  <Route key="path-actions" path="/paths/:pathId/actions" element={<PathActionsPage />} />,
]
