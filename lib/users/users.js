const fs = require('fs');
const path = require('path');

const { v4: uuid } = require('uuid');
const sanitize = require('sanitize-filename');

const config = require('../../config');
const merge = require('deepmerge');

const usersDir = path.resolve(config.users.dir);
fs.mkdirSync(usersDir, { recursive: true });
// const lockfile = path.resolve(usersDir, config.users.lockfilename);

async function upsertUser (user) {
  const foundUser = await findUser(user);

  let newUser = user;
  if (foundUser) {
    newUser = merge(foundUser, user);
  }

  if (!newUser.id) {
    newUser.id = uuid();
  }

  if (sanitize(newUser.id) !== newUser.id) throw Error(`Not safe user.id: ${newUser.id}`);

  const filename = path.resolve(usersDir, `${newUser.id}.json`);
  await fs.promises.writeFile(filename, JSON.stringify(newUser), 'utf8');

  return newUser;
}

async function findUser (user) {
  let foundUser = null;

  // если есть user.id, то ищем по id
  if (user.id) {
    try {
      const filename = path.resolve(usersDir, `${user.id}.json`);
      foundUser = JSON.parse(await fs.promises.readFile(filename, 'utf8'));
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
    return foundUser;
  }

  const users = await loadUsers();
  // console.log(users);

  // если есть vk
  const vk = user.OAuth?.vk;
  if (vk) {
    foundUser = users.find(checkUser => {
      return user.OAuth.vk.user_id === checkUser.OAuth?.vk.user_id;
    });

    if (foundUser) return foundUser;
  }

  return null;
}

// возвращает массив пользователей из файлов, ошибки пропускаются
async function loadUsers () {
  return (await Promise.allSettled(
    (await fs.promises.readdir(usersDir))
      .filter(filename => /\.json$/.test(filename))
      .map(async (filename, idx) => {
        let user = null;
        user = JSON.parse(await fs.promises.readFile(path.resolve(usersDir, filename), 'utf8'));
        return user;
      })
  )).filter(res => res.status === 'fulfilled')
    .map(res => res.value);
}

module.exports = {
  upsertUser,
  findUser
};
