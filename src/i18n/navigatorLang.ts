function navigatorLanguage(): string {
  return navigator.language;
}

function getLanguage(): string {
  const lRegExp = /^([a-z]{2})(?:[-_].*)?$/g;
  const lenguaje: RegExpExecArray | null = lRegExp.exec(navigatorLanguage());
  if (!lenguaje) return 'es-ES';

  const lang = lenguaje[1];
  if (lang === 'en') return 'en-EN';
  return 'es-ES';
}

export default getLanguage;
