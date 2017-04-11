"use strict";

const Router = require('koa-router');
const { saveAndSend } = require('./store')
const { getServiceName } = require('statpages')
const logger = require('logger')(module)

const ticketRouter = new Router();

const POSSIBLE_TICKET_TYPES = {
    //'test': {name: 'string'},
    'mail_delivery': {mail: 'string'},
    'CallBack': { name: 'string', phone: 'string'},
    'Order': { phone: 'string'},
    'applicant_cleaner': { citizenship: 'string', birthdate: 'string', contact: 'string', name: 'string'},
    'get_contract': {mail: 'string'}
}

function validation(ticket) {
    if (POSSIBLE_TICKET_TYPES[ticket.type] !== undefined){
        for (let attr of Object.keys(POSSIBLE_TICKET_TYPES[ticket.type])){
            if (POSSIBLE_TICKET_TYPES[ticket.type][attr] !== typeof ticket.data[attr]){
                return false
            }
        }
        return true
    }
    return false
}

ticketRouter.post('/ticket-handler', async function (ctx, next) {
    ctx.type = 'application/json'
    let response = { Success: false }
    try{
        if (validation(ctx.request.body)){
            let data = ctx.request.body.data
            if (ctx.request.body.type == 'Order'){
                let service = getServiceName(ctx.state.pancakeUser.city, ctx.request.headers.referer)
                if (service){
                    data.service = service
                }
            }
            ctx.state.pancakeUser.sendTicket(ctx.request.body.type, data)
            response.Success = true
        }
    } catch (e) {
        logger.error(e)
    }
    ctx.body = JSON.stringify(response)
})

module.exports = {ticketRouter}