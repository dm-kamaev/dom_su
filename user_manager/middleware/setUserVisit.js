'use strict';

const { models, ErrorCodes, ModelsError } = require('models');
const { Visit } = models;
const uuid4 = require('uuid/v4')

async function setUserVisit(ctx, next) {
    const user_uuid = ctx.state.dom_user.user_uuid;
    if (ctx.state.dom_user.is_new === true){
        // Visit attr
        const visit_uuid = uuid4();
        const data = {};
        // context
        ctx.state.dom_user.visit_uuid = visit_uuid;
        // queue
        ctx.state.queue.push(async function () {
            const visit = await Visit.create({uuid: visit_uuid, data: data, user_uuid: user_uuid})
            return visit.uuid
        })
    } else {
        // context
        ctx.state.dom_user.visit_uuid = false;
        // queue
        ctx.state.queue.push(async function () {
            let visit = await Visit.find({where:{user_uuid: user_uuid, active: true}})
            if (visit){
                return visit.uuid
            } else {
                const data = {};
                const visit_uuid = uuid4();
                let visit = await Visit.create({uuid: visit_uuid, data: data, user_uuid: user_uuid})
                return visit.uuid
            }
        })
    }
    await next()
}
module.exports = {setUserVisit: setUserVisit}

