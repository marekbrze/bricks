import { Route } from 'react-router-dom'
import { TodayPage } from './components/TodayPage'
import { SchedulePage } from './components/SchedulePage'
import { ReviewAbandonedPage } from './components/ReviewAbandonedPage'

/**
 * Routes for the `today` module. Spread into <Routes> in src/App.tsx.
 * The app's landing screen — `HOME_PATH` points at `/today`.
 *
 *   /today            — day view, sections per Path (defaults to today's date)
 *   /today/schedule    — agenda view across every upcoming day with something scheduled
 *   /today/abandoned   — Review abandoned: reschedule or delete for good
 */
export const todayRoutes = [
  <Route key="today" path="/today" element={<TodayPage />} />,
  <Route key="today-schedule" path="/today/schedule" element={<SchedulePage />} />,
  <Route key="today-abandoned" path="/today/abandoned" element={<ReviewAbandonedPage />} />,
]
