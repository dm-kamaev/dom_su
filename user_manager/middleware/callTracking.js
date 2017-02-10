"use strict";

async function callTracking(ctx, next) {
    if (ctx.state.pancakeUser.checkTrackNeed()){
        ctx.state.pancakeUser.setTrackWaiting(true)
        await ctx.state.pancakeUser.setTrackNumber()
    } else {
        ctx.state.pancakeUser.setTrackWaiting(false)

    }
    await next()
}

module.exports = {callTracking}