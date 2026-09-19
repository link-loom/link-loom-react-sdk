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
const fs = require('fs');

// Context-bearing packages come from the consumer so the kit and the host/app share one MUI, emotion and router instance.
const EXTERNAL_PACKAGES = [
  'react',
  'react-dom',
  'react-router-dom',
  '@mui/material',
  '@mui/icons-material',
  '@mui/system',
  '@mui/utils',
  '@mui/x-data-grid',
  '@mui/styled-engine',
  '@emotion/react',
  '@emotion/styled',
];

const RAW_SUFFIX = '?raw';
const BASE64_SUFFIX = '?base64';

// `import text from './file.css?raw'` → the file's contents as a string (StoneOS tokens injection).
// `import data from './font.woff2?base64'` → the file's bytes as base64 (fonts inlined into injected CSS).
const inlineAsset = () => ({
  name: 'inline-asset',
  resolveId(source, importer) {
    const suffix = [RAW_SUFFIX, BASE64_SUFFIX].find((candidate) => source.endsWith(candidate));
    if (!suffix || !importer) {
      return null;
    }
    return path.resolve(path.dirname(importer), source.slice(0, -suffix.length)) + suffix;
  },
  load(id) {
    if (id.endsWith(RAW_SUFFIX)) {
      const filePath = id.slice(0, -RAW_SUFFIX.length);
      this.addWatchFile(filePath);
      return `export default ${JSON.stringify(fs.readFileSync(filePath, 'utf8'))};`;
    }
    if (id.endsWith(BASE64_SUFFIX)) {
      const filePath = id.slice(0, -BASE64_SUFFIX.length);
      this.addWatchFile(filePath);
      return `export default ${JSON.stringify(fs.readFileSync(filePath).toString('base64'))};`;
    }
    return null;
  },
});

module.exports = {
  input: 'src/index.js',
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
      entryFileNames: 'react-sdk.cjs.js',
      chunkFileNames: 'chunks/cjs/[name]-[hash].js',
    },
    {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
      entryFileNames: 'react-sdk.esm.js',
      chunkFileNames: 'chunks/esm/[name]-[hash].js',
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
    inlineAsset(),
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
  external: (id) => EXTERNAL_PACKAGES.some((name) => id === name || id.startsWith(`${name}/`)),
};
