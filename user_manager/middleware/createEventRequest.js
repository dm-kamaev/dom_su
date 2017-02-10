"use strict";
const { eventType } = require('../event_type')


async function createEventRequest(ctx, next) {
    ctx.state.pancakeUser.createEvent({type: eventType.Request, data: {url: ctx.path}})

    await next()
}

module.exports = {createEventRequest: createEventRequest}