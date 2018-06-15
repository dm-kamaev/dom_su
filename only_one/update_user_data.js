'use strict';

const db = require('/p/pancake/my/db.js');
const promise_api = require('/p/pancake/my/promise_api.js');

void async function () {
  const uuid = 'cb1ec442-1cb0-44fc-99b1-a294d26adc87';
  let user = await db.read_one(`
    SELECT uuid, data FROM users WHERE uuid='${uuid}'
  `);
  if (user instanceof Error) {
    throw user;
  }
  // user.data.google_id = '1015888472.1520088631';
  user.data.track.waiting = false;
  await db.edit(`UPDATE users SET data=$1 WHERE uuid='${uuid}'`, [ user.data ]);
  console.log(user);
  // await update_news();
}();

