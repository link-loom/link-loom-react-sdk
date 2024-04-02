const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel');
const alias = require('@rollup/plugin-alias');
const builtins = require('rollup-plugin-node-builtins');
const path = require('path');
const postcss = require('rollup-plugin-postcss');
const json = require('@rollup/plugin-json');
const pkg = require('./package.json');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');

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
    peerDepsExternal(),
    alias({
      entries: [
        { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      ],
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),    
    commonjs(),
    babel({ babelHelpers: 'bundled' }),
    postcss({
      extract: true,
    }),
    json(),
    builtins()
  ],
  external: ["react", "react-dom"],
};
