/* eslint-disable camelcase */

const express = require('express');
const router = express.Router();

const fetch = require('node-fetch');
const { URL, URLSearchParams } = require('url');

const config = require('../../config');
const users = require('../../lib/users');

router.get('/', async function (req, res, next) {
  try {
    const { code } = req.query;
    if (!code) return res.redirect('/auth');

    let url, response, answer;

    const { client_id, client_secret } = config.auth.ya; // eslint-disable-line camelcase

    url = new URL('https://oauth.yandex.ru/token');
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString('base64')}`
      },
      body: new URLSearchParams({ grant_type: 'authorization_code', code }).toString()
    });
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }
    answer = await response.json();

    const { access_token } = answer; // eslint-disable-line camelcase

    url = new URL('https://login.yandex.ru/info');
    response = await fetch(url, {
      headers: {
        Authorization: `OAuth ${access_token}`
      }
    });
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }
    answer = await response.json();
    const { id, first_name, last_name, default_email, birthday, default_avatar_id } = answer;

    const user = {
      name: `${first_name} ${last_name}`,
      OAuth: {
        ya: {
          id, first_name, last_name, default_email, birthday, default_avatar_id
        }
      }
    };

    const finalUser = await users.upsertUser(user);

    req.session.userId = finalUser.id;

    return res.redirect('/auth');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
