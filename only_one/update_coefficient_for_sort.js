'use strict';

// NODE_PATH=$NODE_PATH:/p/pancake NODE_ENV=development node /p/pancake/only_one/update_coefficient_for_sort.js
const db = require('/p/pancake/my/db.js');
const promise_api = require('/p/pancake/my/promise_api.js');
const store = require('/p/pancake/reviews/store.js');


module.exports = async function () {
  let reviews = await db.read(`
    SELECT
      id,
      rating
    FROM
      reviews
  `);
  if (reviews instanceof Error) {
    throw reviews;
  }
  reviews = reviews.map(({ id, rating }) => {
    const coefficient_for_sort = store.get_coefficient_for_sort(rating);
    if (coefficient_for_sort instanceof Error) {
      throw coefficient_for_sort;
    }
    return { id, coefficient_for_sort };
  });

  return await promise_api.queue(reviews, async function ({ id, coefficient_for_sort }) {
    return db.edit(`
      UPDATE
        reviews
      SET
        coefficient_for_sort = ${coefficient_for_sort}
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
