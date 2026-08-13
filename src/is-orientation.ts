/**
 * @module @vvi/browser/is-orientation
 * @file is-orientation.ts
 * @description 当前设备是否旋转
 * @author Mr.MudBean <Mr.MudBean@outlook.com>
 * @copyright 2026 ©️ Mr.MudBean
 * @since 2026-08-01 23:46
 * @version 1.0.0
 * @lastModified 2026-08-13 22:05
 */

/**
 * # 当前设备是否横屏
 */
export function isOrientation() {
  const orientation: OrientationType =
    (screen.orientation || {}).type ||
    // eslint-disable-next-line jsdoc/check-tag-names
    /**  @ts-ignore: moz 浏览器  */
    screen.mozOrientation ||
    // eslint-disable-next-line jsdoc/check-tag-names
    /**  @ts-ignore: ms 浏览器  */
    screen.msOrientation;
  /**
   * - portrait-primary  旋转 360
   * - portrait-secondary 旋转 180
   * - landscape-primary  旋转  90
   * - landscape-secondary 旋转 270
   */
  if (
    orientation === 'landscape-primary' ||
    orientation === 'landscape-secondary'
  )
    return false;
  return true;
}
