const express = require('express');
const router = express.Router();
const auth = require('../lib/auth');

router.get('/', async function (req, res, next) {
  try {
    if (req.session.username) {
      res.locals.user = await auth.findUser(req.session.username);
    }

    res.render('auth', { title: 'Express' });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async function (req, res, next) {
  try {
    const { username, password, reg, logout } = req.body;

    if (req.session.username && logout) {
      req.session.destroy();
      return res.redirect(req.baseUrl);
    }

    let user = null;

    if (reg) {
      user = await auth.createUser(username, password);
      return res.redirect(req.baseUrl);
    }

    user = await auth.findUser(username);
    if (user && await auth.checkPassword(user, password)) {
      req.session.username = user.name;
      return res.redirect(req.baseUrl);
    }

    res.sendStatus(401);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
