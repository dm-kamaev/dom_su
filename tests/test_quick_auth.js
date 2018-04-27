#!/usr/local/bin/node
'use strict';

// test request for generate short url (HOW 1C) without coookie

const CONF = require('/p/pancake/settings/config.js');
const rp = require('/p/pancake/my/request_promise.js');
const json = require('/p/pancake/my/json.js');
const assert = require('assert');

// return {
//   success: true,
//   data: {
//     link: '/private/set_cookies/?action=qa&u_uuid=9254ccb7-8530-4c6c-8361-b43669baab10&session_uid_dom=9254ccb7-8530-4c6c-8361-b43669baab10&A=9254ccb7-8530-4c6c-8361-b43669baab10yJNukJcC1Z1524749372253&B=642c0622e04395a0e3aee9f19ad8fa64dcb41130da06501bb975146a36bf7651a7e9c9d01076aba48f0acdb2cb62f66f029b18e0e682af0c152a153b429d597a&status=1'
//   }
// }
// https://www-dev1.domovenok.su/private/set_cookies/?action=qa&u_uuid=9254ccb7-8530-4c6c-8361-b43669baab10&session_uid_dom=9254ccb7-8530-4c6c-8361-b43669baab10&A=9254ccb7-8530-4c6c-8361-b43669baab10yJNukJcC1Z1524749372253&B=642c0622e04395a0e3aee9f19ad8fa64dcb41130da06501bb975146a36bf7651a7e9c9d01076aba48f0acdb2cb62f66f029b18e0e682af0c152a153b429d597a&status=1
module.exports = async function (domain) {
  const { error, response, body } = await rp.post(domain+'/api/quick_auth', {
    headers: {
      'Authorization': 'Bearer 1FGf34hYZ5L2EgXBdpip8QJhKxPIEscBSuEilpmu',
      'Content-Type': 'application/json'
    },
    json: {
      client_id: '0ce4440e-5d54-11e6-80e2-00155d594900'
    }
  });
  assert.ok(!error, 'Error request'+json.str(error));
  assert.ok(response.statusCode === 200, 'Incorrect responce status '+response.statusCode);
  assert.ok(body.success, 'Result is false '+json.str(body));
  return body;
};


if (!module.parent) {
  void async function () {
    try {
      // console.log(await module.exports(CONF.domain));
      console.log(await module.exports('https://www.domovenok.su'));
      global.process.exit(0);
    } catch (err) {
      console.error(err);
      global.process.exit(1);
    }
  }();
}

