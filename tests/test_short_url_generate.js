#!/usr/local/bin/node
'use strict';

// test request for generate short url (HOW 1C) without coookie

const CONF = require('/p/pancake/settings/config.js');
const rp = require('/p/pancake/my/request_promise.js');
const json = require('/p/pancake/my/json.js');
const assert = require('assert');


module.exports = async function (domain) {
  const { error, response, body } = await rp.post(domain+'/short_urls/rest/generate/', {
    headers: {
      'is-cordova': true,
      'app-version': 2,
      'x-dom-service': 'OneC'
    },
    json: {
      'Url': 'e1c://server/apps.domovenok.corp/domovenok#e1cib/data/Справочник.Задачи?ref=80ea00155d59490011e847d4d33c511d',
      'Data': {
        'Luid': null
      }
    }
  });
  assert.ok(!error, 'Error request'+json.str(error));
  assert.ok(response.statusCode === 200, 'Incorrect responce status '+response.statusCode);
  assert.ok(body.Result, 'Result is false '+json.str(body));
  return body;
};


if (!module.parent) {
  void async function () {
    try {
      console.log(await module.exports(CONF.domain));
      global.process.exit(0);
    } catch (err) {
      console.error(err);
      global.process.exit(1);
    }
  }();
}


