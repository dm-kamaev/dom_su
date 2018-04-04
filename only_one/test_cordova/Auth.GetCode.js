#!/usr/local/bin/node
'use strict';

const rp = require('/p/pancake/my/request_promise.js');

module.exports = async function (domain, phone) {
  try {
    const { error, response, body } = await rp.post(domain+'/proxy_request/Auth.GetCode', {
      headers: {
        'is-cordova': true,
        'app-version': 2,
      },
      json: {
        'Phone': phone
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