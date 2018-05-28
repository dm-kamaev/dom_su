"use strict";

const { models, ErrorCodes, ModelsError } = require('models');
const { Event } = models;
const uuid4 = require('uuid/v4');
const { eventType } = require('./event_type')
const logger = require('/p/pancake/lib/logger.js');

function taskEventCreate (opts) {
    let { type, data} = opts
    if (type == undefined){
        throw new Error()
    }
    return async function (previousResult, pancakeUser) {

        if (pancakeUser.is_robot) {
          // console.log('LOG === ', pancakeUser.is_robot);
          // console.log(pancakeUser.ctx.request.headers);
          return;
        }

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