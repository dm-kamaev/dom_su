"use strict";

const Router = require('koa-router');
const userManagerServiceRouter = new Router();


async function handlerTrackingCall(ctx, next) {
    if (!ctx.request.body.channel || !ctx.request.body.phone){
        throw new Error(`Post call tracking param error - ${JSON.stringify(ctx.request.body)}`)
    }
    await ctx.state.pancakeService.setTrackDone(ctx.request.body)
    ctx.body = ''
}

userManagerServiceRouter.post('/service/calltracking', handlerTrackingCall)

userManagerServiceRouter.post('/api/calltracking', handlerTrackingCall)


module.exports = {
    userManagerServiceRouter
}