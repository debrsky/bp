module.exports = {
  session: {
    name: 'sessionId',
    secret: process.env.SESSION_SECRET
  },
  auth: {
    vk: {
      client_id: 7741903,
      client_secret: process.env.VK_CLIENT_SECRET,
      redirect_uri: 'https://local.debrsky.ru/auth/vk'
    }
  }
};
