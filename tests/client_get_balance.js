#!/usr/local/bin/node
'use strict';

const rp = require('/p/pancake/my/request_promise.js');
const assert = require('assert');
const json = require('/p/pancake/my/json.js');


module.exports = async function (domain, auth_data) {
  const { error, response, body } = await rp.post(domain+'/proxy_request/Client.GetBalance', {
    headers: {
      'is-cordova': true,
      'app-version': 2,
      'x-dom-auth': auth_data.uuid,
      A: auth_data.A,
      B: auth_data.B,
      status: auth_data.status,
    },
    json: {
      'ClientID': auth_data.client_id
    }
  });
  assert.ok(!error, 'Error request' + json.str(error));
  assert.ok(response.statusCode === 200, 'Incorrect responce status '+response.statusCode);
  assert.ok(body.ok, 'Incorrect body ' + json.str(body));
  // console.log('GetBalance');
  return body;
};


if (!module.parent) {
  module.exports();
}


