import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const plugins = [resolve(), commonjs()];

const config = [
  {
    input: 'src/lib/vis-network.js',
    output: {
      format: 'es',
      file: 'src/lib/vis-network.module.js',
      sourcemap: true
    },
    plugins
  }
];

export default config;
