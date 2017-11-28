"use strict";

// PROXY REQUEST TO 1C

const Router = require('koa-router');
const Request1Cv3 = require('api1c/request1Cv3.js');
const decorators = require('staff/decorators.js');
const AuthApi = require('/p/pancake/auth/authApi.js');

const router = module.exports = new Router();

// proxy request from frontend to auth1C and return responce
// url –– /proxy_request/Employee.GetConversationList
// request –– {
//   "EmployeeID": "e7958b5e-360e-11e2-a60e-08edb9b907e8"
// }
// responce –– { "ok": true/false, "data": ..., "error": {"code": ..., "text": "..."}
// decorators.loginRequiredWithoutRedirect();
router.post('/proxy_request/:methodName', async function (ctx, next) {
  const methodName = ctx.params.methodName;
  const user = ctx.state.pancakeUser;
  const request1C = new Request1Cv3(user.auth1C.token, user.uuid);
  let body = ctx.request.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  let res;
  console.log(methodName, body);
  switch (methodName) {
    case 'Login':
      const authApi = new AuthApi(ctx);
      // await request1C.add('Auth.Login', body).do();
      // res = await authApi.login(body.phone, body.code);
      res = await authApi.login(body.Phone, body.Code);
      break;
    default:
      await request1C.add(methodName, body).do();
      res = request1C.get();
  }
  ctx.body = res;
});
