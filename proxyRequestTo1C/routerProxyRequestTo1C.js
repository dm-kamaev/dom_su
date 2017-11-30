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
  switch (methodName) {
    case 'Login':
      const authApi = new AuthApi(ctx);
      res = await authApi.login(body.Phone, body.Code);
      // console.log('isLoginAsClient= ', await authApi.isLoginAsClient());
      // console.log('isLoginAsClientEmployee= ', await authApi.isLoginAsClientEmployee());
      break;
    default:
      await request1C.add(methodName, body).do();
      res = request1C.get();
  }
  ctx.body = res;
});

router.get('/test_auth/', async function (ctx, next) {
  const authApi = new AuthApi(ctx);

  const text =
  '<p style=font-size:190%>isLoginAsClient = ' + await authApi.isLoginAsClient()+ '</p>'+
  '<p style=font-size:190%>isLoginAsClientEmployee = ' + await authApi.isLoginAsClientEmployee()+ '</p>'+
  '<a href=/test_logout style=font-size:190%>LOGOUT</a>';

  ctx.status = 200;
  ctx.body = text;
});


router.get('/test_logout/', async function (ctx, next) {
  const authApi = new AuthApi(ctx);

  authApi.logout();
  const text =
  '<p style=font-size:190%>success logout</p>'+
  '<a href=/test_auth style=font-size:190%>CHECK AUTH</a>';

  ctx.status = 200;
  ctx.body = text;
});