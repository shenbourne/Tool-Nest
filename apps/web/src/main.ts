import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import { router } from './router';
import en from './locales/en.json';
import zh from './locales/zh.json';
import 'virtual:uno.css';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('toolnest-locale') || 'zh',
  fallbackLocale: 'en',
  messages: { en, zh },
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.mount('#app');
