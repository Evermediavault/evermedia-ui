/**
 * 上传页元数据条目格式校验
 * 复用 rules 中的 isUrl、isStringLength
 */
import { isUrl, isStringLength, isNumeric } from './rules';

export type MetaEntryType = 'url' | 'input' | 'text' | 'number';

/** 元数据 name 最大长度 */
export const META_NAME_MAX_LENGTH = 256;

/** 元数据 value 最大长度 */
export const META_VALUE_MAX_LENGTH = 2048;

export interface MetaEntryLike {
  name: string;
  type: MetaEntryType;
  value: string;
}

export interface MetaEntryValidationResult {
  valid: boolean;
  nameError?: string;
  valueError?: string;
}

/**
 * 按 type 校验 value 格式
 * - url: 非空时须为合法 http(s) URL
 * - number: 非空时须为合法数字
 * - input / text: 仅校验长度
 */
export function validateMetaValue(
  value: string,
  type: MetaEntryType
): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (type === 'url') {
    if (trimmed.length === 0) return true;
    return isUrl(value);
  }
  if (type === 'number') {
    if (trimmed.length === 0) return true;
    return isNumeric(value) && isStringLength(value, 0, META_VALUE_MAX_LENGTH);
  }
  return isStringLength(value, 0, META_VALUE_MAX_LENGTH);
}

/**
 * 校验单条元数据：name 长度、value 按 type 格式与长度
 */
export function validateMetaEntry(entry: MetaEntryLike): MetaEntryValidationResult {
  const result: MetaEntryValidationResult = { valid: true };
  const name = typeof entry.name === 'string' ? entry.name.trim() : '';
  const value = typeof entry.value === 'string' ? entry.value : '';
  const type = entry.type;

  if (!isStringLength(name, 0, META_NAME_MAX_LENGTH)) {
    result.valid = false;
    result.nameError = 'name_length';
  }

  if (type === 'url' && value.trim().length > 0 && !isUrl(value)) {
    result.valid = false;
    result.valueError = 'value_url_invalid';
  } else if (type === 'number' && value.trim().length > 0 && !isNumeric(value)) {
    result.valid = false;
    result.valueError = 'value_number_invalid';
  } else if (!isStringLength(value, 0, META_VALUE_MAX_LENGTH)) {
    result.valid = false;
    result.valueError = 'value_length';
  }

  return result;
}
