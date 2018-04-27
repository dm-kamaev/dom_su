#!/usr/local/bin/node
'use strict';

// require('request').debug = true;
const Auth_GetCode = require('./Auth.GetCode.js');
const Auth_Login = require('./Auth.Login.js');
const Client_GetBalance = require('./Client_GetBalance.js');

const domain = 'https://www-dev2.domovenok.su';
void async function () {
  try {
    const phone = '+79154934999';

    const body_code = await Auth_GetCode(domain, phone);
    console.log('body_code= ');
    console.dir(body_code, { depth: 20, colors: true });

    const auth_data = {
      uuid: body_code.data['x-dom-auth']
    };
    const body_login = await Auth_Login(domain, phone, auth_data);
    console.log('body_login=');
    console.dir(body_login, { depth: 20, colors: true });
    const login_data = body_login.data;
    login_data.cookies.forEach(({ value, name }) => {
      auth_data[name] = value;
    });
    auth_data.client_id = login_data.ClientID;
    console.log('auth_data=', auth_data);

    const body_balance = await Client_GetBalance(domain, auth_data);
    console.log('body_balance=');
    console.dir(body_balance, { depth: 20, colors: true });

  } catch (err) {
    console.log(err);
  }
}();