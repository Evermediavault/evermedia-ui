import { defineBoot } from '#q-app/wrappers';
import { createI18n } from 'vue-i18n';

import messages from 'src/i18n';
import { getStoredLanguage, DEFAULT_LANGUAGE } from 'src/utils/i18n';

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-object-type */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-object-type */

export default defineBoot(({ app }) => {
  // 从localStorage获取语言，如果没有则使用默认语言
  const savedLanguage = getStoredLanguage();
  const initialLocale = savedLanguage || DEFAULT_LANGUAGE;

  const i18n = createI18n<{ message: MessageSchema }, MessageLanguages>({
    locale: initialLocale,
    fallbackLocale: 'en-US',
    legacy: false,
    messages,
  });

  // Set i18n instance on app
  app.use(i18n);
});
