'use strict';

// AUTH API

const crypto = require('crypto');
const db = require('/p/pancake/my/db.js');
const time = require('/p/pancake/my/time.js');
const random = require('/p/pancake/my/random.js');
const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');
const logger = require('/p/pancake/lib/logger.js');

const SERVER_KEY_FOR_CLIENT = '2AqeaZezW7ildrOkHwIDvJ1kOEyXiFnV';
const SERVER_KEY_FOR_EMPLOYEE = '7ZLNfdFg8HVcuNx39dWdqAihmTgTiGjH';

// CREATE TABLE IF NOT EXISTS auth_data(
//   auth_data_id   SERIAL PRIMARY KEY  NOT NULL,
//   uuid           VARCHAR(36) NOT NULL,
//   client_id      VARCHAR(36) NOT NULL,
//   employee_id    VARCHAR(36),
//   token          VARCHAR(36) NOT NULL,
//   timestamp      TIMESTAMP DEFAULT NOW()
// );
// CREATE INDEX auth_data_i_uuid ON auth_data (uuid);
// CREATE TABLE IF NOT EXISTS uuid_phone(
//   uuid_phone_id   SERIAL PRIMARY KEY NOT NULL,
//   uuid           VARCHAR(36) NOT NULL,
//   phone          VARCHAR(50) NOT NULL,
//   timestamp      TIMESTAMP DEFAULT NOW()
// );
// CREATE INDEX uuid_phone_i_uuid ON uuid_phone (uuid);

// TODO: maybe add?
// CREATE UNIQUE INDEX auth_data_ui_uuid ON auth_data (uuid);
module.exports = class AuthApi {
  /**
   *
   * @param  {object} ctx
   * {
      request: req,
      response: res,
      state: {
        pancakeUser: {
          auth1C: {
            uuid: cookie_u_uuid,
          },
          uuid: cookie_u_uuid,
        }
      }
    },
   * @param  {string} express_or_koa 'express'
   * @return {[type]}                [description]
   */
  constructor(ctx, express_or_koa) {
    if (ctx.state.auth_api) {
      return ctx.state.auth_api;
    }
    ctx.state.auth_api = this;

    this.user = ctx.state.pancakeUser; // { auth1C: {token: null, employee_uuid: null, client_uuid: null, uuid: null, model: null} }
    this.headers = ctx.request.headers;
    logger.log('auth_api => uuid: user.uuid='+ this.user.uuid+' x-dom-auth='+ this.headers['x-dom-auth']);
    this.uuid = this.headers['x-dom-auth'] || this.user.uuid || null;
    this.ctx = ctx;
    this.userAgent = this.headers['user-agent'];
    this.host = this.headers.host;
    logger.log('this.headers='+ JSON.stringify(this.headers, null, 2));
    if (express_or_koa === 'express') {
      this.cookiesApi = {
        get: function (key) {
          return ctx.request.cookies[key];
        },
        set: function (name, val, option) {
          ctx.response.cookie(name, val, option);
        }
      };
    } else {
      this.cookiesApi = ctx.cookies;
    }

    // console.log('dom_session=', this.cookiesApi.get('dom_session'));
    // this.cookiesApi.set('TEST', 123, { domain: '.dev2.domovenok.su', maxAge: 100000000 , path: '/', httpOnly: false});

    this.hashStatus = {
      client: 1,
      clientEmployee: 2,
    };
    this.listStatus = [ null, 'client', 'clientEmployee' ];
    this.auth_data = {
      uuid: null,
      client_id: null,
      employee_id: null,
      token: null
    };

    // ////
    // this.test = new Test({ 'login_client': true, first_login: true });
    // this.test = new Test({ 'login_client': true });
    // this.test = new Test({ login_client_employee: true, first_login: true });
    // this.test = new Test({ login_client_employee: true });
    // db = this.test.REPLACE_DB();
    // Request1Cv3 = this.test.REPLACE_1C();
    // ////

  }

  // authData –– { client_id, employee_id, token }
  setAuthData(authData) {
    this.auth_data = authData;
  }

  // return { uuid, client_id, employee_id, token }
  getAuthData() {
    return this.get_auth_data();
  }

  // return { uuid, client_id, employee_id, token }
  get_auth_data() {
    this.auth_data.uuid = this.uuid;
    return this.auth_data;
  }

  async login(phone, code) {
    logger.log('=== LOGIN ===');
    if (!phone) {
      logger.log(`Not exist phone: ${phone}`);
      return {
        ok: false,
        error: {
          code: -3,
          text: `Not exist phone: ${phone}`,
        }
      };
    }
    phone = phone.replace(/[^\d]+/g, '');

    if (!code) {
      logger.log(`Not exist code: ${code}`);
      return {
        ok: false,
        error: {
          code: -3,
          text: `Not exist code: ${code}`,
        }
      };
    }

    let auth_data_in_db = await db.read_one('SELECT uuid, client_id, employee_id, token FROM auth_data WHERE uuid = $1', [ this.uuid ]);
    logger.log('auth_data from db ='+ JSON.stringify(auth_data_in_db, null, 2));
    if (auth_data_in_db instanceof Error) {
      logger.warn(authData);
      return {
        ok: false,
        error: {
          code: -1,
          text: 'Internal error',
        }
      };
    }
    const exist_auth_dta_in_db = Boolean(auth_data_in_db);
    logger.log('exist_auth_dta_in_db ='+ JSON.stringify(exist_auth_dta_in_db, null, 2));

    // TODO: токен может истекать( через 1 год)
    // После изменения статуса соотрудника не меняется его token
    const request1C = new Request1Cv3(this.user.auth1C.token, this.uuid);
    await request1C.add('Auth.Login', { Phone: phone, Code: code }).do();
    // authDataFrom1c –– {
    //   "ok": true,
    //   "data": {
    //     "ClientID": "6ed99ac9-9657-11e2-beb6-1078d2da50b0",
    //     "EmployeeID": "e7958b5e-360e-11e2-a60e-08edb9b907e8",
    //     "Token": "85253ffa-9d03-4cb0-ac76-5809e02de202"
    //   }
    // }

    const WrapAuthDataFrom1c = request1C.get();
    if (!WrapAuthDataFrom1c.ok) {
      return WrapAuthDataFrom1c;
    }

    // //// FOR TEST ONLY CLIENT
    // /     |
    //     V
    // WrapAuthDataFrom1c.data.EmployeeID = null;  //
    // //// FOR TEST ONLY CLIENT

    const authDataFrom1c = WrapAuthDataFrom1c.data;
    const authData = {
      uuid: this.uuid,
      client_id: authDataFrom1c.ClientID,
      employee_id: authDataFrom1c.EmployeeID,
      token: authDataFrom1c.Token,
    };

    if (exist_auth_dta_in_db) {
      const res_update = await db.edit(
        'UPDATE auth_data SET client_id=$1, employee_id=$2, token=$3, timestamp=$4 WHERE uuid=$5',
        [ authData.client_id, authData.employee_id, authData.token, new Date(), this.uuid ]
      );
      if (res_update instanceof Error) {
        logger.warn(res_update);
        return {
          ok: false,
          error: {
            code: -1,
            text: 'Internal error',
          }
        };
      }
      logger.log('res_update= ' + res_update);
    } else {
      const res_insert = await db.edit(
        'INSERT INTO auth_data (uuid, client_id, employee_id, token) VALUES ($1, $2, $3, $4)',
        [ this.uuid,  authData.client_id, authData.employee_id, authData.token ]
      );
      if (res_insert instanceof Error) {
        logger.warn(res_insert);
        return {
          ok: false,
          error: {
            code: -1,
            text: 'Internal error',
          }
        };
      }
      logger.log('res_insert= ' + res_insert);
    }


    const uuid_phone_insert = await db.edit(
      'INSERT INTO uuid_phone (uuid, phone) VALUES ($1, $2)',
      [ this.uuid, phone ]
    );
    if (uuid_phone_insert instanceof Error) {
      logger.warn(uuid_phone_insert);
    }

    let { client_id, employee_id } = authData;

    if (client_id && !employee_id) {  // client login
      this.becomeClient_(client_id);
    } else if (!client_id && employee_id) { // employee login
      this.becomeClientEmployee_(employee_id);
    } else if (client_id && employee_id) { // client-employee login
      this.becomeClientEmployee_(employee_id);
    } else {
      logger.warn('Not valid data => '+JSON.stringify(authData.data, null, 2));
      return {
        ok: false,
        error: {
          code: -2,
          text: 'Not valid data => '+JSON.stringify(authData.data, null, 2),
        }
      };
    }

    const data = {
      ClientID: client_id,
      cookies: this.cookie_for_cordova,
    };

    if (employee_id) {
      data.EmployeeID = employee_id;
    }

    this.setAuthData(authData);
    this.success_login = true;
    return {
      ok: true,
      data
    };
  }

  // for detect success login or not
  is_not_success_login() {
    return !Boolean(this.success_login);
  }

  async isLoginAsClient() {
    const status = parseInt(extract_cookie(this, 'status'), 10);
    const A = extract_cookie(this, 'A');
    const B = extract_cookie(this, 'B');
    if (this.isNotValidCookies_(A, B, status)) {
      return false;
    }

    const auth_data = await db.read_one('SELECT client_id, employee_id, token FROM auth_data WHERE uuid=$1', [this.uuid]);
    if (auth_data instanceof Error) {
      throw auth_data;
    }
    logger.log(' isLoginAsClient => auth_data= \n'+ JSON.stringify(auth_data, null, 2));
    if (!auth_data || !auth_data.client_id) {
      return false;
    }
    if (!auth_data.client_id && !auth_data.employee_id) {
      return false;
    }
    this.setAuthData(auth_data);

    const client_id = auth_data.client_id;
    const employee_id = auth_data.employee_id;
    // TODO: Проверять, не истек ли token

    const hashStatus = this.hashStatus;
    if (status === hashStatus.client) {
      if (!this.checkClient_(A, B, client_id)) {
        return false;
      }
      if (employee_id) { // if he BECAME a employee, repeat login
        await this.becomeClientEmployee_(employee_id);
      }
      return true;
    } else if (status === hashStatus.clientEmployee) {
      if (!employee_id) { // if he CEASED to be an client-employee, repeat login
        await this.becomeClient_(client_id);
        return true;
      } else {
        return this.checkClientEmployee_(A, B, employee_id);
      }
    }
  }


  async isLoginAsClientEmployee() {
    const status = parseInt(extract_cookie(this, 'status'), 10);
    const A = extract_cookie(this, 'A');
    const B = extract_cookie(this, 'B');
    if (this.isNotValidCookies_(A, B, status)) {
      return false;
    }

    const auth_data = await db.read_one('SELECT client_id, employee_id, token FROM auth_data WHERE uuid=$1', [ this.uuid ]);
    if (auth_data instanceof Error) {
      throw auth_data;
    }
    if (!auth_data) {
      return false;
    }
    if (!auth_data.client_id && !auth_data.employee_id) {
      return false;
    }
    this.setAuthData(auth_data);

    // TODO: Проверять, не истек ли token
    const client_id = auth_data.client_id;
    const employee_id = auth_data.employee_id;
    if (!employee_id) { // if he CEASED to be an client-employee, repeat login
      await this.becomeClient_(client_id);
      return false;
    }
    const hashStatus = this.hashStatus;
    if (status === hashStatus.client) {
      if (!this.checkClient_(A, B, client_id)) {
        return false;
      }
      if (employee_id) {
        this.becomeClientEmployee_(employee_id); // if he BECAME a employee, repeat login
        return true;
      }
    } else if (status === hashStatus.clientEmployee) {
      return this.checkClientEmployee_(A, B, employee_id);
    }
  }

  logout() {
    const cookiesApi = this.cookiesApi;
    const params = { domain: this.host, maxAge: 0 , path: '/', httpOnly: false };
    // TODO: Maybe clean session_uuid_dom_dev_t
    cookiesApi.set('u_uuid', null, params);
    cookiesApi.set('session_uid_dom', null, params);
    cookiesApi.set('session_uid_dom_dev', null, params);
    cookiesApi.set('session_uuid_dom_dev_t', null, params);
    cookiesApi.set('A', null, params);
    cookiesApi.set('B', null, params);
    cookiesApi.set('status', null, params);
    logger.log('=== LOGOUT ===');
  }


  isNotValidCookies_(A, B, status) {
    if (!A || !B) {
      return true;
    }
    status = parseInt(status, 10);
    if (!status) {
      return true;
    }
    return !this.listStatus[status];
  }

  becomeClient_(client_id) {
    const daysToLive = 90;
    const maxAge = daysToLive * 24 * 60 * 60 * 1000; // 3 month

    const { A, B, status } = createClientCookie(this, client_id);
    const cookiesApi = this.cookiesApi;

    logger.log('uuid= '+this.uuid);
    logger.log('A= '+A);
    logger.log('B= '+B);
    logger.log('status= '+status);
    logger.log('userAgent= '+this.userAgent);
    logger.log('host= '+this.host);

    const cookieParam = { domain: this.host, maxAge, path: '/', httpOnly: false };
    cookiesApi.set('A', A, cookieParam);
    cookiesApi.set('B', B, cookieParam);
    cookiesApi.set('status', status, cookieParam);

    this.set_cookie_for_cordova([
      { name: 'X-Dom-Auth', value: this.uuid, },
      { name: 'A', value: A, params: cookieParam },
      { name: 'B', value: B, params: cookieParam },
      { name: 'status', value: status, params: cookieParam }
    ]);

    logger.log('=== AUTH HOW CLIENT ===');
  }

  becomeClientEmployee_(employee_id) {
    const daysToLive = 90;
    const maxAge = daysToLive * 24 * 60 * 60 * 1000; // 3 month

    const { A, B, status } = createClientEmployeeCookie(this, employee_id);
    const cookiesApi = this.cookiesApi;

    logger.log('uuid= '+this.uuid);
    logger.log('A= '+A);
    logger.log('B= '+B);
    logger.log('status= '+status);
    logger.log('userAgent= '+this.userAgent);
    logger.log('host '+this.host);

    const cookieParam = { domain: this.host, maxAge, path: '/', httpOnly: false };
    cookiesApi.set('A', A, cookieParam);
    cookiesApi.set('B', B, cookieParam);
    cookiesApi.set('status', status, cookieParam);

    this.set_cookie_for_cordova([
      { name: 'X-Dom-Auth', value: this.uuid, },
      { name: 'A', value: A, params: cookieParam },
      { name: 'B', value: B, params: cookieParam },
      { name: 'status', value: status, params: cookieParam }
    ]);
    logger.log('=== AUTH HOW CLIENT-EMPLOYEE ===');
  }

  checkClient_(A_input, B_input, client_id) {
    const B_new = createClientCookie(this, client_id, A_input).B;
    return B_input === B_new;
  }

  checkClientEmployee_(A, B, employee_id) {
    return B === createClientEmployeeCookie(this, employee_id, A).B;
  }

  set_cookie_for_cordova(list_cookie) {
    this.cookie_for_cordova = list_cookie;
  }
};


function createClientCookie(me, client_id, A) {
  A = A || me.uuid + random.str(10) + time.get().in_ms;
  const B = crypto.createHash('sha512')
    .update(A)
    .update(client_id)
    .update(me.userAgent)
    .update(SERVER_KEY_FOR_CLIENT)
    .digest('hex');
  const status = me.hashStatus.client;
  return { A, B, status };
}


function createClientEmployeeCookie(me, employee_id, A) {
  A = A || me.uuid + random.str(10) + time.get().in_ms;
  const B = crypto.createHash('sha512')
    .update(A)
    .update(employee_id)
    .update(me.userAgent)
    .update(SERVER_KEY_FOR_EMPLOYEE)
    .digest('hex');
  const status = me.hashStatus.clientEmployee;
  return { A, B, status };
}


function extract_cookie(me, cookie_name) {
  return me.cookiesApi.get(cookie_name) ||
         me.headers[cookie_name] ||
         me.headers[cookie_name.toLowerCase()] ||
         null;
}


// class Test {
//   constructor(option) {
//     this.option = option;
//     logger.log('===== TEST LOGIN ====');

//     if (option['login_client']) {
//       this.data1c = {
//         "ok": true,
//         "data": {
//           "ClientID": "6ed99ac9-9657-11e2-beb6-1078d2da50b0",
//           "Token": "85253ffa-9d03-4cb0-ac76-5809e02de202"
//         }
//       };
//     } else if (option['login_client_employee']) {
//       this.data1c = {
//         "ok": true,
//         "data": {
//           "ClientID": "6ed99ac9-9657-11e2-beb6-1078d2da50b0",
//           "EmployeeID": "e7958b5e-360e-11e2-a60e-08edb9b907e8",
//           "Token": "85253ffa-9d03-4cb0-ac76-5809e02de202"
//         }
//       };
//     } else if (option['first_login'] && option['err_1C']) {
//       this.data1c = {
//         "ok": false,
//         "error": 'Подставь ошибку'
//       };
//     }
//     this.db = this.create_test_db();
//   }

//   REPLACE_1C() {
//     const me = this;
//     return class TEST_Request1Cv3 {
//       constructor() {

//       }

//       add() {
//         return this;
//       }

//       async do() {
//         return Promise.resolve(this);
//       }

//       get() {
//         return me.data1c;
//       }
//     }
//   }

//   REPLACE_DB() {
//     return this.db;
//   }

//   create_test_db() {
//     const me = this;
//     const db = {};
//     let data = me.data1c.data;
//     let count_read = 0;
//     data = {
//       client_id: data.ClientID,
//       employee_id: data.EmployeeID,
//       token: data.Token,
//     };
//     db.read_one = async function () {
//       if (me.option['first_login'] && !count_read) {
//         count_read = 1;
//         return null;
//       }
//       return data;
//     };
//     db.edit = async function () {
//       return 1;
//     };
//     return db;
//   }
// }


// class TEST_Request1Cv3 {
//   constructor() {

//   }

//   add() {
//     return this;
//   }

//   async do() {
//     return Promise.resolve(this);
//   }

//   get() {
//     return me.data1c;
//   }
// };

// (async function () {
//   const c = new Test({ 'login_client': true, first_login: true }).REPLACE_1C();
//   console.log(await new c().add().do());
// }());


// let authData = await db.read_one('SELECT uuid, client_id, employee_id, token FROM auth_data WHERE uuid = $1', [ this.uuid ]);
// logger.log('auth_data from db ='+ JSON.stringify(authData, null, 2));
// if (authData instanceof Error) {
//   logger.warn(authData);
//   return {
//     ok: false,
//     error: {
//       code: -1,
//       text: 'Internal error',
//     }
//   };
// }

// async login(phone, code) {
//     logger.log('=== LOGIN ===');
//     if (!phone) {
//       logger.log(`Not exist phone: ${phone}`);
//       return {
//         ok: false,
//         error: {
//           code: -3,
//           text: `Not exist phone: ${phone}`,
//         }
//       };
//     }
//     phone = phone.replace(/[^\d]+/g, '');

//     if (!code) {
//       logger.log(`Not exist code: ${code}`);
//       return {
//         ok: false,
//         error: {
//           code: -3,
//           text: `Not exist code: ${code}`,
//         }
//       };
//     }
//     let authData = await db.read_one('SELECT uuid, client_id, employee_id, token FROM auth_data WHERE uuid = $1', [ this.uuid ]);
//     logger.log('auth_data from db ='+ JSON.stringify(authData, null, 2));
//     if (authData instanceof Error) {
//       logger.warn(authData);
//       return {
//         ok: false,
//         error: {
//           code: -1,
//           text: 'Internal error',
//         }
//       };
//     }

//     if (!authData) {
//       // TODO: токен может истекать( через 1 год)
//       // После изменения статуса соотрудника не меняется его token
//       const request1C = new Request1Cv3(this.user.auth1C.token, this.uuid);
//       await request1C.add('Auth.Login', { Phone: phone, Code: code }).do();
//       // authDataFrom1c –– {
//       //   "ok": true,
//       //   "data": {
//       //     "ClientID": "6ed99ac9-9657-11e2-beb6-1078d2da50b0",
//       //     "EmployeeID": "e7958b5e-360e-11e2-a60e-08edb9b907e8",
//       //     "Token": "85253ffa-9d03-4cb0-ac76-5809e02de202"
//       //   }
//       // }

//       const WrapAuthDataFrom1c = request1C.get();
//       if (!WrapAuthDataFrom1c.ok) {
//         return WrapAuthDataFrom1c;
//       }

//       // //// FOR TEST ONLY CLIENT
//       // /     |
//       //     V
//       // WrapAuthDataFrom1c.data.EmployeeID = null;  //
//       // //// FOR TEST ONLY CLIENT

//       const authDataFrom1c = WrapAuthDataFrom1c.data;
//       authData = {
//         uuid: this.uuid,
//         client_id: authDataFrom1c.ClientID,
//         employee_id: authDataFrom1c.EmployeeID,
//         token: authDataFrom1c.Token,
//       };
//       const resInsert = await db.edit(
//         'INSERT INTO auth_data (uuid, client_id, employee_id, token) VALUES ($1, $2, $3, $4)',
//         [ this.uuid,  authData.client_id, authData.employee_id, authData.token ]
//       );
//       if (resInsert instanceof Error) {
//         logger.warn(resInsert);
//         return {
//           ok: false,
//           error: {
//             code: -1,
//             text: 'Internal error',
//           }
//         };
//       }
//       logger.log('resInsert= ' + resInsert);

//       const uuidPhoneInsert = await db.edit(
//         'INSERT INTO uuid_phone (uuid, phone) VALUES ($1, $2)',
//         [ this.uuid,  phone ]
//       );
//       if (uuidPhoneInsert instanceof Error) {
//         logger.warn(uuidPhoneInsert);
//       }
//     }

//     let { client_id, employee_id } = authData;

//     if (client_id && !employee_id) {  // client login
//       this.becomeClient_(client_id);
//     } else if (!client_id && employee_id) { // employee login
//       this.becomeClientEmployee_(employee_id);
//     } else if (client_id && employee_id) { // client-employee login
//       this.becomeClientEmployee_(employee_id);
//     } else {
//       logger.warn('Not valid data => '+JSON.stringify(authData.data, null, 2));
//       return {
//         ok: false,
//         error: {
//           code: -2,
//           text: 'Not valid data => '+JSON.stringify(authData.data, null, 2),
//         }
//       };
//     }

//     const data = {
//       ClientID: client_id,
//       cookies: this.cookie_for_cordova,
//     };

//     if (employee_id) {
//       data.EmployeeID = employee_id;
//     }

//     this.setAuthData(authData);
//     this.success_login = true;
//     return {
//       ok: true,
//       data
//     };
//   }