"use strict";

const logger = require('logger')(module)
const Router = require('koa-router');
const internalClientAPI = new Router();
const serviceOrder = require('./methods/serviceOrder')
const serviceCalc = require('./methods/serviceCalc')

const { GetExecutionInfo } = require('./methods/getExecutionInfo')
const { CalculateOrder } = require('./methods/calculateOrder')
const { GetTimes } = require('./methods/getTimes')
const calculate = require('/p/pancake/internal_api/methods/calculate.js');


function validateRequest(body) {
  return true
}

internalClientAPI.post('/internalapi', async function (ctx, next) {
  try {
    if (validateRequest(ctx.request.body)){
      switch (ctx.request.body.Method) {
        case 'Client.CalculateOrder':
          return await Client.CalculateOrder(ctx);
        case 'Client.Calculate':
          return await calculate(ctx);
        case 'Client.GetExecutionInfo':
          return await Client.GetExecutionInfo(ctx)
        case 'Client.GetTimes':
          return await Client.GetTimes(ctx)
        case 'Common.GetTimeInfo':
          return await Client.ServiceCalc.GetDate(ctx)
        case 'Client.ServiceOrder.SendContactInfo':
          return await Client.ServiceOrder.SendContactInfo(ctx)
        case 'Client.ServiceOrder.SendTimeInfo':
          return await Client.ServiceOrder.SendTimeInfo(ctx)
        case 'Client.ServiceOrder.SendAdditionInfo':
          return await Client.ServiceOrder.SendAdditionInfo(ctx)
        case 'Client.ServiceOrder.SendAllInfo':
          return await Client.ServiceOrder.Create(ctx)
        default:
          throw new Error(`Internal API - Name Method Error - ${ctx.request.body.Method}`)
      }
    } else {
      throw new Error('Internal API - Validate Error')
    }
  } catch (e) {
    logger.error('Internal API Error')
    logger.error(e)
    ctx.body = {'Success': false }
  }
})

module.exports = {
  internalClientAPI
}





const Client = {
  CalculateOrder: CalculateOrder,
  GetExecutionInfo: GetExecutionInfo,
  ServiceOrder: serviceOrder,
  ServiceCalc: serviceCalc,
  GetTimes: GetTimes
}
