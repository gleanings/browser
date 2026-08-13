import { typeOf, isNaN } from '@vvi/is';

/**
 * @module @zza/cookie
 * @file cookie.ts
 * @description cookie 管理
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ Mr.MudBean
 * @since  01/10/2025
 * @lastModified 2026-08-01 23:35
 */
/**
 * # 允许服务器制定是否/何时通过跨站点请求发送
 * - `Strict` ： cookie 仅发送它来源的站点（完全禁止跨站携带）
 * - `Lax` ：缺省值，仅部分安全场景允许跨站携带
 * - `None` ：指定浏览器会在同站请求和跨站请求下继续发送 cookie
 * @see https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/Set-Cookie#samesitesamesite-value
 */
export type CookieSameSite = 'Strict' | 'Lax' | 'None';

/**
 * # Cookie 的配置项
 */
export type CookieOption = {
  /**
   * # 过期时间（以天为单位，支持小数）
   * @see https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/Set-Cookie#expiresdate
   */
  expires?: number;
  /**
   * ## 指定一个 URL 路径
   * 该路径以字符 `%x2F` ("/") 作为路径分隔符，并且子路径也会被匹配
   */
  path?: string;
  /**
   * ## 指定哪些主机可以接受 Cookie
   * 缺省默认为同一 host 设置的 cookie，不包含子域名
   * 例如，如果设置了 `Domain=`
   */
  domain?: string;
  /** 仅允许使用 HTTPS 协议加密过的请求发送给服务器 */
  secure?: string;
  /**
   * # 允许服务器制定是否/何时通过跨站点请求发送
   * @see CookieSameSite
   */
  sameSite?: CookieSameSite;
};

/**
 * # 根据键值获取 cookie 值
 * @param name cookie 键值
 * @returns
 */
export function getCookie(name: string): string | null {
  if (!name || typeOf(name) != 'string') {
    return null;
  }
  const cookies = document.cookie ? document.cookie.split(';') : [];
  const encodedName = encodeURIComponent(name);

  for (let i = 0, j = cookies.length; i < j; i++) {
    const [key, ...valParts] = cookies[i].trim().split('=');
    if (key !== encodedName) {
      continue;
    }
    // 处理可能包含 "=" 的情况
    const val = valParts.join('=');
    const decodedVal = decodeURIComponent(val);
    try {
      // 尝试解析 JSON ，失败则返回原字符串
      return JSON.parse(decodedVal);
    } catch {
      return decodedVal;
    }
  }
  return null;
  // 使用正则可能对性能不太好
  // 1. 依赖 `document.cookie.replace` 捕获分组，匹配不到时返回空字符串，容易误判
  // 2. 正则里 `.*` 贪婪匹配，极端 cookie 长度下性能差
  // 3. 对 cookie value 中出现 `;`、空格等边界处理较弱
  // 4. 没有处理 `key=` 后面空格、空值的鲁棒性
  // 5. 无法天然支持 value 中包含 `=` 的场景
  // const handledKey = encodeURIComponent(keyItem).replace(/[-.+*]/g, '\\$&');
  // const regStr =
  //   '(?:(?:^|.*;)\\s*' + handledKey + '\\s*\\=\\s*([^;]*).*$)|^.*$';
  // const reg = new RegExp(regStr);
  // const value = document.cookie.replace(reg, '$1');
  // const result = decodeURIComponent(value);
  // return result || null;
}

/**
 * # 设置 cookie 值
 *
 * 未传入 `name` 将抛出错误
 * @param name  - Cookie 名称
 * @param value   - Cookie 值（支持对象/数组，会自动 JSON 序列化）
 * @param cookieOption - 配置项
 * @see CookieOption
 */
export function setCookie(
  name: string,
  value: string,
  cookieOption?: CookieOption,
) {
  let { expires, path, domain, secure, sameSite } = cookieOption ?? {};
  if (!name) {
    throw new Error('Cookie 的 "name" 是必须的');
  }
  const valueType = typeOf(value);

  // 1. 处理值 ： 如果是对象/数组则进行序列化，并统一进行 URI 编码
  let cookieValue =
    valueType === 'object' ||
    valueType == 'array' ||
    valueType == 'set' ||
    valueType == 'map'
      ? JSON.stringify(value)
      : String(value);
  cookieValue = encodeURIComponent(cookieValue);

  // 2. 构建 Cookie 字符串
  let cookieStr = `${encodeURIComponent(name)}=${cookieValue}`;

  // 3. 处理过期时间
  const expiresType = typeOf(expires);
  if (
    expires &&
    expiresType === 'number' &&
    expires != Infinity &&
    expires != -Infinity &&
    !isNaN(expires)
  ) {
    const date = new Date();
    date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
    cookieStr += `; expires=${date.toUTCString()}`;
  }

  // 4. 处理其他属性
  cookieStr += `; path=${path && typeOf(path) == 'string' ? domain : '/'}`;
  if (domain && typeOf(domain) === 'string') cookieStr += `; domain=${domain}`;
  if (secure) cookieStr += `; secure`;
  if (sameSite) cookieStr += `; samesite=${sameSite}`;

  document.cookie = cookieStr;
}

/**
 * # 删除指定 Cookie
 * @param name - Cookie 名称
 * @param cookieOption - 必须与设置时的 `path/domain` 保持一致才能删除
 */
export function removeCookie(name: string, cookieOption?: CookieOption) {
  // 通过设置过去的时间来删除
  setCookie(name, '', {
    ...cookieOption,
    expires: -1,
  });
}

/**
 * # 检测 Cookie 是否存在
 * @param name
 */
export function hasCookie(name: string) {
  return getCookie(name) !== null;
}

/**
 * # 获取所有的 Cookie
 *
 */
export function getAllCookie(): Record<string, any> {
  const cookies = document.cookie ? document.cookie.split(';') : [];
  const result: Record<string, any> = {};
  for (let i = 0, j = cookies.length; i < j; i++) {
    const [key, ...valParts] = cookies[i].trim().split('=');
    const val = valParts.join('=');
    const decodeKey = decodeURIComponent(key);
    const decodeValue = decodeURIComponent(val);
    try {
      result[decodeKey] = JSON.parse(decodeValue);
    } catch {
      result[decodeKey] = decodeValue;
    }
  }
  return result;
}
