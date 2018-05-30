#!/usr/local/bin/node
'use strict';

const rp = require('/p/pancake/my/request_promise.js');
const assert = require('assert');
const json = require('/p/pancake/my/json.js');


module.exports = async function (domain, phone, auth_data) {
  const { error, response, body } = await rp.post(domain + '/proxy_request/Auth.Login', {
    headers: {
      'is-cordova': true,
      'app-version': 2,
      'X-dom-auth': auth_data.uuid,
    },
    json: {
      'Phone': phone,
      'Code': '111'
    }
  });
  assert.ok(!error, 'Error request' + json.str(error));
  assert.ok(response.statusCode === 200, 'Incorrect responce status '+response.statusCode);
  assert.ok(body.ok, 'Incorrect body ' + json.str(body));
  // console.log('Login');
  return body;
};


if (!module.parent) {
  module.exports();
}


