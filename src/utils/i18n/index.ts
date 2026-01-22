/**
 * i18n工具函数
 */
import type { Locale } from 'vue-i18n';

/**
 * 语言类型
 */
export type Language = 'en-US' | 'zh-CN';

/**
 * 语言配置
 */
export const LANGUAGES: Record<Language, { label: string; nativeLabel: string }> = {
  'en-US': {
    label: 'English',
    nativeLabel: 'English',
  },
  'zh-CN': {
    label: 'Chinese',
    nativeLabel: '中文',
  },
};

/**
 * 默认语言
 */
export const DEFAULT_LANGUAGE: Language = 'zh-CN';

/**
 * 语言存储key
 */
const LANGUAGE_STORAGE_KEY = 'app_language';

/**
 * 获取存储的语言
 * @returns 语言代码
 */
export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && (stored === 'en-US' || stored === 'zh-CN')) {
    return stored as Language;
  }
  return DEFAULT_LANGUAGE;
}

/**
 * 保存语言到存储
 * @param language - 语言代码
 */
export function setStoredLanguage(language: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
}

/**
 * 切换语言（需要在组件中使用useI18n获取locale对象）
 * @param language - 语言代码
 */
export function switchLanguage(language: Language): void {
  setStoredLanguage(language);
  // 注意：实际的locale切换需要在组件中通过useI18n().locale.value = language来实现
  // 这里只负责存储
}

/**
 * 获取所有支持的语言列表
 * @returns 语言列表
 */
export function getSupportedLanguages(): Array<{ value: Language; label: string; nativeLabel: string }> {
  return Object.entries(LANGUAGES).map(([value, { label, nativeLabel }]) => ({
    value: value as Language,
    label,
    nativeLabel,
  }));
}
