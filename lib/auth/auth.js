const users = require('../users');
const config = require('../../config');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const VKontakteStrategy = require('passport-vkontakte').Strategy;
const YandexStrategy = require('passport-yandex').Strategy;
const MailruStrategy = require('passport-mail').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  'local',
  new LocalStrategy(function (login, password, done) {
    let user = { name: login, login, password };

    (async () => {
      user = await users.findUser(user);
      if (!user || (await users.calcKey(password, user.salt)) !== user.key) {
        return done(null, false, { message: 'username not found' });
      }
      return done(null, user);
    })().catch((err) => done(err));
  })
);

passport.serializeUser(function (user, done) {
  // console.log('СЕРИАЛИЗАЦИЯ пользователя', user);
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  // console.log('ДЕСЕРИАЛИЗАЦИЯ пользователя', id);
  (async () => {
    const user = await users.findUser({ id });
    // if (user === null) return done(null, { id: 0, name: 'user not found' });
    // console.log('Нашел пользователя', user);
    done(null, user);
  })().catch((err) => done(err));
});

function OAuthStrategyCallbackFactory(provider) {
  return async function (req, accessToken, refreshToken, profile, done) {
    try {
      const sanitizedProfile = {};
      Object.keys(profile).forEach((key) => {
        if (key.substr(0, 1) !== '_') sanitizedProfile[key] = profile[key];
      });

      const newUser = {
        name: profile.displayName,
        OAuth: {}
      };

      newUser.OAuth[provider] = sanitizedProfile;

      if (req.user) newUser.id = req.user.id;

      const user = await users.upsertUser(newUser);

      done(null, user);
    } catch (err) {
      done(err);
    }
  };
}

// *** VKontakteStrategy ***
passport.use(
  'vk',
  new VKontakteStrategy(
    {
      clientID: config.auth.vk.client_id,
      clientSecret: config.auth.vk.client_secret,
      callbackURL: `${config.app.origin}/auth/vk/callback`,
      scope: ['email', 'photos'],
      profileFields: ['photo_max_orig'],

      passReqToCallback: true
    },
    async function (req, accessToken, refreshToken, params, profile, done) {
      const OAuthStrategyCallback = OAuthStrategyCallbackFactory('vk');
      OAuthStrategyCallback(req, accessToken, refreshToken, profile, done);
    }
  )
);

// *** YandexStrategy ***
passport.use(
  'ya',
  new YandexStrategy(
    {
      clientID: config.auth.ya.client_id,
      clientSecret: config.auth.ya.client_secret,
      callbackURL: `${config.app.origin}/auth/ya/callback`,
      // не реализовано в стратегии
      // scope: ['login:birthday', 'login:email', 'login:info', 'login:avatar'],

      passReqToCallback: true
    },
    OAuthStrategyCallbackFactory('ya')
  )
);

// *** MailruStrategy ***
passport.use(
  'mailru',
  new MailruStrategy(
    {
      clientID: config.auth.mailru.client_id,
      clientSecret: config.auth.mailru.client_secret,
      callbackURL: `${config.app.origin}/auth/mailru/callback`,

      passReqToCallback: true
    },
    OAuthStrategyCallbackFactory('mailru')
  )
);

// *** GoogleStrategy ***
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: config.auth.google.client_id,
      clientSecret: config.auth.google.client_secret,
      callbackURL: `${config.app.origin}/auth/google/callback`,
      scope: ['email', 'profile'],

      passReqToCallback: true
    },
    OAuthStrategyCallbackFactory('google')
  )
);

module.exports = { passport };
