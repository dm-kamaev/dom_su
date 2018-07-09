'use strict';

// CALC REVIEW RATING COUNT AND CALC AVERAGE RATING

const CONF = require('/p/pancake/settings/config.js');

const db = require('/p/pancake/my/db2.js');
const logger = require('/p/pancake/lib/logger.js');
const promise_api = require('/p/pancake/my/promise_api.js');


void async function () {
  try {
    let reviews = await db.read(`SELECT rating FROM reviews`);
    let total_sum_rating = 0;
    reviews.forEach(({ rating }) => total_sum_rating += parseInt(rating, 10));

    let review_count = await db.read_one(`SELECT COUNT(*) as count FROM reviews`);
    review_count = parseInt(review_count.count, 10);

    const average_rating = (total_sum_rating / review_count).toFixed(1);
    console.log('average_rating=', average_rating);
    // const query = `
    //   INSERT INTO
    //     reviews_average_rating (reviews_average_rating_id, average_rating, timestamp)
    //   VALUES
    //     (DEFAULT, $1, $2)
    //   ON CONFLICT (average_rating) DO UPDATE SET
    //     average_rating = $1,
    //     timestamp = $2;
    // `;
    // await db.edit(query, [ average_rating, new Date() ]);
    const reviews_average_rating = await db.read_one(`SELECT reviews_average_rating_id FROM reviews_average_rating`);
    if (reviews_average_rating) {
      await db.edit('UPDATE reviews_average_rating SET average_rating = $1, timestamp = $2 WHERE reviews_average_rating_id = $3 ', [ average_rating, new Date(), reviews_average_rating.reviews_average_rating_id]);
    } else {
      await db.edit('INSERT INTO reviews_average_rating (reviews_average_rating_id, average_rating, timestamp)  VALUES (DEFAULT, $1, $2)', [ average_rating, new Date() ]);
    }

    let reviews_group_by_rating = await db.read(`SELECT rating, COUNT(rating) as count FROM reviews GROUP BY rating`);
    const review_with_percent = reviews_group_by_rating.filter(review => {
      return review.rating !== 0;
    }).map(review => {

      let count = parseInt(review.count, 10);
      review.percent = ((count / review_count) * 100).toFixed(0);
      return review;
    });

    await promise_api.queue(review_with_percent, async function ({ rating, percent }) {
      const d = new Date();
      const reviews_rating_count = await db.read_one(`SELECT rating FROM reviews_count WHERE rating = `+rating);
      if (reviews_rating_count) {
        await db.edit('UPDATE reviews_count SET percent = $1, timestamp = $2 WHERE rating = $3 ', [ parseInt(percent, 10), new Date(), reviews_rating_count.rating ]);
      } else {
        await db.edit('INSERT INTO reviews_count (reviews_count_id, rating, percent, timestamp) VALUES (DEFAULT, $1, $2, $3)', [ parseInt(rating, 10), parseInt(percent, 10), new Date() ]);
      }
      // const query = `
      //   INSERT INTO
      //     reviews_count (reviews_count_id, rating, percent, timestamp)
      //   VALUES
      //     (DEFAULT, $1, $2, $3)
      //   ON CONFLICT (rating) DO UPDATE SET
      //     percent = $2,
      //     timestamp = $3;
      // `;
      // await db.edit(query, [ parseInt(rating, 10), parseInt(percent, 10), new Date() ]);
    });

    console.log('review_with_percent=', review_with_percent);
    global.process.exit();
  } catch (err) {
    logger.warn('script for update review rating count and average count '+err);
    global.process.exit(1);
  }
}();
