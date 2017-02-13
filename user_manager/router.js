"use strict";

const Router = require('koa-router');
const userManagerRouter = new Router();


async function handlerTrackingCall(ctx, next) {
    if (!ctx.request.body.channel || !ctx.request.body.phone){
        throw new Error(`Post call tracking param error - ${ctx.request.body}`)
    }
    await ctx.state.pancakeUser.setTrackDone(ctx.request.body)
    ctx.body = ''
}

userManagerRouter.post('/client_id/post_tracking_call/', handlerTrackingCall)


module.exports = {
    userManagerRouter
}