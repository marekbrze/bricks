import { Route } from 'react-router-dom'
import { GoalTreePage } from './components/GoalTreePage'
import { GoalProgressPage } from './components/GoalProgressPage'

/**
 * Routes for the `goals` module. Spread into <Routes> in src/App.tsx.
 * Nested under `paths` in the URL (a Goal only exists in the context of a
 * Path) but registered as its own flat routes here, replacing the
 * `NestedModulePlaceholder` the `paths` module used before this module shipped.
 *
 *   /paths/:pathId/goals              — the Goal tree for that Path
 *   /paths/:pathId/goals/:goalId      — Goal progress (own Actions, sub-Goals, graph)
 */
export const goalsRoutes = [
  <Route key="goals-tree" path="/paths/:pathId/goals" element={<GoalTreePage />} />,
  <Route key="goals-progress" path="/paths/:pathId/goals/:goalId" element={<GoalProgressPage />} />,
]
