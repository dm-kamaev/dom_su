'use strict';
const { models, ErrorCodes, ModelsError } = require('models');
const { User } = models;
const uuid4 = require('uuid/v4')
const config = require('config')

async function setUserUUID(ctx, next) {
    if (ctx.cookies.get('session_uid_dom') !== undefined){
        ctx.state.dom_user = {user_uuid: ctx.cookies.get('session_uid_dom'), isNew: false}
    } else {
        const user_uuid = uuid4()
        ctx.cookies.set('session_uid_dom', user_uuid, {domain: config.cookie.domain, maxAge: 9*365*24*60*60*1000})
        ctx.state.dom_user = {user_uuid: user_uuid, isNew: true}
        // async
        User.create({uuid: user_uuid, param: {}})
    }
    await next()
    new Promise((reslove, reject) => {
        setTimeout(function () {
            console.log('test')
            reslove()
        },
        20000)
    })
}
module.exports = {setUserUUID: setUserUUID}

