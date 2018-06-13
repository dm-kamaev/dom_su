'use strict';


// node /p/pancake/only_one/update_events_user_uuid.js > ~/update_events_user_uuid.log 2>&1 &

const CONF = require('/p/pancake/settings/config.js');

const db = require('/p/pancake/my/db2.js');
const promise_api = require('/p/pancake/my/promise_api.js');


void async function () {
  const phones = await db.read(`
    SELECT
      p.user_uuid,
      u.last_action
    FROM
      phones as p
    LEFT JOIN
      users as u
    ON
      p.user_uuid = u.uuid
    WHERE
      p.living=true
    AND
      p.active=true
  `);
  var date = new Date();
  console.log('phones.length = ', phones.length);
  var for_enables = [];

  // var MINUTE_3 = 180000;
  var MINUTE_3 = 20000;
  phones.forEach(phone => {
    console.log(new Date(phone.last_action), date, new Date(phone.last_action).getTime() < (date.getTime() - MINUTE_3));
    if (new Date(phone.last_action).getTime() < (date.getTime() - MINUTE_3)) {
      for_enables.push(phone);
    }
  });

  await promise_api.queue(for_enables, async function ({ user_uuid }) {
    await db.edit(`UPDATE phones SET living = false, "updatedAt" = NOW() WHERE user_uuid = '${user_uuid}'`);
    await timeout(0.1);
  });

  console.log('for_enables.length=', for_enables.length);
  console.log('THE END SUCCESS');
  global.process.exit(0);
}();


function timeout(sec) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve();
    }, sec * 1000);
  });
}