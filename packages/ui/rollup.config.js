import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: './index.tsx',
  external: ['react', 'react-native'], // 显式标记为外部依赖
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    commonjs({
      // 允许 Rollup 处理 ES 模块
      include: /node_modules/,
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    typescript({ tsconfig: './tsconfig.json' }),
  ],
};