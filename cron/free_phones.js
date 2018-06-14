'use strict';


const CONF = require('/p/pancake/settings/config.js');

const db = require('/p/pancake/my/db2.js');
const logger = require('/p/pancake/lib/logger.js');
const promise_api = require('/p/pancake/my/promise_api.js');


void async function () {
  try {
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
    var MINUTE_1 = 1000 * 60 * 1; // every 1 minute
    phones.forEach(phone => {
      console.log(new Date(phone.last_action), date, new Date(phone.last_action).getTime() < (date.getTime() - MINUTE_1));
      if (new Date(phone.last_action).getTime() < (date.getTime() - MINUTE_1)) {
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
  } catch (err) {
    logger.warn('CRON SCRIPT: '+err);
    global.process.exit(1);
  }

}();


function timeout(sec) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve();
    }, sec * 1000);
  });
}