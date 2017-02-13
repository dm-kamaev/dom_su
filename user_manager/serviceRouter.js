"use strict";

const Router = require('koa-router');
const serviceRouter = new Router();


async function handlerTrackingCall(ctx, next) {
    if (!ctx.request.body.channel || !ctx.request.body.phone){
        throw new Error(`Post call tracking param error - ${ctx.request.body}`)
    }
    await ctx.state.pancakeService.setTrackDone(ctx.request.body)
    ctx.body = ''
}

serviceRouter.post('/client_id/post_tracking_call/', handlerTrackingCall)


module.exports = {
    serviceRouter
}