import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import { router } from './router';
import en from './locales/en.json';
import zh from './locales/zh.json';
import { usePreferencesStore } from './stores/preferences.store';
import 'virtual:uno.css';

const savedLocale = localStorage.getItem('toolnest-locale') || 'zh';

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, zh },
});

// Set HTML lang attribute
document.documentElement.lang = savedLocale;

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(i18n);

// Load user preferences from server
const preferencesStore = usePreferencesStore();
preferencesStore.load();

app.mount('#app');
