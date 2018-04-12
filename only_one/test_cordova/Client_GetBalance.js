#!/usr/local/bin/node
'use strict';

const rp = require('/p/pancake/my/request_promise.js');

module.exports = async function (domain, auth_data) {
  try {
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
    if (error) {
      throw {
        response,
        error,
      };
    }
    if (!body.ok) {
      throw body;
    }
    return body;
  } catch (err) {
    throw err;
  }
};


if (!module.parent) {
  module.exports();
}


