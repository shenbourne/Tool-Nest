import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserPreferences } from '@toolnest/shared';

const API_BASE = '/api';

export const usePreferencesStore = defineStore('preferences', () => {
  const prefs = ref<UserPreferences>({
    version: 1,
    language: 'zh',
    theme: 'system',
    favorites: [],
    recentTools: [],
    settings: {},
  });

  const loaded = ref(false);
  const loading = ref(false);
  const syncError = ref<string | null>(null);

  // Load preferences from backend
  async function load(): Promise<void> {
    if (loading.value) return;
    loading.value = true;
    syncError.value = null;
    try {
      const res = await fetch(`${API_BASE}/user/preferences`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        prefs.value = json.data;
        loaded.value = true;
      }
    } catch (err) {
      // Fall back to localStorage
      console.warn('Failed to load preferences from server, using localStorage:', err);
      const localFavs = localStorage.getItem('toolnest-favorites');
      const localRecent = localStorage.getItem('toolnest-recent');
      if (localFavs) prefs.value.favorites = JSON.parse(localFavs);
      if (localRecent) prefs.value.recentTools = JSON.parse(localRecent);
      loaded.value = true;
      syncError.value = 'Using local data (server unavailable)';
    } finally {
      loading.value = false;
    }
  }

  // Save preferences to backend (and localStorage as fallback)
  async function save(updates: Partial<UserPreferences>): Promise<void> {
    const merged = { ...prefs.value, ...updates };
    prefs.value = merged;

    // Always save to localStorage as fallback
    localStorage.setItem('toolnest-favorites', JSON.stringify(merged.favorites));
    localStorage.setItem('toolnest-recent', JSON.stringify(merged.recentTools));

    // Try to sync to server
    try {
      const res = await fetch(`${API_BASE}/user/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        prefs.value = json.data;
      }
    } catch (err) {
      console.warn('Failed to sync preferences to server:', err);
      syncError.value = 'Changes saved locally (server unavailable)';
    }
  }

  // Toggle a favorite
  async function toggleFavorite(path: string): Promise<void> {
    const idx = prefs.value.favorites.indexOf(path);
    const newFavs = [...prefs.value.favorites];
    if (idx >= 0) {
      newFavs.splice(idx, 1);
    } else {
      if (newFavs.length >= 50) newFavs.shift();
      newFavs.push(path);
    }
    await save({ favorites: newFavs });
  }

  // Record a tool usage
  async function recordToolUsage(path: string): Promise<void> {
    const filtered = prefs.value.recentTools.filter(r => r.path !== path);
    const updated = [{ path, timestamp: Date.now() }, ...filtered].slice(0, 30);
    await save({ recentTools: updated });
  }

  const isFavorite = computed(() => (path: string) =>
    prefs.value.favorites.includes(path)
  );

  return {
    prefs,
    loaded,
    loading,
    syncError,
    load,
    save,
    toggleFavorite,
    recordToolUsage,
    isFavorite,
  };
});
