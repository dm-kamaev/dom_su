#!/usr/local/bin/node

'use strict';

// LOGGER FOR AUTH USER

const wf = require('/p/pancake/my/wf.js');
const time = require('/p/pancake/my/time.js');
const Auth_api = require('/p/pancake/auth/authApi.js');
const definition_request_type = require('/p/pancake/user_manager/middleware/definitionRequestType.js');

class FactoryLogger {
  // option –– {
  //   jsonStringify: true,
  // }
  constructor(option) {
    this.option = option;
  }

  get() {
    return new Logger(this.option);
  }

}

class Logger {
  constructor(option) {
    this.jsonStringify = option.json_stringify;
  }

  // detect user is client or employee
  async init(ctx) {
    // if request to not service, because user create only for user routes
    if (definition_request_type.is_not_user_request(ctx)) {
      return;
    }

    const auth_api = new Auth_api(ctx);
    auth_api.set_empty_cookies_api_set();
    if (this._detect_auth) {
      return;
    }

    const isLoginAsClient = await auth_api.isLoginAsClient();
    const isLoginAsClientEmployee = await auth_api.isLoginAsClientEmployee();
    if (isLoginAsClient) {
      this._detect_auth = true;
      this._is_client = true;
      this._auth_data = auth_api.get_auth_data();
    } else if (isLoginAsClientEmployee) {
      this._detect_auth = true;
      this._is_employee = true;
      this._auth_data = auth_api.get_auth_data();
    }
  }

  // write folder YYYYMM/ in file with current date and with client_id or employee_id
  async log(text) {
    if (!this._detect_auth) {
      return;
    }

    if (this.jsonStringify && text instanceof Object && !(text instanceof Error)) {
      text = JSON.stringify(text, null, 2);
    }
    let path = '';
    const { client_id, employee_id } = this._auth_data;
    const folder = '/p/log/auth_user/'+time.format('YYYYMM');
    const day = time.format('YYYYMMDD');
    if (this._is_client) {
      path = folder+'/client_'+client_id+'_'+day+'.log';
    } else {
      path = folder+'/employee_'+employee_id+'_'+day+'.log';
    }
    await wf.append(path, text+'\n');
  }
}

module.exports = new FactoryLogger({ json_stringify: true, }).get();

