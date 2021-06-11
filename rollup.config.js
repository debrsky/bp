import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import svelte from 'rollup-plugin-svelte';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'front/index.js',
  output: {
    dir: 'public/build',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    name: 'svelte',
    sourcemap: true
  },
  plugins: [
    svelte(
      {
        // Emit CSS as "files" for other plugins to process. default is true
        // https://github.com/sveltejs/rollup-plugin-svelte/issues/89
        emitCss: false,
        compilerOptions: {
          // By default, the client-side compiler is used. You
          // can also use the server-side rendering compiler
          generate: 'dom',
          // ensure that extra attributes are added to head
          // elements for hydration (used with generate: 'ssr')
          hydratable: true,
          // You can optionally set 'customElement' to 'true' to compile
          // your components to custom elements (aka web elements)
          customElement: false
        }
      }

      //   onwarn: (warning, handler) => {
      //     // e.g. don't warn on <marquee> elements, cos they're cool
      //     if (warning.code === 'a11y-distracting-elements') return;

      //     // let Rollup handle all other warnings normally
      //     handler(warning);
      //   },
    ),
    resolve({
      browser: true,
      dedupe: ['svelte']
    }),
    commonjs(),
    production && terser()
  ]
};
