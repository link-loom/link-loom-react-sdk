const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel').default;
const alias = require('@rollup/plugin-alias');
const path = require('path');
const postcss = require('rollup-plugin-postcss');
const json = require('@rollup/plugin-json');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const replace = require('@rollup/plugin-replace');
const url = require('@rollup/plugin-url');
const copy = require('rollup-plugin-copy');

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/react-sdk.cjs.js',
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/react-sdk.esm.js',
      format: 'esm',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  onwarn: function (warning, warn) {
    if (warning.message && warning.message.includes('use client')) {
      return;
    }
    if (warning.code === 'CIRCULAR_DEPENDENCY' || warning.code === 'UNUSED_EXTERNAL_IMPORT') {
      return;
    }
    warn(warning);
  },
  plugins: [
    peerDepsExternal(),
    alias({
      entries: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
        { find: '@resources', replacement: path.resolve(__dirname, 'src/resources') },
      ],
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
      extensions: ['.mjs', '.js', '.jsx', '.json', '.woff', '.woff2', '.eot', '.ttf', '.svg'],
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx'],
    }),
    postcss({
      extract: 'styles.css',
      modules: false,
      use: ['sass'],
      minimize: true,
      sourceMap: true,
    }),
    url({
      include: ['**/*.woff', '**/*.woff2', '**/*.eot', '**/*.ttf', '**/*.svg'],
      limit: 0,
      emitFiles: true,
      fileName: 'fonts/[name][extname]',
    }),
    json(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      preventAssignment: true,
    }),
    copy({
      targets: [{ src: 'src/fonts/*', dest: 'dist/fonts' }],
    }),
  ],
  external: ['react', 'react-dom', 'react-router-dom'],
};
