'use strict';

const db = require('/p/pancake/my/db.js');
const promise_api = require('/p/pancake/my/promise_api.js');

void async function () {
  let user = await db.read_one(`
    SELECT uuid, data FROM users WHERE uuid='1e638da7-75b5-4ce0-a81f-f9b6127279b9'
  `);
  if (user instanceof Error) {
    throw user;
  }
  user.data.google_id = '1015888472.1520088631';
  await db.edit(`UPDATE users SET data=$1 WHERE uuid='1e638da7-75b5-4ce0-a81f-f9b6127279b9'`, [ user.data ]);
  console.log(user);
}();


