const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs').default;
const babel = require('@rollup/plugin-babel').babel;
const alias = require('@rollup/plugin-alias').default;
const path = require('path');
const postcss = require('rollup-plugin-postcss');
const json = require('@rollup/plugin-json');
const pkg = require('./package.json');

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/ui-sdk.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/ui-sdk.esm.js',
      format: 'esm',
    },
  ],
  onwarn: function(warning, warn) {
    if (warning.message && warning.message.includes('use client')) {
      return;
    }

    warn(warning);
  },
  plugins: [
    alias({
      entries: [
        { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      ],
    }),
    resolve({
      extensions: ['.js', '.jsx'],
    }),
    commonjs(),
    babel({ babelHelpers: 'bundled' }),
    postcss({
      extract: true,
    }),
    json(),
  ],
  external: Object.keys(pkg.peerDependencies || {}),
};
