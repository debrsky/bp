module.exports = {
  app: {
    origin: null
  },
  session: {
    name: 'sId',
    secret: process.env.SESSION_SECRET
  },
  auth: {
    pbkdf2: {
      iterations: 100000,
      keyLen: 20,
      digest: 'sha512'
    },
    vk: {
      client_id: process.env.VK_CLIENT_ID,
      client_secret: process.env.VK_CLIENT_SECRET
    },
    ya: {
      client_id: process.env.YA_CLIENT_ID,
      client_secret: process.env.YA_CLIENT_SECRET
    },
    mailru: {
      client_id: process.env.MAILRU_CLIENT_ID,
      client_secret: process.env.MAILRU_CLIENT_SECRET
    },
    google: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  users: {
    dir: 'storage/users',
    lockfilename: 'LOCK'
  }
};
