'use strict';

const { models, ErrorCodes, ModelsError } = require('models');
const { Visit } = models;
const uuid4 = require('uuid/v4')

async function setUserVisit(ctx, next) {
    const user_uuid = ctx.state.dom_user.user_uuid;
    if (ctx.state.dom_user.isNew === true){
        // Visit attr
        const visitUUID = uuid4();
        const data = {};

        ctx.state.dom_user.visit_uuid = visitUUID;

        // async
        Visit.create({uuid: visitUUID, data: data, user_uuid: user_uuid})
    } else {
        const visit = await Visit.findOne({where: {user_uuid: user_uuid, end: null}})
        await visit.update({})
        //const visit = await Visit.update({},{where: {user_uuid: user_uuid}, limit: 1})
        //console.log(visit)
        ctx.state.dom_user.visit_uuid = visit.uuid;
    }
    await next()
}
module.exports = {setUserVisit: setUserVisit}

