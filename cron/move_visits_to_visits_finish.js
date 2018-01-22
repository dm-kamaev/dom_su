'use strict';

// move visits with status active=false to table visits_finish

const db = require('/p/pancake/my/db.js');
const promise_api = require('/p/pancake/my/promise_api.js');
const logger = require('/p/pancake/lib/logger.js');


void async function () {
  const visits = await read_visits();
  if (visits instanceof Error) {
    logger.warn(visits);
    return global.process.exit(1);
  }
  await update_visits_finish(visits);

  console.log('THE END');
  global.process.exit(0);
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


async function update_visits_finish(visits) {
  await promise_api.queue(visits, async function(visit) {
    const delete_res = await db.edit(`
      DELETE FROM
        visits
      WHERE
        uuid = '${visit.uuid}'
    `);
    if (delete_res instanceof Error) {
      return logger.warn(delete_res);
    }
    console.log('delete_res=', delete_res);
    const insert_res = await db.edit(`
      INSERT INTO
        visits_finish_2017
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