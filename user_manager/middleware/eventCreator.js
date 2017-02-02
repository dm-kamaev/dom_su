"use strict";

const { models, ErrorCodes, ModelsError } = require('models');
const { Event } = models;
const uuid4 = require('uuid/v4');

async function eventCreator(ctx, next) {
    Event.create({
        uuid: uuid4(),
        visit_uuid: ctx.state.dom_user.visit_uuid,
        data: {url: ctx.path},
        type: 'OpenPage',
    })
        .catch(e=>{console.log(e)});
    await next()
}

module.exports = {eventCreator: eventCreator}