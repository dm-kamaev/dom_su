"use strict";

function onlyUser(middleware) {
    return async function (ctx, next) {
        if (ctx.state.requestType.user){
            await middleware(ctx, next)
        } else {
            await next()
        }
    }
}

function onlyService(middleware) {
    return async function (ctx, next) {
        if (ctx.state.requestType.service){
            await middleware(ctx, next)
        } else {
            await next()
        }
    }
}

module.exports = {
    onlyUser,
    onlyService,
}