/**
 * 本地存储封装工具
 */

/**
 * 存储类型
 */
export type StorageType = 'localStorage' | 'sessionStorage';

/**
 * 存储选项
 */
export interface StorageOptions {
  /**
   * 存储类型
   */
  type?: StorageType;
  /**
   * 过期时间（毫秒）
   */
  expires?: number;
}

/**
 * 存储项结构
 */
interface StorageItem<T> {
  value: T;
  expires?: number;
}

/**
 * 获取存储对象
 * @param type - 存储类型
 * @returns Storage对象
 */
function getStorageInstance(type: StorageType = 'localStorage'): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return type === 'localStorage' ? window.localStorage : window.sessionStorage;
}

/**
 * 设置存储项
 * @param key - 键名
 * @param value - 值
 * @param options - 选项
 */
export function setStorage<T>(
  key: string,
  value: T,
  options: StorageOptions = {}
): boolean {
  const storage = getStorageInstance(options.type);
  if (!storage) {
    return false;
  }

  try {
    const item: StorageItem<T> = {
      value,
    };

    if (options.expires) {
      item.expires = Date.now() + options.expires;
    }

    storage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error('Storage set error:', error);
    return false;
  }
}

/**
 * 获取存储项
 * @param key - 键名
 * @param type - 存储类型
 * @returns 存储的值，如果不存在或已过期返回null
 */
export function getStorage<T>(key: string, type: StorageType = 'localStorage'): T | null {
  const storage = getStorageInstance(type);
  if (!storage) {
    return null;
  }

  try {
    const itemStr = storage.getItem(key);
    if (!itemStr) {
      return null;
    }

    const item: StorageItem<T> = JSON.parse(itemStr);

    // 检查是否过期
    if (item.expires && Date.now() > item.expires) {
      storage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error('Storage get error:', error);
    return null;
  }
}

/**
 * 删除存储项
 * @param key - 键名
 * @param type - 存储类型
 */
export function removeStorage(key: string, type: StorageType = 'localStorage'): void {
  const storage = getStorageInstance(type);
  if (storage) {
    storage.removeItem(key);
  }
}

/**
 * 清空存储
 * @param type - 存储类型
 */
export function clearStorage(type: StorageType = 'localStorage'): void {
  const storage = getStorageInstance(type);
  if (storage) {
    storage.clear();
  }
}

/**
 * 检查存储项是否存在
 * @param key - 键名
 * @param type - 存储类型
 * @returns 是否存在
 */
export function hasStorage(key: string, type: StorageType = 'localStorage'): boolean {
  const storage = getStorageInstance(type);
  if (!storage) {
    return false;
  }
  return storage.getItem(key) !== null;
}
