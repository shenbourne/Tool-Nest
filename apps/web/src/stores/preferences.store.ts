import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { usePreferredDark } from '@vueuse/core';
import { i18n } from '../i18n';
import type { UserPreferences } from '@toolnest/shared';

const API_BASE = '/api';

export type ThemeMode = 'light' | 'dark' | 'system';

export const usePreferencesStore = defineStore('preferences', () => {
  // ── Core preferences state ──────────────────────────────────────────
  const prefs = ref<UserPreferences>({
    version: 1,
    language: localStorage.getItem('toolnest-locale') || 'zh',
    theme: (localStorage.getItem('toolnest-theme-mode') as ThemeMode) || 'system',
    favorites: [],
    recentTools: [],
    settings: {},
  });

  const loaded = ref(false);
  const loading = ref(false);
  const syncError = ref<string | null>(null);

  // ── Theme management ────────────────────────────────────────────────
  const systemDark = usePreferredDark();

  const isDark = computed(() => {
    if (prefs.value.theme === 'system') return systemDark.value;
    return prefs.value.theme === 'dark';
  });

  function applyTheme() {
    document.documentElement.classList.toggle('dark', isDark.value);
  }

  function setMode(newMode: ThemeMode) {
    prefs.value.theme = newMode;
    localStorage.setItem('toolnest-theme-mode', newMode);
    applyTheme();
  }

  function toggleDark() {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const idx = modes.indexOf(prefs.value.theme);
    setMode(modes[(idx + 1) % modes.length]);
  }

  // Watch for system theme changes
  watch(systemDark, () => {
    if (prefs.value.theme === 'system') applyTheme();
  });

  // ── Locale management ───────────────────────────────────────────────
  // useI18n() can only be called inside component setup; in a Pinia store
  // we use the global i18n instance directly.
  const i18nLocale = i18n.global.locale;

  const isZh = computed(() => prefs.value.language === 'zh');
  const isEn = computed(() => prefs.value.language === 'en');

  function setLocale(lang: string) {
    prefs.value.language = lang;
    i18nLocale.value = lang as 'zh' | 'en';
    localStorage.setItem('toolnest-locale', lang);
    document.documentElement.lang = lang;
  }

  function toggleLocale() {
    setLocale(prefs.value.language === 'zh' ? 'en' : 'zh');
  }

  // ── Sidebar management ──────────────────────────────────────────
  const sidebarMode = computed<'anchor' | 'navigate'>({
    get: () => (prefs.value.settings.sidebarMode as 'anchor' | 'navigate') || 'anchor',
    set: (val: 'anchor' | 'navigate') => {
      prefs.value.settings.sidebarMode = val;
      localStorage.setItem('toolnest-sidebar-mode', val);
    },
  });

  const sidebarCollapsed = ref<boolean>(
    localStorage.getItem('toolnest-sidebar-collapsed') === 'true'
  );

  function setSidebarMode(mode: 'anchor' | 'navigate') {
    sidebarMode.value = mode;
    save({ settings: prefs.value.settings });
  }

  function toggleSidebarCollapsed() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
    localStorage.setItem('toolnest-sidebar-collapsed', String(sidebarCollapsed.value));
  }

  // ── Server sync: load ───────────────────────────────────────────────
  async function load(): Promise<void> {
    if (loading.value) return;
    loading.value = true;
    syncError.value = null;
    try {
      const res = await fetch(`${API_BASE}/user/preferences`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        prefs.value = { ...prefs.value, ...json.data };
        loaded.value = true;
      }
    } catch (err) {
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

    // After loading, apply theme and locale side-effects
    applyTheme();
    setLocale(prefs.value.language);
    const savedMode = localStorage.getItem('toolnest-sidebar-mode');
    if (savedMode === 'anchor' || savedMode === 'navigate') {
      prefs.value.settings.sidebarMode = savedMode;
    }
  }

  // ── Server sync: save ───────────────────────────────────────────────
  async function save(updates: Partial<UserPreferences>): Promise<void> {
    const merged = { ...prefs.value, ...updates };
    prefs.value = merged;

    // Persist to localStorage as fallback
    localStorage.setItem('toolnest-favorites', JSON.stringify(merged.favorites));
    localStorage.setItem('toolnest-recent', JSON.stringify(merged.recentTools));
    if (updates.theme) {
      localStorage.setItem('toolnest-theme-mode', updates.theme);
      applyTheme();
    }
    if (updates.language) {
      setLocale(updates.language);
    }

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
        prefs.value = { ...prefs.value, ...json.data };
      }
    } catch (err) {
      console.warn('Failed to sync preferences to server:', err);
      syncError.value = 'Changes saved locally (server unavailable)';
    }
  }

  // ── Favorites & recents ─────────────────────────────────────────────
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

  async function recordToolUsage(path: string): Promise<void> {
    const filtered = prefs.value.recentTools.filter(r => r.path !== path);
    const updated = [{ path, timestamp: Date.now() }, ...filtered].slice(0, 30);
    await save({ recentTools: updated });
  }

  const isFavorite = computed(() => (path: string) =>
    prefs.value.favorites.includes(path)
  );

  return {
    // state
    prefs,
    loaded,
    loading,
    syncError,
    // theme
    isDark,
    setMode,
    toggleDark,
    // locale
    isZh,
    isEn,
    setLocale,
    toggleLocale,
    // favorites & recents
    load,
    save,
    toggleFavorite,
    recordToolUsage,
    isFavorite,
    // sidebar
    sidebarMode,
    sidebarCollapsed,
    setSidebarMode,
    toggleSidebarCollapsed,
  };
});
