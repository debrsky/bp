const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const usersDir = 'storage/users';

fs.writeFileSync(path.resolve(usersDir, 'auth.txt'), 'utf8');

function getFilepath (username) {
  return path.resolve(usersDir, `${username}.json`);
}

async function createUser (username, password) {
  // 1. Проверка safe filename
  if (!/^[a-z0-9]{3,15}$/.test(username)) throw Error('Неправильный логин');

  const filepath = getFilepath(username);

  // 2. Проверка существования имени
  try {
    await fs.promises.stat(filepath);
    throw Error('Такой логин уже существует');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  // 3. Создаем файл для логина
  const salt = await new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) return reject(err);
      resolve(buf.toString('base64'));
    });
  });
  const key = await calcKey(password, salt);
  const user = { name: username, salt, key };
  await fs.promises.writeFile(filepath, JSON.stringify(user));

  return user;
}

async function findUser (username) {
  const filepath = getFilepath(username);
  let userStr;
  try {
    userStr = await fs.promises.readFile(filepath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }

  return JSON.parse(userStr);
}

async function checkPassword (checkUser, password) {
  const user = await findUser(checkUser.name);
  if (!user) return false;

  const key1 = user.key;
  const key2 = await calcKey(password, user.salt);

  return key1 === key2;
}

async function calcKey (password, salt) {
  const iterations = 100000;
  const keyLen = 20;
  const digest = 'sha512';

  return await new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keyLen, digest, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString('base64'));
    });
  });
}

exports.createUser = createUser;
exports.findUser = findUser;
exports.checkPassword = checkPassword;
