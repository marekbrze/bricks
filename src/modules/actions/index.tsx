import { Route } from 'react-router-dom'
import { ActionsPage } from './components/ActionsPage'

/**
 * Routes for the `actions` module. Spread into <Routes> in src/App.tsx.
 * Planned via proto-feature (docs/changes/actions-page.md) — the flat
 * whole-app task list, 5th nav entry.
 *
 *   /actions           — the grouped list: Inbox group, then Path → Goal → Actions
 */
export const actionsRoutes = [<Route key="actions" path="/actions" element={<ActionsPage />} />]
