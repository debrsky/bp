const express = require('express');
const router = express.Router();
const watch = require('../../lib/watch');

router.get('/', function (req, res, next) {
  res.set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();

  const frontChanged = () => {
    res.write(`data: front changed\n\n`);
  };
  watch.subscribe(frontChanged);

  res.on('close', () => {
    watch.unsubscribe(frontChanged);
  });
});

module.exports = router;
