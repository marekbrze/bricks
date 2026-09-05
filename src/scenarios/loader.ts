import { getScenario } from './index';

const STORAGE_KEY = '__scenario_name__';

export function loadScenario(name: string): void {
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
  window.location.reload();
}

export function getCurrentScenarioName(): string {
  if (import.meta.env.PROD) return 'empty'; // prod is locked to the empty scenario — ignore leftover localStorage
  return localStorage.getItem(STORAGE_KEY) || 'empty';
}
