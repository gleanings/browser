# browser

[![version](<https://img.shields.io/npm/v/@vvi/browser.svg?logo=npm&logoColor=rgb(0,0,0)&label=版本号&labelColor=rgb(73,73,228)&color=rgb(0,0,0)>)](https://www.npmjs.com/package/@vvi/browser) [![issues 提交](<https://img.shields.io/badge/issues-提交-rgb(255,0,63)?logo=github>)](https://github.com/MrMudBean/browser/issues)

## 安装

```bash
npm install --save @vvi/browser

# pnpm
pnpm add --save @vvi/browser

# yarn
yarn add --save @vvi/browser
```

## 提供

- `copyText` - 复制文本到剪切板
- `matchMediaState` - 媒体查询的结果（与 `window.matchMedia` 返回对象不同的是该方法返回的是布尔值）
- `isDarkTheme` - 是否为暗黑主题
- `isOrientation` - 设备是否为横屏状态
- `Storage` - 导出 `Storage` 类，可构建管理 `localStorage` 或 `sessionStorage` 的方法
- `getCookie` - 获取本地的 cookie 值
- `setCookie` - 设置 cookie 值
- `removeCookie` - 移除 cookie 值
- `hasCookie` - 判定是否有某指定键的值
- `getAllCookie` - 返回所有的键值

## 状态

此软件包是 `MrMudBean` 生态系统的一部分。
它使用严格的 TypeScript 编写，并通过 Rollup 构建进行验证。
虽然单元测试较少，但 API 稳定，并在生产环境中大量使用。
