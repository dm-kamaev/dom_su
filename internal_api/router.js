"use strict";

const Router = require('koa-router');
const internalAPI = new Router({
    prefix: '/api'
});

const Secret = "1Ac0uGgbLLA6eUpkV4gh"

const { models, ErrorCodes, ModelsError } = require('models')
const { Phone, User, Visit, Event, Token } = models
const { eventType } = require('user_manager')

internalAPI.post('/modification', async function (ctx, next) {
    const availableModels = {'Phone': Phone}
})

internalAPI.post('/user', async function (ctx, next) {
    /*
    {
        "Secret": "...",
        "Data": {
            "uuid": "..."
        }
    }
     */
    if (ctx.request.body.Secret === Secret){
        const user = await User.create({uuid: ctx.request.body.Data.uuid})
        const visit = await Visit.create({user_uuid: user.uuid})
        const event = await Event.create({visit_uuid: visit.uuid, type: eventType.NewUserFromPrivate})
        ctx.body = 'OK'
    } else{
        throw new Error("Internal API | Secret error ")
    }
})

internalAPI.post('/token', async function (ctx, next) {
    /*
    {
        "Secret": "...",
        "Data": {
            "uuid": "...",
            "token": "...",
            "employee_uuid": "...",
            "client_uuid": "...",
            "activate": true/false
        }
    }
     */
    if (ctx.request.body.Secret === Secret) {
        let currentEventType;
        const user = await User.find({where: {uuid: ctx.request.body.Data.uuid}})
        if (user == null) {
            const user = await User.create({uuid: ctx.request.body.Data.uuid})
            const visit = await Visit.create({user_uuid: user.uuid})
            const eventNewUser = await Event.create({visit_uuid: visit.uuid, type: eventType.NewUserFromPrivate})
        }
        if (ctx.request.body.Data.activate === False) {
            const token = await Token.create({
                token: ctx.request.body.Data.token,
                user_uuid: user.uuid,
                employee_uuid: ctx.request.body.Data.employee_uuid,
                client_uuid: ctx.request.body.Data.client_uuid,
            })
            currentEventType = eventType.NewTokenFromPrivate
        } else {
            await Token.update({active: false}, {where: {uuid: ctx.request.body.Data.token}})
            currentEventType = eventType.DeactivateTokenFromPrivate
        }
        let visit = await Visit.find({where: {user_uuid: user.uuid, active: true}})
        if (!visit) {
            const data = {};
            const visit_uuid = uuid4();
            let visit = await Visit.create({uuid: visit_uuid, data: data, user_uuid: user_uuid})
            const eventTokenChange = await Event.create({visit_uuid: visit.uuid, type: currentEventType, token_uuid: token.uuid})
            ctx.body = 'OK'
        } else {
            throw new Error("Internal API | Secret error ")
        }
    }
})

module.exports = { internalAPI }