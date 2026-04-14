import { createI18n } from 'vue-i18n';
import navigatorLang from './navigatorLang';

import es from './es';
import en from './en';

const i18n = createI18n({
  legacy: false,
  locale: navigatorLang(),
  fallbackLocale: 'es-ES',
  messages: {
    'es-ES': es,
    'en-EN': en,
  },
  silentFallbackWarn: true,
});

export default i18n;
