module.exports = {
  session: {
    name: 'sessionId',
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
      client_secret: process.env.VK_CLIENT_SECRET,
      redirect_uri: 'https://local.debrsky.ru/auth/vk'
    },
    ya: {
      client_id: process.env.YA_CLIENT_ID,
      client_secret: process.env.YA_CLIENT_SECRET,
      redirect_uri: 'https://local.debrsky.ru/auth/ya'
    }
  },
  users: {
    dir: 'storage/users',
    lockfilename: 'LOCK'
  }
};
