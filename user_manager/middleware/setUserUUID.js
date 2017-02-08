'use strict';
const { models, ErrorCodes, ModelsError } = require('models');
const { User } = models;
const uuid4 = require('uuid/v4')
const config = require('config')
const { QueueAsync } = require('../queue')
const { PancakeUser } = require('../pancakeUser')


async function setUserUUID(ctx, next) {
    ctx.state.queue = new QueueAsync()
    let needCreateUser = ctx.cookies.get('session_uid_dom') === undefined
    if (!needCreateUser){
        let user = await User.findOne({where: {uuid: ctx.cookies.get('session_uid_dom')}})
        if (user !== null){
            ctx.state.dom_user = {user_uuid: user.uuid, is_new: false, city: ctx.cities[user.data.city]}
        } else {
            needCreateUser = true;
        }
    }
    if (needCreateUser){
        const user_uuid = uuid4()
        ctx.cookies.set('session_uid_dom', user_uuid, {domain: config.cookie.domain, maxAge: 9*365*24*60*60*1000})
        ctx.state.dom_user = {user_uuid: user_uuid, is_new: true, city: ctx.cities.default}
        // queue
        ctx.state.queue.push(async function () {return await User.create({uuid: user_uuid, data: {city: ctx.cities.default.keyword}})})
    }
    await next();

    ctx.state.queue.do()
}
module.exports = {setUserUUID: setUserUUID}

