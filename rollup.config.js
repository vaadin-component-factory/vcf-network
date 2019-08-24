import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const plugins = [
  // The 'node-resolve' plugin allows Rollup to resolve bare module imports like
  // in `import pathToRegexp from 'vcf-network'`
  resolve(),

  // The 'commonjs' plugin allows Rollup to convert CommonJS exports on the fly
  // into ES module imports (so that `import vis from 'vcf-network'`
  // works even though the exports are done via `module.exports = {}`)
  commonjs()
];

const config = [
  {
    input: 'src/lib/vis-network.js',
    output: {
      format: 'es',
      file: 'src/lib/vis-network.es.js',
      sourcemap: true
    },
    plugins
  },
  // UMD bundle, transpiled (for the browsers that do not support ES modules).
  // Also works in Node.
  {
    input: 'index.polyfilled.js',
    output: {
      format: 'umd',
      file: pkg.main.replace('.js', '.umd.js'),
      sourcemap: true,
      name: 'Vaadin',
      extend: true
    },
    plugins: [
      ...plugins,
      babel({
        presets: [['@babel/preset-env']]
      })
    ]
  }
];

export default config;
