"use strict";

async function definitionRequestType(ctx, next) {
    if (ctx.headers['x-dom-service']){
        ctx.state.requestType = {service: true, user: false}
    } else {
        ctx.state.requestType = {service: false, user: true}
    }
    await next()
}

module.exports = {
    definitionRequestType
}