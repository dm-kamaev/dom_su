'use strict';
const { models, ErrorCodes, ModelsError } = require('models');
const { User } = models;
const uuid4 = require('uuid/v4')
const config = require('config')
const {QueueAsync} = require('../queue')



async function setUserUUID(ctx, next) {
    ctx.state.queue = new QueueAsync()
    if (ctx.cookies.get('session_uid_dom') !== undefined){
        ctx.state.dom_user = {user_uuid: ctx.cookies.get('session_uid_dom'), is_new: false}
    } else {
        const user_uuid = uuid4()
        ctx.cookies.set('session_uid_dom', user_uuid, {domain: config.cookie.domain, maxAge: 9*365*24*60*60*1000})
        ctx.state.dom_user = {user_uuid: user_uuid, is_new: true}
        // queue
        ctx.state.queue.push(async function () {return await User.create({uuid: user_uuid, param: {}})})
    }

    await next();

    ctx.state.queue.do()
}
module.exports = {setUserUUID: setUserUUID}

