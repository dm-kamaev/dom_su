"use strict";

const { models, ErrorCodes, ModelsError } = require('models');
const { Event } = models;
const uuid4 = require('uuid/v4');
const { eventType } = require('./event_type')

function taskEventCreate (opts) {
    let { type, data} = opts
    if (type == undefined){
        throw new Error()
    }
    return async function (previousResult, pancakeUser) {

        let event = await Event.create({
            visit_uuid: pancakeUser.visit_uuid,
            // token_uuid: pancakeUser.auth1C.uuid,
            data: data,
            type: type,
        })
        if (type == eventType.Request) {
            pancakeUser.request_event_uuid = event.uuid
        }
        return event
    }
}

module.exports = {taskEventCreate: taskEventCreate}