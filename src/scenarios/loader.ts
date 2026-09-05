import { getScenario } from './index';
import { clearSyncedTables } from '@/modules/data-sync/lib/mirror';

const STORAGE_KEY = '__scenario_name__';

export async function loadScenario(name: string): Promise<void> {
  // Scenario data is wiped, but sync config isn't data — keeping it means a
  // scenario switch doesn't force the Dexie Cloud setup again.
  const keysToKeep = new Set(['__scenario_name__', 'bricks-cloud-url']);
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && !keysToKeep.has(key)) {
      localStorage.removeItem(key);
    }
  }

  const data = getScenario(name);
  for (const [key, value] of Object.entries(data)) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  localStorage.setItem(STORAGE_KEY, name);

  // The synced tables still hold the outgoing scenario, and the mirror's base
  // map went out with the LocalStorage sweep — so without this the next boot
  // would see the old rows as untracked and keep them. Emptying the tables
  // first leaves the scenario as the only data there is. While signed in that
  // reaches the cloud too, which is what "reset all data" has to mean once a
  // device is syncing.
  try {
    await clearSyncedTables();
  } catch (err) {
    console.error('[scenarios] could not clear the synced tables', err);
  }

  window.location.reload();
}

export function getCurrentScenarioName(): string {
  if (import.meta.env.PROD) return 'empty'; // prod is locked to the empty scenario — ignore leftover localStorage
  return localStorage.getItem(STORAGE_KEY) || 'empty';
}
