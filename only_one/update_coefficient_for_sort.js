'use strict';

// node /p/pancake/only_one/update_coefficient_for_sort.js
const db = require('/p/pancake/my/db2.js');
const time = require('/p/pancake/my/time.js');
const coefficient_for_sort = require('/p/pancake/reviews/coefficient_for_sort.js');
const promise_api = require('/p/pancake/my/promise_api.js');


module.exports = async function () {
  let reviews = await db.read(`
    SELECT
      id,
      date,
      rating
    FROM
      reviews
  `);
  reviews = reviews.map(({ id, date, rating }) => {
    return {
      id,
      ogifinal_date: time.get(date).format('YYYYMMDD'),
      rating,
      coefficient_for_sort: coefficient_for_sort.get(date, rating).format('YYYYMMDD')
    };
  });
  // console.log(reviews);
  return await promise_api.queue(reviews, async function ({ id, coefficient_for_sort }) {
    return db.edit(`
      UPDATE
        reviews
      SET
        coefficient_for_sort = ${parseInt(coefficient_for_sort, 10)}
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
