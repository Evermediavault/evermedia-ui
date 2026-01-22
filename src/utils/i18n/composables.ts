/**
 * i18n组合式函数
 */
import { useI18n as useVueI18n } from 'vue-i18n';
import { computed } from 'vue';
import type { Language } from './index';
import { setStoredLanguage } from './index';

/**
 * 使用i18n（增强版）
 * @returns i18n相关方法和属性
 */
export function useI18n() {
  const i18n = useVueI18n();
  const { locale, t } = i18n;

  /**
   * 当前语言
   */
  const currentLanguage = computed(() => locale.value as Language);

  /**
   * 切换语言
   */
  const changeLanguage = (lang: Language) => {
    locale.value = lang;
    setStoredLanguage(lang);
  };

  /**
   * 翻译函数（类型安全）
   */
  const translate = (key: string, params?: Record<string, unknown>) => {
    return params ? t(key, params) : t(key);
  };

  return {
    ...i18n,
    locale,
    t: translate,
    currentLanguage,
    changeLanguage,
  };
}
