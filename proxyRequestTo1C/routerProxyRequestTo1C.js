"use strict";

// PROXY REQUEST TO 1C

const Router = require('koa-router');
const Request1Cv3 = require('api1c/request1Cv3.js');
const decorators = require('staff/decorators.js');

const router = module.exports = new Router();

// proxy request from frontend to auth1C and return responce
// url –– /proxy_request/Employee.GetConversationList
// request –– {
//   "EmployeeID": "e7958b5e-360e-11e2-a60e-08edb9b907e8"
// }
// responce –– { "ok": true/false, "data": ..., "error": {"code": ..., "text": "..."}
router.post('/proxy_request/:methodName', decorators.loginRequiredWithoutRedirect(async function (ctx, next) {
  const methodName = ctx.params.methodName;
  const user = ctx.state.pancakeUser;
  const request1C = new Request1Cv3(user.auth1C.token, user.uuid);
  let body = ctx.request.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }
  await request1C.add(methodName, body).do();
  ctx.body = request1C.get();
}));

