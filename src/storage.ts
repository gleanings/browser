/**
 * @module @vvi/browser/storage
 * @file storage.ts
 * @description 本地储存
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ Mr.MudBean
 * @since 2026-08-06 23:31
 * @version 1.0.0
 * @lastModified 2026-08-26 01:18
 */

import { typeOf } from '@vvi/is';

import { tryJSONParse } from '@vvi/utils';

/**
 * # storage 储存类
 *
 * 通过 `new Storage` 构建一个储存对象，实现简单的 storage 操纵。
 *
 * @example
 * ```ts
 * const storage = new Storage();
 *
 * ```
 */
export class Storage {
  /** 默认使用 localStorage ，也可以使用 sessionStorage */
  #t: globalThis.Storage = window.localStorage;
  /**
   * # 前缀
   * 设置可防止多项目部署的时候 key 冲突 （例如 `myApp_` ）
   *
   * *该值设定后不建议随意更改*
   */
  prefix: string = '';

  /**
   * # Storage 构造方法
   *
   * @param prefix - 前缀，设置前缀可防止多项目部署时 key 冲突 （例如： `myApp_` ）
   * @example
   * ```ts
   * const storage = new Storage('');
   *
   *
   * ```
   */
  constructor(prefix?: string) {
    if (prefix && typeOf(prefix) === 'string') {
      this.prefix = prefix;
    }
  }

  /**
   * # 切换储存类型
   * @param type - 要切换的类型，除了传入 `session` 外，其余都将视为更改为 `localStorage`
   */
  use(type?: 'session') {
    this.#t = type === 'session' ? window.sessionStorage : window.localStorage;
  }

  /** 拼接方法（内部） */
  #k(key: string) {
    if (this.prefix) {
      return this.prefix
        .concat(this.prefix.endsWith('_') ? '' : '_')
        .concat(key);
    } else {
      return key;
    }
  }

  /**
   * # 设置键与值
   */
  set<T extends any>(key: string, value: T) {
    if (!key || typeOf(key) !== 'string') return false;
    try {
      const finalKey = this.#k(key);
      const finalValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);
      this.#t.setItem(finalKey, finalValue);
      return true;
    } catch (e: any) {
      if (e?.name === 'QuotaExceededError') {
        //  处理空间不足的情况（QuotaExceededError）
        console.warn('[Storage] 储存空间已满，请清理数据');
      } else {
        console.error(`[Storage] 设置项 "${key}" 失败：`, e);
      }
      return false;
    }
  }

  /**
   * # 读取键的值
   */
  get<T extends any = any>(key: string): T | null {
    if (!key || typeOf(key) !== 'string') return null;
    try {
      // 1. 处理键
      const finalKey = this.#k(key);

      // 2. 获取原始
      const value = this.#t.getItem(finalKey);
      if (value === null) {
        return null;
      }
      // 3.  尝试解析 JSON ，失败则返回原字符串
      return tryJSONParse(value);
    } catch (e: any) {
      console.error(`[Storage] 获取键 "${key}" 失败：`, e);
      return null;
    }
  }

  /**
   * # 移除某键与值
   */
  remove(key: string): Storage {
    if (!key || typeOf(key) !== 'string') return this;
    try {
      const finalKey = this.#k(key);
      this.#t.removeItem(finalKey);
    } catch (e: any) {
      console.error(`[Storage] 移除键 "${key}" 失败：`, e);
    }
    return this;
  }

  /**
   * # 清理所有（该前缀下）的键与值
   */
  clean(): Storage {
    try {
      if (this.prefix) {
        // 1. 有前缀的，只删除该前缀的 key
        const keysToRemove = [];
        /** 前缀 */
        const prefix = (this.prefix && this.prefix.concat('_')) || '';
        // 2. 遍历本地储存键并比对前缀
        for (let i = 0; i < this.#t.length; i++) {
          const _key = this.#t.key(i);
          if (!_key) continue;
          if (_key.startsWith(prefix)) keysToRemove.push(_key);
        }
        keysToRemove.forEach(k => this.#t.removeItem(k));
      } else this.#t.clear();
    } catch (e: any) {
      console.error('[Storage] 请求失败：', e);
    }
    return this;
  }

  /**
   * # 判定是否有某键值存在
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * # 获取所有（设定前缀下）的本地储存值
   * @returns 获取的所有本地储存
   */
  getAll<T extends Record<string, any> = Record<string, any>>(): Partial<T> {
    const result: Record<string, any> = {};
    try {
      /** 有前缀 */
      const hasPrefix = Boolean(this.prefix);
      /** 真实前缀 */
      const prefix = hasPrefix ? this.prefix.concat('_') : '';
      /** 没有前缀 */
      const notPrefix = !hasPrefix;
      /** 遍历并提取相应的值 */
      for (let i = 0, j = this.#t.length; i < j; i++) {
        const k = this.#t.key(i);
        if (k && (notPrefix || k.startsWith(prefix))) {
          /** 原始键值 */
          const rawKey = hasPrefix ? k.replace(this.prefix, '') : k;
          const val = this.#t.getItem(k)!; // k 是遍历来的键，值一定存在
          result[rawKey] = tryJSONParse(val);
        }
      }
    } catch (e: any) {
      console.error('[Storage] 获取所有储存失败：', e);
    }
    return result as Partial<T>;
  }
}
