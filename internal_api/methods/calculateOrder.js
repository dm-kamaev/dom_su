'use strict';
const { SingleRequest1C } = require('api1c');

async function CalculateOrder(ctx) {
  const param = ctx.request.body.Param;
  param.city = ctx.state.pancakeUser.city.keyword;
  const singleRequest = new SingleRequest1C(
    'Client.CalculateOrder',
    param,
    null,
    ctx.state.pancakeUser.uuid,
    null, // ip
    null, // userAgent
    ctx
  );
  let response1C = await singleRequest.do();
  ctx.body = {
    'Data': response1C,
    'Success': true
  };
}

module.exports = {
  CalculateOrder
};