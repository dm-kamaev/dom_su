'use strict';

// PROXY REQUEST TO 1C

const Router = require('koa-router');
const Request1Cv3 = require('api1c/request1Cv3.js');
const AuthApi = require('/p/pancake/auth/authApi.js');
const check_auth = require('/p/pancake/auth/check_auth.js');
const review_store = require('/p/pancake/reviews/store.js');
// const logger = require('/p/pancake/lib/logger.js');

const router = module.exports = new Router();

// /proxy_request/Login
// {
//   "Phone": "79161387884",
//   "Code": "111"
// }
/* return ––
{
  "ok": true,
  "data": {
    "ClientID": "8e0420c8-8c8e-11e7-80e4-00155d594900",
    "cookies": [{
      "name": "A",
      "value": "556884d4-5cd6-45fc-bb51-dbf4cec9f43cFggwEaM2GF1513172070394",
      "params": {
        "domain": "www.dev2.domovenok.su",
        "maxAge": 7776000000,
        "path": "/",
        "httpOnly": false
      }
    }, {
      "name": "B",
      "value": "fd67ee9d2bf8836018e70c515b4088c75bfe2c809f22cbf5d1ee1327bbf97ecc09e60b938d260c50be5ee95b0400e5c9ca4353a92b9f60bee6643a17274f8dbb",
      "params": {
        "domain": "www.dev2.domovenok.su",
        "maxAge": 7776000000,
        "path": "/",
        "httpOnly": false
      }
    }, {
      "name": "status",
      "value": 1,
      "params": {
        "domain": "www.dev2.domovenok.su",
        "maxAge": 7776000000,
        "path": "/",
      }
    }]
  }
}*/
router.post('/proxy_request/Auth.Login', async function (ctx) {
  let body = ctx.request.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  const authApi = new AuthApi(ctx);
  let phone = body.Phone || '';
  let code = body.Code || '';
  if (phone) {
    phone = phone.replace(/[^\d]+/g, '');
  }
  if (code) {
    code = code.replace(/[^\d]+/g, '');
  }
  const res = await authApi.login(phone, code);
  ctx.status = 200;
  ctx.body = res;
});


router.post('/proxy_request/Auth.GetCode', async function (ctx) {
  let body = ctx.request.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }
  if (body.Phone) {
    body.Phone = body.Phone.replace(/[^\d]+/g, '');
  }
  const user = ctx.state.pancakeUser;
  const uuid = user.uuid;
  const request1C = new Request1Cv3(user.auth1C.token, uuid, null, ctx);
  await request1C.add('Auth.GetCode', body).do();
  const res = request1C.get();

  if (res.ok) {
    res.data['x-dom-auth'] = uuid; // add user uuid, for mobile app
  }
  ctx.body = res;
});


[ 'Client.Calculate', 'Client.GetOrderTimes', 'Client.ServiceOrder.NewOrder' ].forEach(method_name => {
  router.post('/proxy_request/'+method_name, get_open_method(method_name));
});

// proxy request from frontend to auth1C and return responce
// url –– /proxy_request/Employee.GetConversationList
// request –– {
//   "EmployeeID": "e7958b5e-360e-11e2-a60e-08edb9b907e8"
// }
// responce –– { "ok": true/false, "data": ..., "error": {"code": ..., "text": "..."}
// decorators.loginRequiredWithoutRedirect();
router.post('/proxy_request/:methodName', check_auth.ajax(async function (ctx) {
  const method_name = ctx.params.methodName;
  // TODO: Redirect to Login method
  let body = ctx.request.body;
  if (typeof body === 'string') {
    body = JSON.parse(body);
  }

  const user = ctx.state.pancakeUser;

  if (method_name === 'Client.GetDepartureList') {
    const authApi = new AuthApi(ctx);
    const auth_data = authApi.get_auth_data();
    const client_id = auth_data.client_id;
    body.ClientID = client_id;
  } else if (method_name === 'Client.SetOrderReview') {
    await review_store.create_review(ctx, body);
    // return;
  }

  const request1C = new Request1Cv3(user.auth1C.token, user.uuid, null, ctx);
  await request1C.add(method_name, body).do();
  const res = request1C.get();
  ctx.body = res;
}));


// {String} method_name Client.Calculate
function get_open_method(method_name) {
  return async function (ctx) {
    const authApi = new AuthApi(ctx);
    let token;
    if (await authApi.isLoginAsClient() || await authApi.isLoginAsClientEmployee()) {
      token = authApi.get_auth_data().token;
    }

    let body = ctx.request.body;
    const user = ctx.state.pancakeUser;
    const uuid = user.uuid;
    const request1C = new Request1Cv3(token, uuid, null, ctx);
    await request1C.add(method_name, body).do();
    const res = request1C.get();
    ctx.body = res;
  };
}


// ===========================================================

router.get('/test_auth/', async function (ctx) {
  const authApi = new AuthApi(ctx);

  const text =
  '<p style=font-size:190%>isLoginAsClient = ' + await authApi.isLoginAsClient()+ '</p>'+
  '<p style=font-size:190%>isLoginAsClientEmployee = ' + await authApi.isLoginAsClientEmployee()+ '</p>'+
  '<a href=/test_logout style=font-size:190%>LOGOUT</a>';

  // 'isLoginAsClient = ' + await authApi.isLoginAsClient()+ '\n'+
  // 'isLoginAsClientEmployee = ' + await authApi.isLoginAsClientEmployee()+ '\n';


  ctx.status = 200;
  ctx.body = text;
});


router.get('/test_logout/', async function (ctx) {
  const authApi = new AuthApi(ctx);

  authApi.logout();
  const text =
  '<p style=font-size:190%>success logout</p>'+
  '<a href=/test_auth style=font-size:190%>CHECK AUTH</a>';

  ctx.status = 200;
  ctx.body = text;
});
