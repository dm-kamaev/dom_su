'use strict';

const logger = require('/p/pancake/lib/logger.js');
const Router = require('koa-router');
const internalClientAPI = new Router();
const serviceOrder = require('./methods/serviceOrder');
const serviceCalc = require('./methods/serviceCalc');

const { GetExecutionInfo } = require('./methods/getExecutionInfo');
const { CalculateOrder } = require('./methods/calculateOrder');
const { GetTimes } = require('./methods/getTimes');
const calculate = require('/p/pancake/internal_api/methods/calculate.js');


const Client = {
  CalculateOrder: CalculateOrder,
  GetExecutionInfo: GetExecutionInfo,
  ServiceOrder: serviceOrder,
  ServiceCalc: serviceCalc,
  GetTimes: GetTimes
};

internalClientAPI.post('/internalapi', async function(ctx) {
  const body = ctx.request.body;
  try {
    if (!body) {
      throw new Error('Internal API - Validate Error');
    }
    switch (body.Method) {
      case 'Client.CalculateOrder':
        return await Client.CalculateOrder(ctx);
      case 'Client.Calculate':
        return await calculate(ctx);
      case 'Client.GetExecutionInfo':
        return await Client.GetExecutionInfo(ctx);
      case 'Client.GetTimes':
        return await Client.GetTimes(ctx);
      case 'Common.GetTimeInfo':
        return await Client.ServiceCalc.GetDate(ctx);
      case 'Client.ServiceOrder.SendContactInfo':
        return await Client.ServiceOrder.SendContactInfo(ctx);
      case 'Client.ServiceOrder.SendTimeInfo':
        return await Client.ServiceOrder.SendTimeInfo(ctx);
      case 'Client.ServiceOrder.SendAdditionInfo':
        return await Client.ServiceOrder.SendAdditionInfo(ctx);
      case 'Client.ServiceOrder.SendAllInfo':
        return await Client.ServiceOrder.Create(ctx);
      case 'Client.ServiceOrder.NewOrder':
        return await Client.ServiceOrder.NewOrder(ctx);
      default:
        throw new Error(`Internal API - Name Method Error - ${body.Method}`);
    }
  } catch (e) {
    logger.warn('Internal API Error'+ e);
    logger.warn(JSON.strigify(body));
    ctx.body = {
      Success: false
    };
  }
});

module.exports = {
  internalClientAPI
};