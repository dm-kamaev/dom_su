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
//   timestamp      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
// -- e7958b5e-360e-11e2-a60e-08edb9b907e8
// -- 6ed99ac9-9657-11e2-beb6-1078d2da50b0
// -- b20fe506-da73-4e81-a20e-bbe952a12a3e
module.exports = class AuthApi {
  constructor(ctx) {
    this.user = ctx.state.pancakeUser;
    this.uuid = this.user.uuid;
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
      // TODO: После изменения статуса соотрудника не меняется его token
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
      const authDataFrom1c = request1C.get().data;
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
      const A = this.uuid + random.str(10) + time.get().in_ms;
      const B = crypto.createHash('sha512')
                      .update(A)
                      .update(client_id)
                      .update(this.userAgent)
                      .update(SERVER_KEY_FOR_CLIENT)
                      .digest('hex');
      const status = this.hashStatus.client;
      const cookiesApi = this.cookiesApi;
      const host = this.host;
      console.log('ctx.cookies=', cookiesApi);
      console.log('A=', A);
      console.log('B=', B);
      console.log('status=', status);
      console.log('host', host);
      const daysToLive = 1;
      const maxAge = daysToLive * 60 * 60 * 24; // 1 day, change to 3 month
      const httpOnly = false;
      const path = '/';
      cookiesApi.set('A', A, { domain: host, maxAge, path: '/', httpOnly });
      cookiesApi.set('B', B, { domain: host, maxAge, path: '/', httpOnly });
      cookiesApi.set('status', status, { domain: host, maxAge, path: '/', httpOnly });
    } else if (client_id && employee_id) { // client-employee login

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

};