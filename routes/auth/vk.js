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

    let params, url, response, answer;

    const { client_id, redirect_uri, client_secret } = config.auth.vk; // eslint-disable-line camelcase

    params = { client_id, redirect_uri, client_secret, code };
    url = new URL('https://oauth.vk.com/access_token');
    url.search = new URLSearchParams(params).toString();
    response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }
    answer = await response.json();
    const { access_token, user_id, email } = answer; // eslint-disable-line camelcase

    params = {
      user_ids: user_id,
      fields: 'bdate,photo_200',
      access_token,
      v: 5.126
    };
    // https://vk.com/dev/users.get
    url = new URL('https://api.vk.com/method/users.get');
    url.search = new URLSearchParams(params).toString();
    response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }
    answer = await response.json();
    const { first_name, last_name, bdate, photo_200: photoUri } = answer.response[0];

    const user = {
      name: `${first_name} ${last_name}`,
      OAuth: {
        vk: {
          user_id,
          email,
          first_name,
          last_name,
          bdate,
          photoUri
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
