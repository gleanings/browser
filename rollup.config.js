// import typescript from '@rollup/plugin-typescript';
// 使用更可控的 rollup-plugin-typescript2 代替官插 @rollup/plugin-typescript
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import cleanup from 'rollup-plugin-cleanup';
import copy from 'rollup-plugin-copy';
import { external } from '@vvi/rollup-external';

export default {
  input: './src/index.ts',
  output: ['es', 'cjs'].map(e => ({
    format: e, // 打包模式
    entryFileNames: '[name].js', // 打包文件名
    preserveModules: true, // 保留独立模块结构（关键）
    // preserveModulesRoot: 'src', // 保持 src 目录结构
    sourcemap: false, // 正式环境：关闭 source map
    // exports: 'named', // 导出模式
    dir: `dist/${e}/`,
  })),
  // 配置需要排除或包含的包
  external: external({
    ignore: ['node:'],
  }),
  plugins: [
    resolve({
      extensions: ['.js', '.ts', '.jsx', '.tsx'], // 按需添加
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      tsconfigOverride: {
        noEmit: true, // 仅允许生成类型文件
        declaration: true,
        emitDeclarationOnly: true,
        importHelpers: false, // 确保不引入 tslib
      },
      clean: true,
    }),
    cleanup(),
    copy({
      targets: [
        { src: ['README.md', 'LICENSE', 'CHANGELOG.md'], dest: 'dist' },
      ],
    }),
  ],
};
