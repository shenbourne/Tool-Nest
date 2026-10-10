import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { i18n } from './i18n';
import { usePreferencesStore } from './stores/preferences.store';
import VueKonva from 'vue-konva';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './styles/tokens.css';
import './styles/global.css';
import 'virtual:uno.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(VueKonva);

const preferencesStore = usePreferencesStore();

// Load user preferences from server (also applies theme + locale side-effects)
preferencesStore.load();

app.mount('#app');
