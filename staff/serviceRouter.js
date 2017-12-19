'use strict';
const { models } = require('models')
const { PendingToken, Token } = models
const Router = require('koa-router');
const SECRET = '03wBqD195DzQ1a5dp6qM'
const logger = require('logger')(module, 'staff.log')
const { Method1C, Request1C } = require('api1c')

const staffServiceRouter = new Router();


staffServiceRouter.get('/staff/check_service', async function (ctx) {
    const request1C = new Request1C(null, null, '', '', true, ctx);
    let CheckAPI = new Method1C('CheckAPI', {})
    request1C.add(CheckAPI)
    await request1C.do()
    try{
        if (CheckAPI.response.Result != true){
        ctx.body = {'work': false}
        return
        }
        ctx.body = {'work': true}
        return
    } catch (e){
        ctx.body = {'work': false}
    }
})

staffServiceRouter.post('/staff/deactivate_token', async function (ctx) {
    let body = ctx.request.body
    if (body.SECRET != SECRET){
        throw Error('Error api secret')
    }
    let token = await Token.findOne({where: {user_uuid: body.Data.user_uuid, active: true}})
    if (token){
        token.active = false
        await token.save()
    }
    if (body.Data.pendingTokenKey){
        let pendingToken = await PendingToken.findOne({where: {key: body.Data.pendingTokenKey}})
        if (pendingToken){
            await pendingToken.destroy()
        }
    }

    ctx.body = { 'Success': true}
})

staffServiceRouter.post('/staff/pending_token', async function (ctx, next) {
    let body = ctx.request.body
    if (body.SECRET != SECRET){
        throw Error('Error api secret')
    }
    let { token, employeeUUID, clientUUID=null} = body.Data
    let pendingToken = await PendingToken.create({token: token, employee_uuid: employeeUUID, client_uuid: clientUUID})
    ctx.body = { 'Success': true, 'Data': {'key': pendingToken.key}}
})

staffServiceRouter.post('/staff/check_token', async function (ctx, next) {
    let body = ctx.request.body
    if (body.SECRET != SECRET){
        throw Error('Error api secret')
    }
    let authorized = false
    if (body.Data.user_uuid){
        let token = await Token.findOne({where: {active: true, user_uuid: body.Data.user_uuid}})
        if (token){
            authorized = true
        }
    }
    if (authorized == false && body.Data.pendingTokenKey){
        let pendingToken = await PendingToken.findOne({where: {key: body.Data.pendingTokenKey}})
        if (pendingToken){
            authorized = true
        }
    }
    ctx.body = { 'Success': true, 'Data': {'authorized': authorized}}
})


module.exports = {
    staffServiceRouter
}