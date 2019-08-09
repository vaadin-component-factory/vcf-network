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
  commonjs(),

  babel({
    // The 'external-helpers' Babel plugin allows Rollup to include every
    // used babel helper just once per bundle, rather than including them in
    // every module that uses them (which is the default behaviour).
    plugins: ['external-helpers'],
    exclude: 'node_modules/**',
    presets: [
      [
        'env',
        {
          // Instructs Babel to not convert ES modules to CommonJS--that's a
          // job for Rollup.
          modules: false
        }
      ],
      'stage-0'
    ]
  })
];

const config = [
  // ES module bundle, not transpiled (for the browsers that support ES modules)
  // ---
  // This is a tradeoff between ease of use (always easier) and size-efficiency
  // (in some cases less efficient).
  //
  // The 'vis-network' dependency is not compatible with the ES module
  // imports and needs to be converted into an ES module for the vcf-network
  // module to be usable 'as is'. Bundling the vis-network dependency in at
  // this point removes the need to do it later, so the vcf-network module
  // can be imported 'as is'.
  //
  // The size inefficiency appears if the app that uses vcf-network also has
  // a direct (or transitive) dependency to 'vis-network'. In that case,
  // there will be two copies of the vis-network code in the final bundle.
  // That does not lead to any naming conflicts, but that code is duplicated.
  {
    input: 'theme/lumo/vcf-network.js',
    output: {
      format: 'es',
      file: pkg.main,
      sourcemap: true
    },
    plugins
  }
];

export default config;
