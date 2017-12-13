"use strict";
const { SingleRequest1C } = require('api1c')
const uuid4 = require('uuid/v4')


async function SendTimeInfo(ctx) {
    let param = ctx.request.body.Param
    let singleRequest = new SingleRequest1C('Client.ServiceOrder.SendTimeInfo', param, null, ctx.state.pancakeUser.uuid)
    let response1C = await singleRequest.do()
    ctx.body = { "Success": true }
}



async function SendAdditionInfo(ctx) {
    let param = ctx.request.body.Param
    let singleRequest = new SingleRequest1C('Client.ServiceOrder.SendAdditionInfo', param, null, ctx.state.pancakeUser.uuid)
    let response1C = await singleRequest.do()
    ctx.body = { 'Success': true }
}

async function Create(ctx) {
    let param = ctx.request.body.Param
    if (!ctx.request.body.Param.city){
        param.city = ctx.state.pancakeUser.city.keyword
    }
    let singleRequest = new SingleRequest1C('Client.ServiceOrder.Create', param, null, ctx.state.pancakeUser.uuid)
    let response1C = await singleRequest.do()
    ctx.body = { 'Success': true }
}

async function SendContactInfo(ctx) {
    let param = ctx.request.body.Param
    const serviceOrderUUID = uuid4()
    param.city = ctx.state.pancakeUser.city.keyword
    param.uuid = serviceOrderUUID
    let singleRequest = new SingleRequest1C('Client.ServiceOrder.SendContactInfo', param, null, ctx.state.pancakeUser.uuid)
    let response1C = await singleRequest.do()
    ctx.body = {
        'Data': {
            'date': response1C.date,
            'timezone': response1C.timezone,
            'amountwithdiscount': response1C.amountwithdiscount,
            'uuid': serviceOrderUUID,

        },
        'Success': true
    }
}


async function NewOrder(ctx) {
  const param = ctx.request.body.Param;
  const user = ctx.state.pancakeUser;
  if (!param.city){
    param.Сity = user.city.keyword;
  }
  console.log('NewOrder param=', param);
  const singleRequest = new SingleRequest1C('Client.ServiceOrder.NewOrder', param, null, user.uuid);
  const response1C = await singleRequest.do();
  ctx.body = { 'Success': true };
}

module.exports = {
  SendTimeInfo,
  SendContactInfo,
  SendAdditionInfo,
  Create,
  NewOrder
};