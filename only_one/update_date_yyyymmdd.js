'use strict';

// node /p/pancake/only_one/update_coefficient_for_sort.js
const db = require('/p/pancake/my/db2.js');
const time = require('/p/pancake/my/time.js');
const promise_api = require('/p/pancake/my/promise_api.js');


module.exports = async function () {
  let reviews = await db.read(`
    SELECT
      id,
      date
    FROM
      reviews
  `);
  reviews = reviews.map(({ id, date }) => {
    return { id, date_yyyymmdd: time.format('YYYYMMDD', time.get(date)) };
  });

  return await promise_api.queue(reviews, async function ({ id, date_yyyymmdd }) {
    return db.edit(`
      UPDATE
        reviews
      SET
        date_yyyymmdd = ${date_yyyymmdd}
      WHERE
        id = ${id}
    `);
  });
};


void async function () {
  if (!module.parent) {
    try {
      await module.exports();
      global.process.exit(0);
    } catch (err) {
      global.process.exit(1);
    }
  }
}();
