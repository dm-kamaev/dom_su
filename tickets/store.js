"use strict";

const { Ticket } = require('models').models;
const { sendTicket } = require('./send');


/**
 * saveAndSend
 * @param  {String} type
 * @param  {Object} data
 * @param  {Object} ctx?
 * @return {sequalezi.model}
 */
async function saveAndSend(type, data, ctx) {

  if (ctx && ctx.state.pancakeUser) {
    data.google_id = ctx.state.pancakeUser.get_google_id();
  }

  const ticket = await Ticket.create({
    type,
    data
  })
    let response = await sendTicket(ticket.buildMessage())
    if (response.result == 'ok'){
        ticket.isSend = true
        await ticket.save()
    }
    return ticket

}

module.exports = { saveAndSend }