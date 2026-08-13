/**
 * @module @vvi/browser/storage
 * @file storage.ts
 * @description 本地储存
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ Mr.MudBean
 * @since 2026-08-06 23:31
 * @version 1.0.0
 * @lastModified 2026-08-08 19:34
 */

import { typeOf } from '@vvi/is';

import { tryJSONParse } from '@vvi/utils';

/**
 *
 */
export class Storage {
  /** 默认使用 localStorage ，也可以使用 sessionStorage */
  #t: globalThis.Storage = window.localStorage;
  /**
   * # 前缀
   * 设置可防止多项目部署的时候 key 冲突 （例如 `myApp_` ）
   */
  prefix: string = '';

  /**
   * # 切换储存类型
   * @param type - 要切换的类型，除了传入 `session` 外，其余都将视为更改为 `localStorage`
   */
  use(type?: 'session') {
    this.#t = type === 'session' ? window.sessionStorage : window.localStorage;
  }

  /** 拼接方法 */
  #k(key: string) {
    return this.prefix ? `${this.prefix}${key}` : key;
  }

  /**
   *
   */
  set(key: string, value: any) {
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
   *
   */
  get(key: string): any {
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
   *
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
   *
   */
  clear(): Storage {
    try {
      if (this.prefix) {
        // 1. 有前缀的，只删除该前缀的 key
        const keysToRemove = [];

        // 2. 遍历本地储存键并比对前缀
        for (let i = 0; i < this.#t.length; i++) {
          const _key = this.#t.key(i);
          if (_key && _key.startsWith(this.prefix)) {
            keysToRemove.push(_key);
          }
        }
        keysToRemove.forEach(k => this.#t.removeItem(k));
      } else {
        this.#t.clear();
      }
    } catch (e: any) {
      console.error('[Storage] 请求失败：', e);
    }
    return this;
  }

  /**
   *
   */
  has(key: string) {
    return this.get(key) !== null;
  }

  /**
   * # 获取所有的本地储存值
   * @returns 获取的所有本地储存
   */
  getAll() {
    const result: Record<string, any> = {};
    try {
      for (let i = 0; i < this.#t.length; i++) {
        const k = this.#t.key(i);
        if (k && (!this.prefix || k.startsWith(this.prefix))) {
          const rawKey = k.replace(this.prefix, '');
          const val = this.#t.getItem(k)!; // k 是遍历来的键，值一定存在
          result[rawKey] = tryJSONParse(val);
        }
      }
    } catch (e: any) {
      console.error('[Storage] 获取所有储存失败：', e);
    }
    return result;
  }
}
