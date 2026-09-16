import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

export function useLocale() {
  const { locale, t } = useI18n();

  const currentLocale = computed(() => locale.value);
  const isZh = computed(() => locale.value === 'zh');
  const isEn = computed(() => locale.value === 'en');

  function setLocale(lang: string) {
    locale.value = lang;
    localStorage.setItem('toolnest-locale', lang);
    document.documentElement.lang = lang;
  }

  function toggleLocale() {
    setLocale(locale.value === 'zh' ? 'en' : 'zh');
  }

  return { locale: currentLocale, isZh, isEn, setLocale, toggleLocale, t };
}
