"use strict";

const { models, ErrorCodes, ModelsError } = require('models');
const { Event } = models;
const uuid4 = require('uuid/v4');

function taskEventCreate (opts) {
    let { visit_uuid, token_uuid, type, data} = opts
    if (type == undefined){
        throw new Error()
    }
    return async function (callback_visit_uuid) {
        if (visit_uuid == undefined){
            visit_uuid = callback_visit_uuid
        }
        await Event.create({
            visit_uuid: visit_uuid,
            token_uuid: token_uuid,
            data: data,
            type: type,
        })
        return visit_uuid
    }
}

module.exports = {taskEventCreate: taskEventCreate}