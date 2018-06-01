'use strict';

const CONF = require('/p/pancake/settings/config.js');
const parse_cookie = require('cookie');

const db = require('/p/pancake/my/db2.js');
const promise_api = require('/p/pancake/my/promise_api.js');




const NUMBER_ELS = 100000;

void async function () {

  const stream = new db.Stream_via_cursor('SELECT uuid, data, user_uuid, its_robot FROM events_2017_2018');

  // await next(stream, await stream.get(NUMBER_ELS));
  var number_iteration = new Array(Math.ceil(55277294 / NUMBER_ELS));
  await promise_api.queue(number_iteration, async function () {
    let rows = await stream.get(NUMBER_ELS);
    // i++;
    console.log('CALL');
    if (!rows) {
      return;
    }
    // await update_events_user_id(rows);
    rows = filter_rows(rows);
    if (rows) {
      await timeout(40);
      await mark_event_user_bots(rows);
    } else {
      await timeout(5);
    }
    rows = null;
    // if (i > 10) {
    //   global.process.exit();
    // }
  })

  console.log('THE END SUCCESS');
}();

// let i = 1;
// async function next(stream, rows) {

// }



function filter_rows(rows) {
  rows = rows.filter(function(row) {
    if (row.its_robot) {
      return false;
    }
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
    };
  });
  if (rows.length) {
    // console.log(rows);
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


async function mark_event_user_bots(rows) {
  await promise_api.queue(rows, async function ({ uuid, user_uuid }) {
    await db.edit(`UPDATE users SET its_robot = true WHERE uuid = '${user_uuid}'`);
    await db.edit(`UPDATE events_2017_2018 SET its_robot = true WHERE uuid = '${uuid}'`);
  });
}


function filter_rows_for_user_uuid(rows) {
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
    console.log('filter_rows_for_user_uuid=', rows);
    // global.process.exit();
  }
  return (rows.length) ? rows : null;
}


async function update_events_user_id(rows) {
  let local_rows = filter_rows_for_user_uuid(rows);
  if (local_rows) {
    await promise_api.queue(local_rows, async function ({ uuid, user_uuid }) {
      await db.edit(`UPDATE events_2017_2018 SET user_uuid = '${user_uuid}' WHERE uuid = '${uuid}'`);
      await timeout(40);
      return;
    });
  }
}