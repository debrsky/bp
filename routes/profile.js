const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  res.render('profile', { title: 'Express', page: 'profile' });
});

module.exports = router;
