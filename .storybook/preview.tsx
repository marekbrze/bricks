import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import { __resetLocalStorageStores } from '../src/shared/hooks/use-local-storage'

const preview: Preview = {
  // Story decorators seed `localStorage` fresh per story, but a
  // LocalStorageStore snapshot is read once in its constructor and then cached
  // module-wide. Without this, story 2 onward in a file renders story 1's
  // seeded data. Drop the cache before each story so every decorator's seed
  // actually takes.
  async beforeEach() {
    __resetLocalStorageStores()
  },
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo'
    }
  },
};

export default preview;
