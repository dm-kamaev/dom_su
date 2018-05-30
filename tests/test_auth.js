#!/usr/local/bin/node
'use strict';

// require('request').debug = true;
const auth_get_code = require('./auth_get_code.js');
const auth_login = require('./auth_login.js');
const client_get_balance = require('./client_get_balance.js');

module.exports = async function(domain) {
  const phone = '+79154934999';

  const body_code = await auth_get_code(domain, phone);

  const auth_data = {
    uuid: body_code.data['x-dom-auth']
  };

  const body_login = await auth_login(domain, phone, auth_data);

  const login_data = body_login.data;
  login_data.cookies.forEach(({
    value,
    name
  }) => {
    auth_data[name] = value;
  });
  auth_data.client_id = login_data.ClientID;

  const body_balance = await client_get_balance(domain, auth_data);
  return body_balance;
};

