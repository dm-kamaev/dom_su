#!/usr/local/bin/node
'use strict';

// test request to site as robot
// check specific user uuid

const CONF = require('/p/pancake/settings/config.js');
const rp = require('/p/pancake/my/request_promise.js');
const json = require('/p/pancake/my/json.js');
const robot_user = require('/p/pancake/user_manager/robot_user.js');
const parser_set_cookie = require('set-cookie-parser');
const assert = require('assert');


module.exports = async function (domain) {
  const { error, response, body } = await rp.get(domain, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; YandexAccessibilityBot/3.0; +http://yandex.com/bots)',
    },
  });
  assert.ok(!error, 'Error request'+json.str(error));
  assert.ok(response.statusCode === 200, 'Incorrect responce status '+response.statusCode);

  const u_uuid = get_set_cookie_by_name(parser_set_cookie.parse(response), 'u_uuid');
  assert.ok(u_uuid === robot_user.get_user_uuid(), 'Incorrect user uuid for robot '+response.headers);
};


function get_set_cookie_by_name(cookies, name) {
  for (var i = 0, l = cookies.length; i < l; i++) {
    const { name: cookie_name } = cookies[i];
    if (cookie_name === name) {
      return cookies[i].value;
    }
  }
  return null;
}


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


