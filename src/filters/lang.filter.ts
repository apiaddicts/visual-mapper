import i18n from '@/i18n';

export default (url: string) => {
  // En vue-i18n 9 con legacy: false, se usa global.locale.value
  if (!i18n.global.locale.value) return url;
  return `/${i18n.global.locale.value}${url}`;
};
