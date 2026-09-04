import { Route } from 'react-router-dom'
import { VisionBoardPage } from './components/VisionBoardPage'

/**
 * Routes for the `vision` module. Spread into <Routes> in src/App.tsx.
 * Nested under `paths` in the URL (a Vision only exists in the context of a
 * Path) but registered as its own flat route here, replacing the
 * `NestedModulePlaceholder` the `paths` module used before this module shipped
 * — same handoff `goals` did (see `src/modules/goals/index.tsx`).
 *
 *   /paths/:pathId/vision — the board (notes + image tiles), export
 */
export const visionRoutes = [
  <Route key="vision-board" path="/paths/:pathId/vision" element={<VisionBoardPage />} />,
]
