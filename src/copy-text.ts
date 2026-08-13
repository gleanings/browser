/**
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @file copy-text.ts
 * @since  周四  12/19/2024
 * @lastModified 2026-08-10 20:03
 * @description 复制文本到剪切板
 */

declare global {
  const clipboardData: {
    /**
     * 清空当前的剪切板
     */
    clearData(): void;
    /**
     * 设置新的剪切板数据
     */
    setData(arg0: 'Text', arg1: string): void;
  };
}

/**
 * # 复制文本信息到设备剪切板
 * @param text - 要设置的文本
 */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    if (clipboardData && clipboardData.clearData && clipboardData.setData) {
      /**
       * IE 大哥
       *
       * 该值 `clipboardData` 存在于 window 上
       */
      clipboardData.clearData();
      clipboardData.setData('Text', text);
    } else if (document.execCommand) {
      /*  旧式写法*/
      const hover = document.createElement('input');
      hover.value = text;
      document.body.appendChild(hover);
      hover.select();
      document.execCommand('Copy');
      hover.className = 'hover';
      hover.style.display = 'none';
    }
  }
}
