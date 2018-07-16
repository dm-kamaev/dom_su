#!/usr/local/bin/node
'use strict';

// TEST FOR GET client phone and applicant phone
// DON'T WORK ON DEV BECAUSE PROBLEM WITH IP

const CONF = require('/p/pancake/settings/config.js');
const rp = require('/p/pancake/my/request_promise.js');
const promise_api = require('/p/pancake/my/promise_api.js');
const db = require('/p/pancake/my/db2.js');
const assert = require('assert');
const json = require('/p/pancake/my/json.js');


// https://www-dev1.domovenok.su/aj/calltracking
module.exports = async function (domain, key) {
  let count_try = 100;
  try {
    await promise_api.while(function () {
      count_try--;
      return count_try > 0;
    }, async function () {
      console.log('one_request');
      await one_request(domain);
    });
    const a_b_test = await db.read_one('SELECT name, key, for_new_user as "forNewUser", variations FROM ab_test WHERE key = $1', [ key ]);
    console.log(a_b_test.key);
    JSON.parse(a_b_test.variations).forEach(variation => {
      console.log(variation);
    });
  } catch (err) {
    throw err;
  }
};

async function one_request(domain) {
  console.log(domain+'/');
  const { error, response, body } = await rp.get(domain+'/', {
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
      // 'x-real-ip': '79.137.213.2',
      referer: 'https://domovenok.su',
    },
  });
  console.log(response.statusCode);
  // console.log('body=', body);
  assert.ok(!error, 'Error request' + json.str(error));
  // assert.ok(response.statusCode === 200, 'Incorrect responce status '+response.statusCode+' '+json.str(response));
  // assert.ok(body.ok, 'Incorrect body ' + json.str(body));
  // return body;
}

if (!module.parent) {
  void async function () {
    await module.exports(CONF.domain, 'moscow::::main_14_20180716_17:04:22');
  }();
}


