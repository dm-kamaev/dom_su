#!/usr/local/bin/node
'use strict';

const rp = require('/p/pancake/my/request_promise.js');
const assert = require('assert');
const json = require('/p/pancake/my/json.js');

module.exports = async function (domain, phone) {
  const { error, response, body } = await rp.post(domain+'/proxy_request/Auth.GetCode', {
    headers: {
      'is-cordova': true,
      'app-version': 2,
    },
    json: {
      'Phone': phone
    }
  });
  assert.ok(!error, 'Error request'+json.str(error));
  assert.ok(response.statusCode === 200, 'Incorrect responce status '+response.statusCode);
  assert.ok(body.ok, 'Incorrect body '+json.str(body));
  // console.log('GetCode');
  return body;
};


if (!module.parent) {
  module.exports();
}