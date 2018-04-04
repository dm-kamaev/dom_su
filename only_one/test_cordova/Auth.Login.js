#!/usr/local/bin/node
'use strict';

const rp = require('/p/pancake/my/request_promise.js');

module.exports = async function (domain, phone, auth_data) {
  try {
    const { error, response, body } = await rp.post(domain+'/proxy_request/Auth.Login', {
      headers: {
        'is-cordova': true,
        'app-version': 2,
        'X-dom-auth': auth_data.uuid,
      },
      json: {
        'Phone': phone,
        'Code': "111"
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


