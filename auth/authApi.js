"use strict";

// AUTH API

const crypto = require('crypto');
let db = require('/p/pancake/my/db.js');
const time = require('/p/pancake/my/time.js');
const random = require('/p/pancake/my/random.js');
let Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');
const logger = require('/p/pancake/lib/logger.js');

const SERVER_KEY_FOR_CLIENT = '2AqeaZezW7ildrOkHwIDvJ1kOEyXiFnV';
const SERVER_KEY_FOR_EMPLOYEE = '7ZLNfdFg8HVcuNx39dWdqAihmTgTiGjH';

// CREATE TABLE IF NOT EXISTS auth_data(
//   auth_data_id   SERIAL PRIMARY KEY  NOT NULL,
//   uuid           CHAR(36) NOT NULL,
//   client_id      CHAR(36) NOT NULL,
//   employee_id    CHAR(36),
//   token          CHAR(36) NOT NULL,
//   timestamp      TIMESTAMP DEFAULT NOW()
// );
// CREATE INDEX auth_data_i_uuid ON auth_data (uuid);
// CREATE TABLE IF NOT EXISTS uuid_phone(
//   uuid_phone_id   SERIAL PRIMARY KEY NOT NULL,
//   uuid           CHAR(36) NOT NULL,
//   phone          CHAR(50) NOT NULL,
//   timestamp      TIMESTAMP DEFAULT NOW()
// );
// CREATE INDEX uuid_phone_i_uuid ON uuid_phone (uuid);

module.exports = class AuthApi {
  constructor(ctx) {
    this.user = ctx.state.pancakeUser;
    this.uuid = this.user.uuid;
    this.ctx = ctx;
    this.userAgent = ctx.request.headers['user-agent'];
    this.host = ctx.headers.host;
    this.cookiesApi = ctx.cookies;
    this.hashStatus = {
      client: 1,
      clientEmployee: 2,
    };
    this.listStatus = [ , 'client', 'clientEmployee' ];

    //////
    // this.test = new Test({ 'login_client': true, first_login: true });
    // this.test = new Test({ 'login_client': true });
    // this.test = new Test({ login_client_employee: true, first_login: true });
    // this.test = new Test({ login_client_employee: true });
    // db = this.test.REPLACE_DB();
    // Request1Cv3 = this.test.REPLACE_1C();
    //////

  }


  async login(phone, code) {
    logger.log('=== LOGIN ===');
    // TODO: return via http object with error
    if (!phone) {
      console.log(`Not exist phone: ${phone}`);
      return {};
    }

    if (!code) {
      console.log(`Not exist code: ${code}`);
      return {};
    }
    let authData = await db.readOne('SELECT uuid, client_id, employee_id, token FROM auth_data WHERE uuid = $1', [ this.uuid ]);
    logger.log('auth_data from db =', JSON.stringify(authData, null, 2));
    if (authData instanceof Error) {
      throw authData;
    }

    if (!authData) {
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
        throw WrapAuthDataFrom1c;
      }

      ////// FOR TEST ONLY CLIENT
      ///     |
      //     V
      // WrapAuthDataFrom1c.data.EmployeeID = null;  //
      ////// FOR TEST ONLY CLIENT

      const authDataFrom1c = WrapAuthDataFrom1c.data;
      authData = {
        uuid: this.uuid,
        client_id: authDataFrom1c.ClientID,
        employee_id: authDataFrom1c.EmployeeID,
        token: authDataFrom1c.Token,
      };
      const resInsert = await db.edit(
        'INSERT INTO auth_data (uuid, client_id, employee_id, token) VALUES ($1, $2, $3, $4)',
        [ this.uuid,  authData.client_id, authData.employee_id, authData.token ]
      );
      if (resInsert instanceof Error) {
        throw resInsert;
      }
      logger.log('resInsert= ' + resInsert);

      const uuidPhoneInsert = await db.edit(
        'INSERT INTO uuid_phone (uuid, phone) VALUES ($1, $2)',
        [ this.uuid,  phone ]
      );
    }

    let { client_id, employee_id } = authData;

    if (client_id && !employee_id) {  // client login
      this.becomeClient_(client_id);
    } else if (client_id && employee_id) { // client-employee login
      this.becomeClientEmployee_(employee_id);
    } else {
      throw new Error('Not valid data', authData.data);
    }

    const data = {
      ClientID: client_id,
    };
    if (employee_id) {
      data.EmployeeID = employee_id;
    }

    return {
      ok: true,
      data
    };
  }

  async isLoginAsClient() {
    const cookiesApi = this.cookiesApi;
    const status = parseInt(cookiesApi.get('status'), 10);
    const A = cookiesApi.get('A');
    const B = cookiesApi.get('B');
    if (this.isNotValidCookies_(A, B, status)) {
      return false;
    }

    const auth_data = await db.readOne('SELECT client_id, employee_id FROM auth_data WHERE uuid=$1', [this.uuid]);
    if (auth_data instanceof Error) {
      throw auth_data;
    }
    if (!auth_data) {
      return false;
    }

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
    const cookiesApi = this.cookiesApi;
    const status = parseInt(cookiesApi.get('status'), 10);
    const A = cookiesApi.get('A');
    const B = cookiesApi.get('B');
    if (this.isNotValidCookies_(A, B, status)) {
      return false;
    }

    const auth_data = await db.readOne('SELECT client_id, employee_id FROM auth_data WHERE uuid=$1', [ this.uuid ]);
    if (auth_data instanceof Error) {
      throw auth_data;
    }
    if (!auth_data) {
      return false;
    }

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
      } else {
        return false;
      }
    } else if (status === hashStatus.clientEmployee) {
      return this.checkClientEmployee_(A, B, employee_id);
    }
  }

  logout() {
    const cookiesApi = this.cookiesApi;
    const params = { domain: this.host, maxAge: 0 , path: '/', httpOnly: false };
    // TODO: Maybe clean session_uuid_dom_dev_t
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

    logger.log('A= '+A);
    logger.log('B= '+B);
    logger.log('status= '+status);
    logger.log('host '+this.host);

    const cookieParam = { domain: this.host, maxAge, path: '/', httpOnly: false };
    cookiesApi.set('A', A, cookieParam);
    cookiesApi.set('B', B, cookieParam);
    cookiesApi.set('status', status, cookieParam);

    logger.log('=== AUTH HOW CLIENT ===');
  }

  becomeClientEmployee_(employee_id) {
    const daysToLive = 90;
    const maxAge = daysToLive * 24 * 60 * 60 * 1000; // 3 month

    const { A, B, status } = createClientEmployeeCookie(this, employee_id);
    const cookiesApi = this.cookiesApi;

    logger.log('A= '+A);
    logger.log('B= '+B);
    logger.log('status= '+status);
    logger.log('host '+this.host);

    const path = '/';
    const cookieParam = { domain: this.host, maxAge, path: '/', httpOnly: false };
    cookiesApi.set('A', A, cookieParam);
    cookiesApi.set('B', B, cookieParam);
    cookiesApi.set('status', status, cookieParam);

    logger.log('=== AUTH HOW CLIENT-EMPLOYEE ===');
  }

  checkClient_(A, B, client_id) {
    return B === createClientCookie(this, client_id, A).B;
  }

  checkClientEmployee_(A, B, employee_id) {
    return B === createClientEmployeeCookie(this, employee_id, A).B;
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
//     db.readOne = async function () {
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
