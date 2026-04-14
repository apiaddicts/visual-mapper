import i18n from '@/i18n';
import navigatorLang from '@/i18n/navigatorLang';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default (to: any, from: any, next: any) => {
  const lang = navigatorLang();
  if ((i18n as any).global) {
    (i18n as any).global.locale = lang;
  } else {
    (i18n as any).locale = lang;
  }

  return next();
};
