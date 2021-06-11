const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  res.render('svelte', { title: 'SVELTE', page: 'svelte' });
});

module.exports = router;
