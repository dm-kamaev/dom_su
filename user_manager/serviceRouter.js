"use strict";

const Router = require('koa-router');
const userManagerServiceRouter = new Router();
const logger = require('/p/pancake/lib/logger.js');
const json = require('/p/pancake/my/json.js');

userManagerServiceRouter.post('/service/calltracking', async function handlerTrackingCall(ctx, next) {
  // logger.log(`handler_tracking_call5:: body= ${JSON.stringify(ctx.request.body)}`);
  if (!ctx.request.body.channel || !ctx.request.body.phone) {
    throw new Error(`Post call tracking param error - ${ctx.request.body}`);
  }
  // logger.log('handler_tracking_call5:: setTrackDone');
  await ctx.state.pancakeService.setTrackDone(ctx.request.body)
  ctx.body = ''
});


module.exports = {
    userManagerServiceRouter
}