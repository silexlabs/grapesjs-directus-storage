const typescript = require('rollup-plugin-typescript2')
const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')

module.exports = {
  input: 'src/index.ts',
  output: {
    file: 'dist/es6/index.js',
    format: 'iife',
  },
  plugins: [
    typescript(),
    json(),
    resolve(),
    commonjs(),
  ],
};
