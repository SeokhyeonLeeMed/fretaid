/**
 * persist.ts — localStorage persistence that cannot break the app.
 *
 * Private windows, blocked site data and full quotas all make localStorage
 * throw rather than return null, so every access is guarded. When storage is
 * unavailable the app simply runs with defaults for the session.
 */

import { createJSONStorage as createZustandJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

export { persist };

/** Where the settings are kept. */
export const SETTINGS_KEY = 'fretaid.settings.v1';
/**
 * The key used before the application was renamed. Settings saved under it
 * are still read, so the rename does not reset anybody's instrument, tuning
 * or language; they are written back under the new key from then on.
 */
export const LEGACY_SETTINGS_KEY = 'fretlab.settings.v1';

/** True when localStorage can actually be read and written. */
export function storageAvailable(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const probe = '__fretaid_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      const value = localStorage.getItem(name);
      if (value === null && name === SETTINGS_KEY) return localStorage.getItem(LEGACY_SETTINGS_KEY);
      return value;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      /* settings simply will not persist this session */
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* nothing to do */
    }
  },
};

export function createJSONStorage() {
  return createZustandJSONStorage(() => safeStorage);
}
