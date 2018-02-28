'use strict';
const { SingleRequest1C } = require('api1c');
const uuid4 = require('uuid/v4');
const AuthApi = require('/p/pancake/auth/authApi.js');

// param –– {
//   'waiting': true,
//   'date': '2017-03-27T16:00:00Z',
//   'timezone': '+03:00',
//   'uuid': 'fff08ff4-82ba-4072-8b39-1a42304004e0', // uuid generate with Client.ServiceOrder.SendContactOrder
// }
async function SendTimeInfo(ctx) {
  let param = ctx.request.body.Param;
  const authApi = new AuthApi(ctx);
  await authApi.isLoginAsClient();
  const { uuid, token } = authApi.get_auth_data();
  const singleRequest = new SingleRequest1C('Client.ServiceOrder.SendTimeInfo', param, token, uuid, null, null, ctx);
  await singleRequest.do();
  ctx.body = { 'Success': true };
}



async function SendAdditionInfo(ctx) {
  let param = ctx.request.body.Param;
  const authApi = new AuthApi(ctx);
  await authApi.isLoginAsClient();
  const { uuid, token } = authApi.get_auth_data();
  let singleRequest = new SingleRequest1C('Client.ServiceOrder.SendAdditionInfo', param, token, uuid, null, null, ctx);
  await singleRequest.do();
  ctx.body = { 'Success': true };
}

async function Create(ctx) {
  let param = ctx.request.body.Param;
  if (!ctx.request.body.Param.city){
    param.city = ctx.state.pancakeUser.city.keyword;
  }
  const authApi = new AuthApi(ctx);
  await authApi.isLoginAsClient();
  const { uuid, token } = authApi.get_auth_data();
  let singleRequest = new SingleRequest1C('Client.ServiceOrder.Create', param, token, uuid, null, null, ctx);
  await singleRequest.do();
  ctx.body = { 'Success': true };
}

async function SendContactInfo(ctx) {
  let param = ctx.request.body.Param;
  const serviceOrderUUID = uuid4();
  param.city = ctx.state.pancakeUser.city.keyword;
  param.uuid = serviceOrderUUID;

  const authApi = new AuthApi(ctx);
  await authApi.isLoginAsClient();
  const { uuid, token } = authApi.get_auth_data();

  let singleRequest = new SingleRequest1C('Client.ServiceOrder.SendContactInfo', param, token, uuid, null, null, ctx);
  let response1C = await singleRequest.do();
  ctx.body = {
    'Data': {
      'date': response1C.date,
      'timezone': response1C.timezone,
      'amountwithdiscount': response1C.amountwithdiscount,
      'uuid': serviceOrderUUID,

    },
    'Success': true
  };
}


async function NewOrder(ctx) {
  const param = ctx.request.body.Param;
  const user = ctx.state.pancakeUser;
  param.City = user.city.keyword;

  const authApi = new AuthApi(ctx);
  await authApi.isLoginAsClient();
  const { uuid, token } = authApi.get_auth_data();

  const singleRequest = new SingleRequest1C('Client.ServiceOrder.NewOrder', param, token, uuid, null, null, ctx);
  await singleRequest.do();
  ctx.body = { 'Success': true };
}

module.exports = {
  SendTimeInfo,
  SendContactInfo,
  SendAdditionInfo,
  Create,
  NewOrder
};