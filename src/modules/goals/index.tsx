import { Route } from 'react-router-dom'
import { GoalProgressPage } from './components/GoalProgressPage'

/**
 * Routes for the `goals` module. Spread into <Routes> in src/App.tsx.
 * Nested under `paths` in the URL (a Goal only exists in the context of a
 * Path) but registered as its own flat routes here.
 *
 *   /paths/:pathId/goals/:goalId      — Goal progress (own Actions, sub-Goals, graph)
 *
 * The Path's Goal tree is no longer its own route — it renders inline on the
 * Path overview via `PathGoalsSection` (ADR 0043).
 */
export const goalsRoutes = [
  <Route key="goals-progress" path="/paths/:pathId/goals/:goalId" element={<GoalProgressPage />} />,
]
