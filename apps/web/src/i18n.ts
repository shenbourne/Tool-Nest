import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import zh from './locales/zh.json';

const savedLocale =
  typeof localStorage === 'undefined' ? null : localStorage.getItem('toolnest-locale');

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale || 'zh',
  fallbackLocale: 'en',
  messages: { en, zh },
});
