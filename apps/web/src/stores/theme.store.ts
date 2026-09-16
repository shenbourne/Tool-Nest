import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { usePreferredDark } from '@vueuse/core';

export type ThemeMode = 'light' | 'dark' | 'system';

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(
    (localStorage.getItem('toolnest-theme-mode') as ThemeMode) || 'system'
  );

  const systemDark = usePreferredDark();

  const isDark = computed(() => {
    if (mode.value === 'system') return systemDark.value;
    return mode.value === 'dark';
  });

  function setMode(newMode: ThemeMode) {
    mode.value = newMode;
    localStorage.setItem('toolnest-theme-mode', newMode);
    applyTheme();
  }

  function toggleDark() {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const idx = modes.indexOf(mode.value);
    setMode(modes[(idx + 1) % modes.length]);
  }

  function applyTheme() {
    document.documentElement.classList.toggle('dark', isDark.value);
  }

  // Watch for system theme changes
  watch(systemDark, () => {
    if (mode.value === 'system') applyTheme();
  });

  // Apply on init
  applyTheme();

  return { mode, isDark, setMode, toggleDark };
});
