const merge = require('deepmerge');

let cfg = require('./global.js');
switch (process.env.NODE_ENV) {
  case 'development':
    cfg = merge(cfg, require('./development.js'));
    break;
  case 'production':
    cfg = merge(cfg, require('./production.js'));
    break;
}

module.exports = cfg;
