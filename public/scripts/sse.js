/* eslint-env browser */
const source = new EventSource('/sse');

source.addEventListener('message', (message) => {
  console.log('sse message:', message); //
  if (message.data === 'front changed') {
    window.location.reload();
  }
});
