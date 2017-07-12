"use strict";
const { eventType } = require('../event_type')


async function createEventRequest(ctx, next) {
    ctx.state.pancakeUser.createEvent({type: eventType.Request, data: {
        url: ctx.path,
        headers: ctx.request.headers,
        method: ctx.request.method,
        query: ctx.request.query
    }})

    await next()
}

module.exports = {createEventRequest: createEventRequest}