#!/usr/local/bin/node
'use strict';

// TEST FOR GET client phone and applicant phone
// DON'T WORK ON DEV BECAUSE PROBLEM WITH IP

const CONF = require('/p/pancake/settings/config.js');
const rp = require('/p/pancake/my/request_promise.js');
const assert = require('assert');
const json = require('/p/pancake/my/json.js');


// https://www-dev1.domovenok.su/aj/calltracking
module.exports = async function (domain) {
  const { error, response, body } = await rp.get(domain+'/aj/calltracking', {
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36',
      // 'x-real-ip': '79.137.213.2',
      referer: 'https://domovenok.su',
    },
  });
  console.log('body=', body);
  assert.ok(!error, 'Error request' + json.str(error));
  assert.ok(response.statusCode === 200, 'Incorrect responce status '+response.statusCode+' '+json.str(response));
  assert.ok(body.ok, 'Incorrect body ' + json.str(body));
  return body;
};


if (!module.parent) {
  module.exports(CONF.domain);
}


