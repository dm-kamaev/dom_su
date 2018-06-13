'use strict';


// node /p/pancake/only_one/update_events_user_uuid.js > ~/update_events_user_uuid.log 2>&1 &

const CONF = require('/p/pancake/settings/config.js');
const parse_cookie = require('set-cookie-parser');

const db = require('/p/pancake/my/db2.js');
const promise_api = require('/p/pancake/my/promise_api.js');


const NUMBER_ELS = 200000;

void async function () {

  const stream = new db.Stream_via_cursor('SELECT uuid, data, user_uuid FROM events_2017_2018');

  // await next(stream, await stream.get(NUMBER_ELS));

  let rows = await stream.get(NUMBER_ELS);
  await promise_api.while(function () {
    return rows || null;
  }, async function () {
    console.log('CALL');
    // if (!rows) {
    //   return;
    // }
    rows = filter_rows(rows);
    if (rows) {
      await timeout(20);
      await update_events_user_id(rows);
    } else {
      await timeout(3);
    }
    rows = await stream.get(NUMBER_ELS);
  });
  console.log('THE END SUCCESS');
  global.process.exit(0);
}();


function filter_rows(rows) {
  rows = rows.filter(function(row) {
    if (row.user_uuid) {
      return false;
    }
    const data = row.data;
    if (!data) {
      // console.log('STEP1');
      return false;
    }
    if (!data.headers) {
      // console.log('STEP2');
      return false;
    }
    if (!data.headers.cookie) {
      // console.log('STEP3');
      return false;
    }

    // const cookies = parse_cookie.parse(data.headers.cookie);
    const cookies = parse_cookie.parse(data.headers.cookie);
    if (!cookies.u_uuid && !cookies.session_uid_dom) {
      // console.log('STEP4');
      return false;
    }

    return true;
  });

  rows = rows.map(({ uuid, data }) => {
    const cookies = parse_cookie.parse(data.headers.cookie);
    return {
      uuid,
      user_uuid: cookies.u_uuid || cookies.session_uid_dom,
    };
  });
  if (rows.length) {
    console.log('filter_rows=', rows);
    console.log('filter_rows=', rows.length);
    // global.process.exit();
  }
  return (rows.length) ? rows : null;
}


function timeout(sec) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve();
    }, sec * 1000);
  });
}


async function update_events_user_id(rows) {
  await promise_api.queue(rows, async function ({ uuid, user_uuid }) {
    await db.edit(`UPDATE events_2017_2018 SET user_uuid = '${user_uuid}' WHERE uuid = '${uuid}'`);
    await timeout(0.1);
  });
}