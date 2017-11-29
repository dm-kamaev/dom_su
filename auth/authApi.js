"use strict";

// AUTH API

const crypto = require('crypto');
const db = require('/p/pancake/my/db.js');
const time = require('/p/pancake/my/time.js');
const random = require('/p/pancake/my/random.js');
const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');


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
// -- e7958b5e-360e-11e2-a60e-08edb9b907e8
// -- 6ed99ac9-9657-11e2-beb6-1078d2da50b0
// -- b20fe506-da73-4e81-a20e-bbe952a12a3e
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
  }

  async login(phone, code) {
    // TODO: return via http object with error
    if (!phone || !code) {
      console.log(`Not exist phone or code: ${phone} or ${code}`);
      return {};
    }
    let authData = await db.readOne('SELECT uuid, client_id, employee_id, token FROM auth_data WHERE uuid = $1', [ this.uuid ]);
    console.log('auth_data from db =', authData);
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
      console.log('resInsert=', resInsert);
    }

    let { client_id, employee_id } = authData;
    // FOR TEST |
    //          V
    employee_id = null;
    //          |

    if (client_id && !employee_id) {  // client login
      this.becomeClient_(client_id);
    } else if (client_id && employee_id) { // client-employee login
      this.becomeClientEmployee_(employee_id);
    } else {
      throw new Error('Not valid data', authData.data);
    }

    return {
      ok: true,
      data: {
        ClientID: client_id,
        EmployeeID: employee_id,
      }
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
    let employee_id = auth_data.employee_id;
    // TODO: Проверять, не истек ли token
    // FOR TEST |
    //          V
    employee_id = null;
    //          |

    const hashStatus = this.hashStatus;
    if (status === hashStatus.client && employee_id) { // if he BECAME a employee, repeat login
      await this.becomeClientEmployee_(employee_id);
      return (B === createClientCookie(this, client_id, A).B);
    } else if (status === hashStatus.clientEmployee && !employee_id) { // if he CEASED to be an client-employee, repeat login
      await this.becomeClient_(client_id);
      return true;
    } else {
      return false;
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

    const client_id = auth_data.client_id;
    const employee_id = auth_data.employee_id;
    if (!employee_id) { // if he CEASED to be an client-employee, repeat login
      await this.becomeClient_(client_id);
      return false;
    }
    const isLoginClient = (B === createClientCookie(this, client_id, A).B);
    const hashStatus = this.hashStatus;
    if (isLoginClient && status === hashStatus.client && employee_id) {
      this.becomeClientEmployee_(employee_id); // if he BECAME a employee, repeat login
      return true;
    } else if (status === hashStatus.clientEmployee) {
      // TODO: Проверять, не истек ли token
      return B === createClientEmployeeCookie(this, employee_id, A).B;
    }
  }

  isNotValidCookies_(A, B, status) {
    if (!A || !B) {
      return false;
    }
    status = parseInt(status, 10);
    if (!status) {
      return false;
    }
    return !Boolean(Object.keys(this.hashStatus).find(key => {
      return status === this.hashStatus[key];
    }));
  }

  becomeClient_(client_id) {
    const daysToLive = 90;
    const maxAge = daysToLive * 24 * 60 * 60 * 1000; // 3 month

    const { A, B, status } = createClientCookie(this, client_id);
    const cookiesApi = this.cookiesApi;

    console.log('A=', A);
    console.log('B=', B);
    console.log('status=', status);
    console.log('host', this.host);

    const cookieParam = { domain: this.host, maxAge, path: '/', httpOnly: false };
    cookiesApi.set('A', A, cookieParam);
    cookiesApi.set('B', B, cookieParam);
    cookiesApi.set('status', status, cookieParam);

    console.log('=== AUTH HOW CLIENT ===');
  }

  becomeClientEmployee_(employee_id) {
    const daysToLive = 90;
    const maxAge = daysToLive * 24 * 60 * 60 * 1000; // 3 month

    const { A, B, status } = createClientEmployeeCookie(this, employee_id);
    const cookiesApi = this.cookiesApi;

    console.log('A=', A);
    console.log('B=', B);
    console.log('status=', status);
    console.log('host', this.host);

    const path = '/';
    const cookieParam = { domain: this.host, maxAge, path: '/', httpOnly: false };
    cookiesApi.set('A', A, cookieParam);
    cookiesApi.set('B', B, cookieParam);
    cookiesApi.set('status', status, cookieParam);

    console.log('=== AUTH HOW CLIENT-EMPLOYEEE ===');
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




