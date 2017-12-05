"use strict";

// PROXY REQUEST TO 1C

const Router = require('koa-router');
const Request1Cv3 = require('api1c/request1Cv3.js');
const AuthApi = require('/p/pancake/auth/authApi.js');

const router = module.exports = new Router();

// /proxy_request/Login
// {
//   "Phone": "79161387884",
//   "Code": "111"
// }
// return –– {
//   "ok": true,
//   "data": {
//     "ClientID": "6ed99ac9-9657-11e2-beb6-1078d2da50b0",
//     "EmployeeID": "e7958b5e-360e-11e2-a60e-08edb9b907e8"
//   }
// }
router.post('/proxy_request/Auth.Login', async function (ctx, next) {
  const methodName = ctx.params.methodName;
  let body = ctx.request.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  const authApi = new AuthApi(ctx);
  const res = await authApi.login(body.Phone, body.Code);

  // let request1C = new Request1C(meta);

  // let GetCommon = new Method1C('Client.GetCommon', { ClientID: meta.token.clientId });
  // let GetDepartureList = new Method1C('Client.GetDepartureList', {Filter: {Status: "Active"}});
  // let GetDeparture = new Method1C('Client.GetDeparture');
  // let GetSchedule = new Method1C('Client.GetScheduleNEW');
  // request1C.add(GetCommon, GetDepartureList, GetDeparture, GetSchedule)

  ctx.status = 200;
  ctx.body = res;
});


router.post('/proxy_request/Auth.GetCode', async function (ctx, next) {
  let body = ctx.request.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }
  const user = ctx.state.pancakeUser;
  const request1C = new Request1Cv3(user.auth1C.token, user.uuid);
  await request1C.add('Auth.GetCode', body).do();
  const res = request1C.get();
  ctx.body = res;
});


// proxy request from frontend to auth1C and return responce
// url –– /proxy_request/Employee.GetConversationList
// request –– {
//   "EmployeeID": "e7958b5e-360e-11e2-a60e-08edb9b907e8"
// }
// responce –– { "ok": true/false, "data": ..., "error": {"code": ..., "text": "..."}
// decorators.loginRequiredWithoutRedirect();
router.post('/proxy_request/:methodName', loginRequiredWithoutRedirect(async function (ctx, next) {
  const methodName = ctx.params.methodName;
  // TODO: Redirect to Login method
  let body = ctx.request.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  const user = ctx.state.pancakeUser;
  // console.log('user', user);
  const request1C = new Request1Cv3(user.auth1C.token, user.uuid);
  await request1C.add(methodName, body).do();
  const res = request1C.get();
  ctx.body = res;
}));


function loginRequiredWithoutRedirect(routerFunc) {
    return async function (ctx, next) {
        const authApi = new AuthApi(ctx);
        let authData;
        if (await authApi.isLoginAsClient()) {
          authData = authApi.getAuthData();
        }
        const user = ctx.state.pancakeUser;
        // auth1C –– {
        //   token: null,
        //   employee_uuid: null,
        //   client_uuid: null,
        //   uuid: null,
        //   model: null
        // }
        let auth1C = await user.getAuth1C();
        console.log('ctx.state.pancakeUser.uuid', user.uuid);
        console.log('auth1C', auth1C);
        console.log('authData=', authData);
        if (!auth1C.token && authData) {
          await user.setAuth1C(authData);
        }
        if (auth1C.token != null) {
            await routerFunc(ctx, next);
        } else {
            ctx.status = 200;
            ctx.body = {
              ok: false, // ЗАМЕНИТЬ НА FALSE
              error: {
                code: -3,
                text: 'Access denied',
              }
            };
        }
    }
};


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