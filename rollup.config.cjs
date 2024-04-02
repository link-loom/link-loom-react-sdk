const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel').default;
const alias = require('@rollup/plugin-alias');
const path = require('path');
const postcss = require('rollup-plugin-postcss');
const json = require('@rollup/plugin-json');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const replace = require('@rollup/plugin-replace');

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/ui-sdk.cjs.js',
      format: 'cjs',
      sourcemap: true, 
    },
    {
      file: 'dist/ui-sdk.esm.js',
      format: 'esm',
      sourcemap: true, 
    },
  ],
  onwarn: function(warning, warn) {
    if (warning.message && warning.message.includes('use client')){
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
        { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      ],
    }),
    resolve({
      browser: true, 
      preferBuiltins: false, 
      extensions: ['.mjs', '.js', '.jsx', '.json', '.node'], 
    }),
    commonjs(), 
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**', 
      extensions: ['.js', '.jsx'], 
    }),
    postcss({
      extract: true, 
    }),
    json(), 
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      preventAssignment: true,
    })
  ],
};
