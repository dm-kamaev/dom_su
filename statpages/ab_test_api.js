'use strict';

// Api for work  with A/B test

const ab_tests = require('/p/pancake/statpages/ab_tests.js');
const db = require('/p/pancake/my/db2.js');
const logger = require('/p/pancake/lib/logger.js');
const promise_api = require('/p/pancake/my/promise_api.js');

class AB_test_api {

  constructor() {
    /**
    {
      'moscow::::main_14_20180712_17:04:20': [{
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
     * @type {Object}
     */
    this._hash_update = {};
    this._interval = 1000; // 1 sec
  }

  async _start_queue() {
    const self = this;
    setInterval(async function () {
      /**
       * [ 'moscow::::main_14_20180712_17:04:20' ]
       * @type {String[]}
       */
      var keys = Object.keys(self._hash_update);
      if (!keys.length) {
        return;
      }
      const list = keys.map(key => {
        return {
          key,
          variations: self._hash_update[key]
        }
      });
      self._hash_update = {};
      await promise_api.queue(list, async function ({ key, variations }) {
        await self._update_data_ab_test(key, variations);
      });
    }, self._interval);
  }


  async sync_with_db() {
    const self = this;
    self._start_queue();

    const ABTestContainer = ab_tests.ABTestContainer;
    /**
     * {
      'moscow::::main_14_20180712_17:04:20': {
        name: '',
        key: 'main_14_20180712_17:04:20',
        forNewUser: true,
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
    }
     * @type {Object}
     */
    const hash_test_in_file = {};
    Object.keys(ABTestContainer).forEach(city_name => {
      const ab_test_city = ABTestContainer[city_name];
      Object.keys(ab_test_city).forEach(key_page => {
        const page = ab_test_city[key_page];
        hash_test_in_file[self._build_key(city_name, page.key)] = page;
      });
    });

    const ab_tests_from_db = await db.read('SELECT key FROM ab_test');
    /**
     * { 'moscow::::main_14_20180712_17:04:20': true }
     * @type {Object}
     */
    const hash_ab_tests_in_db = {};
    ab_tests_from_db.forEach(test => {
      hash_ab_tests_in_db[test.key] = true;
    });

    // remove old a/b test from db
    await promise_api.queue(Object.keys(hash_ab_tests_in_db), async function (key) {
      if (hash_ab_tests_in_db[key] && !hash_test_in_file[key]) {
        await db.edit(`DELETE FROM ab_test WHERE key = $1`, [ key ]);
      }
    });

    await promise_api.queue(Object.keys(hash_test_in_file), async function (key) {
      if (hash_ab_tests_in_db[key]) {
        return;
      }

      const { name, forNewUser, variations } = hash_test_in_file[key];
      await db.edit(`
        INSERT INTO ab_test (ab_test_id, name, key, for_new_user, variations, timestamp) VALUES (DEFAULT, $1, $2, $3, $4, $5)`,
        [ name, key, forNewUser, JSON.stringify(variations), new Date() ]
      );
    });

    /**
     * {
      'moscow::::main_14_20180712_17:04:20': {
        name: '',
        key: 'main_14_20180712_17:04:20',
        forNewUser: true,
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
    }
     * @type {Object}
     */
    self._hash_test = {};
    const data_ab_tests = await db.read('SELECT name, key, for_new_user as "forNewUser", variations FROM ab_test');
    data_ab_tests.forEach(test => {
      test.variations = JSON.parse(test.variations);
      self._hash_test[test.key] = test;
    });
  }

  /**
   * choice: select page
   * @param  {String} city_name: moscow
   * @param  {Object} data_a_b_test:
   * {
      name: '',
      key: 'main_14_20180712_17:04:20'',
      forNewUser: true,
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
  choice(city_name, data_ab_test) {
    // console.dir(this._hash_test, { depth: 20, colors: true }); global.process.exit();
    /**
     *  'moscow::::main_14_20180712_17:04:20'
     * @type {String}
     */
    const key = this._build_key(city_name, data_ab_test.key);
    const variations = this._hash_test[key].variations;
    // console.log(variations);

    let total_visited = 0;
    variations.forEach(variant => total_visited += variant.visited || 0);

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
    this._add_to_queue(key, variations);
    return res;
  }

  /**
   * _add_to_queue:
   * @param {String} key:  'moscow::::main_14_20180712_17:04:20'
   * @param {Object]} variations:
    [{
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
   */
  _add_to_queue(key, variations) {
    this._hash_update[key] = variations;
  }

  /**
   * _update_data_ab_test:
   * @param {String} key:  'moscow::::main_14_20180712_17:04:20'
   * @param {Object]} variations:
   [{
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
   */
  async _update_data_ab_test(key, variations) {
    const query = `
      UPDATE
        ab_test
      SET
        variations = $1,
        timestamp = $2
      WHERE
        key = $3
    `;
    await db.edit(query, [ JSON.stringify(variations), new Date(), key ]);
  }

  /**
   * _build_key:
   * @param  {String} city_name: moscow
   * @param  {String} ab_test_key: main_14_20180712_17:04:20
   * @return {String}    moscow::::main_14_20180712_17:04:20
   */
  _build_key(city_name, ab_test_key) {
    return city_name +'::::' +ab_test_key;
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

module.exports = new AB_test_api();

// |
// |
// V
// TEST
// void async function () {
//   const ab_test_api = module.exports;
//   await ab_test_api.sync_with_db();

//   const city_name = 'moscow';
//   const page_name = 'main';
//   const data_ab_test = ab_tests.ABTestContainer[city_name][page_name];

//   // for (var i = 0; i < 240; i++) {
//   for (var i = 0; i < 243; i++) {
//     ab_test_api.choice('moscow', data_ab_test);
//   }

//   setTimeout(function() {
//     Object.keys(ab_test_api._hash_test).forEach(key => {
//       let total_visit = 0;
//       ab_test_api._hash_test[key].variations.forEach(variation => total_visit += variation.visited);

//       const variations = ab_test_api._hash_test[key].variations.map(({ name, ratio, visited }) => {
//         return { name, ratio, visited, percent: (visited / total_visit * 100).toFixed(0) };
//       });
//       console.log(key);
//       console.dir(variations, { depth: 20, colors: true });
//     });
//   }, 3000);

// }();
