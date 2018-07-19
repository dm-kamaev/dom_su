'use strict';

// REMOVE USER WITHOUT GOOGLE_ID
// node /p/pancake/only_one/update_events_user_uuid.js > ~/update_events_user_uuid.log 2>&1 &

const CONF = require('/p/pancake/settings/config.js');

const db = require('/p/pancake/my/db2.js');
const time = require('/p/pancake/my/time.js');
const promise_api = require('/p/pancake/my/promise_api.js');

const LIMIT_DATE = 20180101;
const NUMBER_ELS = 200000;

void async function () {

  const stream = new db.Stream_via_cursor('SELECT uuid, data, last_client_id, "createdAt" FROM users');

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
    global.process.exit();
    // if (rows) {
    //   await timeout(20);
    //   await update_events_user_id(rows);
    // } else {
    //   await timeout(3);
    // }
    // rows = await stream.get(NUMBER_ELS);
  });
  console.log('THE END SUCCESS');
  global.process.exit(0);
}();

// [ data, user_uuid, last_client_id, createdAt ]
function filter_rows(users) {
  users = users.filter(function(user) {
    const YYYYMMDD = parseInt(time.get(user.createdAt).format('YYYYMMDD'), 10);
    if (YYYYMMDD > LIMIT_DATE) {
      return false;
    }

    if (user.data && user.google_id) {
      return false;
    }

    if (user.last_client_id) {
      return false;
    }

    return true;
  });

  const users_filter = [];
  await promise_api.queue(users, async function (user) {
    const exist_in_auth = await db.read_one(`SELECT * FROM auth_data WHERE uuid='${user.uuid}'`);
    if (!exist_in_auth) {
      users_filter.push(user);
    }
  });
  // users = users.map(({ uuid, data }) => {
  //   const cookies = parse_cookie.parse(data.headers.cookie);
  //   return {
  //     uuid,
  //     user_uuid: cookies.u_uuid || cookies.session_uid_dom,
  //   };
  // });
  // if (users.length) {
  //   console.log('filter_rows=', users);
  //   console.log('filter_rows=', users.length);
  //   // global.process.exit();
  // }
  return (users.length) ? users : null;
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