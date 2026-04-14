/**
 * CAPITALIZE FILTER
 * Función transforma una cadena de texto a Capitalize
 *
 * Ejemplos:
 * foo -> Foo
 * BAR -> Bar
 */
/* eslint-disable no-param-reassign */
export default (value: string) => {
  if (!value) return '';
  value = value.toString().toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
};
