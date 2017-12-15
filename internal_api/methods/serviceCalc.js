'use strict';
const { SingleRequest1C } = require('api1c');


async function GetDate(ctx) {
  const param = ctx.request.body.Param || {};
  //param.city = 'moscow'
  param.city = ctx.state.pancakeUser.city.keyword;
  const singleRequest = new SingleRequest1C(
    'Common.GetTimeInfo',
    param,
    null,
    ctx.state.pancakeUser.uuid,
    null,
    null,
    ctx
  );
  const response1C = await singleRequest.do();
  ctx.body = {
    'Data': {
      'date': response1C.date,
      'timezone': response1C.timezone
    },
    'Success': true
  };
}

module.exports = {
  GetDate,
};