'use strict';

const ab_tests = require('/p/pancake/statpages/ab_tests.js');
const db = require('/p/pancake/my/db2.js');
const logger = require('/p/pancake/lib/logger.js');
const promise_api = require('/p/pancake/my/promise_api.js');

module.exports = class AB_test_api {

  constructor() {

  }


  async sync_with_db() {
    const ABTestContainer = ab_tests.ABTestContainer;
    const hash_test_in_file = {};
    Object.keys(ABTestContainer).forEach(city_name => {
      const ab_test_city = ABTestContainer[city_name];
      Object.keys(ab_test_city).forEach(key_page => {
        const page = ab_test_city[key_page];
        hash_test_in_file[page.key] = page;
      });
    });

    const ab_tests_from_db = await db.read('SELECT key FROM ab_test');
    const hash_ab_tests_in_db = {};
    ab_tests_from_db.forEach(test => {
      hash_ab_tests_in_db[test.key] = true;
    });

    await promise_api.queue(Object.keys(hash_test_in_file), async function (key) {
      if (hash_ab_tests_in_db[key]) {
        return;
      }
      const { name, forNewUser, variations } = hash_test_in_file[key];
      await db.edit(`
        INSERT INTO ab_test (ab_test_id, name, key, for_new_user, variations, timestamp) VALUES (DEFAULT, $1, $2, $3, $4, $5)
      `, [ name, key, forNewUser, JSON.stringify(variations), new Date() ]);
    });

    this._hash_test = {};
    const data_ab_tests = await db.read('SELECT name, key, for_new_user as "forNewUser", variations FROM ab_test');
    data_ab_tests.forEach(test => {
      test.variations = JSON.parse(test.variations);
      this._hash_test[test.key] = test;
    });
  }

  /**
   * choice: select page
   * @param  {String} data_a_b_test:
   * {
      name: 'main_2018040301123421',
      key: 'main_14',
      forNewUser: true,
      name: 'main_2018040301123421',
      variations: [{
        name: 'control',
        page: 'main',
        ratio: 50,
        description: '',
        visited: 0
      }, {
        name: 'variation',
        page: 'main_ab',
        ratio: 50,
        description: '',
        visited: 0
      }]
    }
   * @return {Object}
   * {
        name: 'control',
        page: 'main',
        ratio: 50,
        description: '',
        visited: 0
      }
   */
  async choice(data_ab_test) {
    // console.dir(this._hash_test, { depth: 20, colors: true }); global.process.exit();
    const variations = this._hash_test[data_ab_test.key].variations;
    // console.log(variations);

    let total_visited = 0;
    variations.forEach(variant => total_visited += variant.visited);

    let res;
    const calc_percent = Calc_percent(total_visited);
    for (var i = 0, l = variations.length; i < l; i++) {
      const variation = variations[i];
      const percent = calc_percent(variation.visited);
      if (percent < variation.ratio) {
        variation.visited++;
        res = variation;
        break;
      }
    }

    if (!res) {
      const variation = variations[Math.floor(Math.random() * variations.length)];
      variation.visited++;
      res = variation;
    }
    this._update_data_ab_test(data_ab_test.key, variations).catch(err => logger.warn(err));
    return res;
  }

  async _update_data_ab_test(key, variations) {
    await db.edit('BEGIN');
    const query = `
      BEGIN;
      UPDATE
        ab_test
      SET
        variations = '${JSON.stringify(variations)}',
        timestamp = CURRENT_TIMESTAMP
      WHERE
        key = '${key}';
    `;
    await db.edit(query);
    await db.edit('COMMIT');
  }

};

/**
 * Calc_percent:
 * @param {Number} total:
 */
function Calc_percent(total) {
  /**
   * @param  {Number} val:
   * @return {NUmber}
   */
  return function (val) {
    const percent = ((val / total) * 100).toFixed(0);
    return parseInt(percent, 10);
  };
}


void async function () {
  const ab_test_api = new module.exports();
  await ab_test_api.sync_with_db();
  const data_ab_test = ab_tests.ABTestContainer['moscow']['main'];

  // for (var i = 0; i < 240; i++) {
  const iteraions = [];
  for (var i = 0; i < 100; i++) { iteraions[i] = i; }
  await promise_api.queue(iteraions, async function () {
    return await ab_test_api.choice(data_ab_test);
  });
  setTimeout(function() {
    console.log('wait');
    Object.keys(ab_test_api._hash_test).forEach(key => {
      const variations = ab_test_api._hash_test[key].variations.map(({ name, ratio, visited }) => {
        return { name, ratio, visited };
      });
      console.log(key);
      console.dir(variations, { depth: 20, colors: true });
    });
  }, 50000);

}();
