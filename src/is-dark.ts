/**
 * @module @vvi/browser/is-dark
 * @file is-dark.ts
 * @description 是否为暗黑模式
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ Mr.MudBean
 * @since 2026-08-01 23:43
 * @version 1.0.0
 * @lastModified 2026-08-13 22:05
 */

import { typeOf } from '@vvi/is';

/**
 * # 标准化媒体字符串
 * @param mediaQueryString - 媒体查询条件
 * @returns - 整理后的媒体查询条件
 */
function normsMediaString(mediaQueryString: string): string {
  let result = mediaQueryString;
  // 1. 教研参数合理性
  if (typeOf(result) !== 'string') {
    throw new Error('mediaQueryString 必须是有效字符串');
  }
  // 2. 处理边界
  result = result.trim();
  if (!result) {
    throw new Error('mediaQueryString 必须是有效字符串');
  }

  // 3. 不带小括号（只有媒体类型）
  if (
    ['screen', 'print', 'all', 'screen', 'not', 'only'].some((item: string) =>
      result.startsWith(item),
    )
  ) {
    return result;
  }

  // 4. 必须带小括号（媒体类型）
  if (!result.startsWith('(')) {
    result = '('.concat(result);
  }
  if (!result.endsWith(')')) {
    result = result.concat(')');
  }

  return result;
}

/**
 * # 处理查询字符串数组
 * @param mediaQueryList - 媒体查询条件数组
 * @returns - 返回整理后的媒体查询条件数组
 */
function validMediaQueryList(mediaQueryList: string[]): string[] {
  if (typeOf(mediaQueryList) !== 'array') {
    throw new TypeError('mediaQueryList 必须是媒体字符串数组');
  }
  const result: string[] = [...mediaQueryList];

  return result
    .filter((item: string) => item && typeOf(item) === 'string')
    .map((item: string) => normsMediaString(item));
}

/**
 * # 获取一个指定媒体查询字符串解析后结果（仅是简单的当前状态）
 * 非字符串场景将触发 `Error` 错误
 * @param mediaQueryString - 查询条件
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Window/matchMedia
 */
export function matchMediaByString(mediaQueryString: string): MediaQueryList {
  // 1. 处理字符串
  mediaQueryString = normsMediaString(mediaQueryString);

  // 2. 检验当前环境
  if (!window || !window.matchMedia) {
    throw new RangeError('当前环境非 browser 环境');
  }

  // 3. 返回结果
  return window.matchMedia(mediaQueryString);
}

/**
 * # 简单获取查询媒体状态
 *
 * @param mediaQueryString - 查询的条件字符串
 */
export function matchMediaState(mediaQueryString: string): boolean {
  return matchMediaByString(mediaQueryString).matches;
}

/**
 * # 同时匹配多个媒体状态
 * - *在字符串非法或非浏览器环境下将抛出错误*
 * - *参数为非数组时将抛出错误*
 * @param mediaQueryList - 匹配媒体查询条件数组
 */
export function matchMediaEvery(mediaQueryList: string[]): MediaQueryList {
  // 1. 处理参数
  const normsMediaQueryList: string[] = validMediaQueryList(mediaQueryList);
  // 2. 整理为标准查询条件字符串
  const mediaQueryString: string = normsMediaQueryList.join(' and ');
  // 3. 结果并返回
  const result = matchMediaByString(mediaQueryString);
  return result;
}

/**
 * # 简单获取多条件查询状态
 * @param mediaQueryList -
 */
export function matchMediaEveryState(mediaQueryList: string[]): boolean {
  return matchMediaEvery(mediaQueryList).matches;
}

/**
 * # 任意符合条件媒体
 * - *当前非浏览器环境将抛出错误*
 * - *参数为非字符串数组时将抛出错误*
 * @param mediaQueryList - 媒体查询条件数组
 * @returns - 当前查询的结果媒体对象
 */
export function matchMediaSome(mediaQueryList: string[]): MediaQueryList {
  // 1. 处理参数
  const normsMediaQueryList: string[] = validMediaQueryList(mediaQueryList);
  const mediaQueryString: string = normsMediaQueryList.join(' , ');
  return matchMediaByString(mediaQueryString);
}

/**
 * # 是否符合当前任意媒体条件
 * - *当前环境非浏览器环境抛出错误*
 * - *参数为非字符串数组将抛出错误*
 * @param mediaQueryList
 * @returns - 布尔值，但满足提供的任一媒体条件则返回 `true` ，否者将返回 `false`
 */
export function matchMediaSomeState(mediaQueryList: string[]): boolean {
  return matchMediaSome(mediaQueryList).matches;
}

/**
 * # 当前设备是否是暗黑模式主题
 */
export function isDarkTheme(): boolean {
  return matchMediaState('(prefers-color-scheme: dark)');
}
