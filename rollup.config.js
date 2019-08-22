import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

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
  }
];

export default config;
