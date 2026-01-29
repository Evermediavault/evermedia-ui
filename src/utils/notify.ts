/**
 * 通知封装：统一使用设计 token 样式，供全局调用
 */
import { useQuasar } from 'quasar';

const NOTIFY_CLASS = 'ev-notify';
const NOTIFY_SUCCESS = `${NOTIFY_CLASS} ${NOTIFY_CLASS}--success`;
const NOTIFY_ERROR = `${NOTIFY_CLASS} ${NOTIFY_CLASS}--error`;
const NOTIFY_WARNING = `${NOTIFY_CLASS} ${NOTIFY_CLASS}--warning`;
const NOTIFY_INFO = `${NOTIFY_CLASS} ${NOTIFY_CLASS}--info`;

const DEFAULT_OPTS = {
  position: 'top' as const,
  timeout: 2500,
  textColor: 'var(--ev-color-foreground)',
  progress: true,
};

/**
 * 在 setup 内使用，返回统一风格的通知方法
 */
export function useNotify() {
  const $q = useQuasar();

  function opts(
    type: 'positive' | 'negative' | 'warning' | 'info',
    message: string,
    classes: string,
    caption?: string
  ) {
    return {
      ...DEFAULT_OPTS,
      type,
      message,
      classes,
      ...(caption !== undefined && caption !== '' ? { caption } : {}),
    };
  }

  return {
    success(message: string, caption?: string) {
      return $q.notify(opts('positive', message, NOTIFY_SUCCESS, caption));
    },
    error(message: string, caption?: string) {
      return $q.notify(opts('negative', message, NOTIFY_ERROR, caption));
    },
    warning(message: string, caption?: string) {
      return $q.notify(opts('warning', message, NOTIFY_WARNING, caption));
    },
    info(message: string, caption?: string) {
      return $q.notify(opts('info', message, NOTIFY_INFO, caption));
    },
  };
}
