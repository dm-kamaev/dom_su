'use strict';

const CONF = require('/p/pancake/settings/config.js');
const parse_cookie = require('cookie');

const db = require('/p/pancake/my/db2.js');
const promise_api = require('/p/pancake/my/promise_api.js');




const NUMBER_ELS = 100000;

void async function () {

  const stream = new db.Stream_via_cursor('SELECT uuid, data, user_uuid FROM events_2017_2018');

  await next(stream, await stream.get(NUMBER_ELS));

  console.log('THE END SUCCESS');
}();

// let i = 1;
async function next(stream, rows) {
  // i++;
  console.log('CALL');
  if (!rows) {
    return;
  }
  rows = filter_rows(rows);
  if (rows) {
    await timeout(33);
    await update_events_user_id(rows);
  } else {
    await timeout(10);
  }
  rows = null;
  // if (i > 10) {
  //   global.process.exit();
  // }
  return next(stream, await stream.get(NUMBER_ELS));
}



function filter_rows(rows) {
  rows = rows.filter(function(row) {
    if (row.user_uuid) {
      return false;
    }
    const data = row.data;
    if (!data) {
      return false;
    }
    if (!data.headers) {
      return false;
    }
    if (!data.headers.cookie) {
      return false;
    }

    const cookies = parse_cookie.parse(data.headers.cookie);
    if (!(cookies.u_uuid || cookies.session_uid_dom)) {
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
    await timeout(2);
  });
}