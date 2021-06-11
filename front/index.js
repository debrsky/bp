/* eslint-env browser */

import App from './svelte/index.svelte';

const app = new App({
  target: document.getElementById('svelte')
});

export default app;
