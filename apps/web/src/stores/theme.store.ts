import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { useDark, useToggle } from '@vueuse/core';

export const useThemeStore = defineStore('theme', () => {
  const isDark = useDark({
    storageKey: 'toolnest-theme',
    valueDark: 'dark',
    valueLight: '',
  });
  const toggleDark = useToggle(isDark);

  return { isDark, toggleDark };
});
