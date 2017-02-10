"use strict";

async function LUIDHandler(ctx, next) {
    if (ctx.query.luid){
        ctx.state.pancakeUser.clientConnect(ctx.query.luid)
    }

    await next()
}

module.exports = {
    LUIDHandler
}