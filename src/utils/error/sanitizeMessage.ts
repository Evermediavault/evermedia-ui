/**
 * Hide technical API/route messages from end users; align with frontend-main `userFacingError`.
 */
import type { Language } from 'src/utils/i18n';
import { getStoredLanguage } from 'src/utils/i18n';

const GENERIC: Record<Language, string> = {
  'zh-CN': '服务器错误，请稍后重试',
  'en-US': 'Server error. Please try again later.',
};

/** True when the string must not be shown in UI (route traces, stacks, env hints, etc.). */
export function isUnsafeApiMessage(message: string): boolean {
  const m = message.trim();
  if (!m) return false;
  if (m.length > 600) return true;
  if (/Route\s+(?:GET|POST|PUT|PATCH|DELETE):/i.test(m)) return true;
  if (/\bRoute\b.*\bnot\s+found\b/i.test(m)) return true;
  if (/\/api\/v\d+\//i.test(m) && /not\s*found/i.test(m)) return true;
  if (/NEXT_PUBLIC_|process\.env|ECONNREFUSED|PrismaClient|socket hang up/i.test(m)) return true;
  if (/Failed to fetch|NetworkError|Load failed|Network request failed/i.test(m)) return true;
  if (/\n/.test(m) && /^\s*at\s+/m.test(m)) return true;
  if (/AbortError|aborted|The operation was aborted/i.test(m)) return true;
  return false;
}

function genericLabel(): string {
  const lang: Language =
    typeof window !== 'undefined' ? getStoredLanguage() : 'zh-CN';
  return GENERIC[lang];
}

/** Safe string for inline error display (e.g. `error.message` in templates). */
export function toSafeErrorDisplayString(raw: string): string {
  if (!raw.trim()) return genericLabel();
  if (isUnsafeApiMessage(raw)) return genericLabel();
  return raw.trim();
}

/** Wrap any caught value as `Error` with a safe `.message`. */
export function wrapCaughtError(e: unknown): Error {
  const raw = e instanceof Error ? e.message : String(e);
  return new Error(toSafeErrorDisplayString(raw));
}
