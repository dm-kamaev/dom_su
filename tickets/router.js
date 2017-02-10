"use strict";

const Router = require('koa-router');
const { saveAndSend } = require('./store')

const ticketRouter = new Router();

const POSSIBLE_TICKET_TYPES = {
    'test': {name: 'string'},
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
    console.log(ctx.request.body)
    let test_ticket = {type: 'test', data: {name: 'Ruslan', 'test': 'abs'}}
    if (validation(test_ticket)){
        ctx.state.pancakeUser.sendTicket(test_ticket.type, test_ticket.body)
    }
    ctx.type = 'application/json'
    ctx.body = JSON.stringify({ Success: true })
})

module.exports = {ticketRouter}