'use strict';

// move visits with status active=false to table visits_finish

const db = require('/p/pancake/my/db.js');
const promise_api = require('/p/pancake/my/promise_api.js');
const logger = require('/p/pancake/lib/logger.js');


void async function () {
  const visits = await read_visits();
  if (visits instanceof Error) {
    return logger.warn(visits);
  }
  const visits_finish = await read_visits_finish();
  if (visits_finish instanceof Error) {
    return logger.warn(visits_finish);
  }
  await update_visits_finish(visits, convert_to_hash(visits_finish, 'uuid'));

  console.log('THE END');
  global.process.exit();
}();


async function read_visits() {
  const query = `
    SELECT
      uuid,
      user_uuid,
      active,
      begin,
      "end",
      data,
      "createdAt",
      "updatedAt"
    FROM
      visits
    WHERE
      active = false
    LIMIT
      1000
  `;
  return await db.read(query);
}


async function read_visits_finish() {
  const query = `
    SELECT
      uuid,
      user_uuid,
      active,
      begin,
      "end",
      data,
      "createdAt",
      "updatedAt"
    FROM
      visits_finish
  `;
  return await db.read(query);
}


function convert_to_hash(arr, key) {
  var res = {};
  for (var i = 0, l = arr.length; i < l; i++) {
    var el = arr[i];
    res[el[key]] = el;
  }
  return res;
}


async function update_visits_finish(visits, hash_visits_finish) {
  await promise_api.queue(visits, async function(visit) {
    let query = '';
    if (hash_visits_finish[visit.uuid]) {
      query = `
        DELETE FROM
          visits
        WHERE
          uuid = '${visit.uuid}'
      `;
      console.log('repeat', visit);
      return await db.edit(query);
    }

    query = `
      DELETE FROM
        visits
      WHERE
        uuid = '${visit.uuid}'
    `;
    const delete_res = await db.edit(query);
    if (delete_res instanceof Error) {
      return logger.warn(delete_res);
    }
    console.log('delete_res=', delete_res);
    const insert_res = await db.edit(`
      INSERT INTO
        visits_finish
      (
        uuid,
        user_uuid,
        active,
        begin,
        "end",
        data,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )`, [
        visit.uuid,
        visit.user_uuid,
        visit.active,
        visit.begin,
        visit.end,
        visit.data,
        visit.createdAt,
        visit.updatedAt,
      ]
    );
    console.log('insert_res=', insert_res);
    if (insert_res instanceof Error) {
      return logger.warn(insert_res);
    }
  });
}