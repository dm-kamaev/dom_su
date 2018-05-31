'use strict';

const CONF = require('/p/pancake/settings/config.js');
const parse_cookie = require('cookie');

const db = require('/p/pancake/my/db2.js');
const promise_api = require('/p/pancake/my/promise_api.js');






void async function () {

  const stream = new db.Stream_via_cursor('SELECT uuid, data FROM events_2017_2018');

  await next(stream, await stream.get(100));

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
    await mark_event_user_bots(rows);
    await timeout();
  }
  rows = null;
  // if (i > 10) {
  //   global.process.exit();
  // }
  return next(stream, await stream.get(100));
}



function filter_rows(rows) {
  rows = rows.filter(function(row) {
    if (!row.data) {
      return false;
    }
    if (!row.data.headers) {
      return false;
    }
    if (!row.data.headers.cookie) {
      return false;
    }

    const user_agent = row.data.headers['user-agent'];
    if (!user_agent) {
      return false;
    }

    if (/bot/ig.test(user_agent) || /1C/ig.test(user_agent) || /Go|Python|Perl|php|Java/ig.test(user_agent)) {
      return true;
    }

    return false;
  });

  rows = rows.map(({ uuid, data }) => {
    const cookies = parse_cookie.parse(data.headers.cookie);
    const user_agent = data.headers['user-agent'];
    return {
      uuid,
      user_uuid: cookies.u_uuid || cookies.session_uid_dom,
      user_agent,
    }
  });
  if (rows.length) {
    console.log(rows);
    // global.process.exit();
  }
  return (rows.length) ? rows : null;
}


function timeout() {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve();
    }, 40000);
  });
}


async function mark_event_user_bots(rows) {
  await promise_api.queue(rows, async function ({ uuid, user_uuid }) {
    await db.edit(`UPDATE users SET its_robot = true WHERE uuid = '${user_uuid}'`);
    await db.edit(`UPDATE events_2017_2018 SET its_robot = true WHERE uuid = '${uuid}'`);
  });
}