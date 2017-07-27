"use strict";

const { models, ErrorCodes, ModelsError, scrollModel } = require('models')
const { Ticket } = models
const { sendTicket } = require('./send')



async function saveAndSend(type, data) {
    let ticket = await Ticket.create({type: type, data: data})
    let response = await sendTicket(ticket.buildMessage())
    if (response.result == 'ok'){
        ticket.isSend = true
        await ticket.save()
    }
    return ticket

}

module.exports = { saveAndSend }