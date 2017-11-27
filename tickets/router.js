"use strict";

const Router = require('koa-router');
const { saveAndSend } = require('./store');
const { getServiceName } = require('statpages');
const logger = require('logger')(module);

const ticketRouter = new Router();

const POSSIBLE_TICKET_TYPES = {
    //'test': {name: 'string'},
    'mail_delivery': {mail: 'string'},
    'CallBack': { name: 'string', phone: 'string'},
    'Order': { phone: 'string'},
    'applicant_cleaner': { citizenship: 'string', birthdate: 'string', contact: 'string', name: 'string'},
    'get_contract': {mail: 'string'},
    'get_contract_contact_info': {name: 'string', phone: 'string'}
};


function validation(ticket) {
  const ticket_type = ticket.type;
  if (POSSIBLE_TICKET_TYPES[ticket_type]) {
    for (let attr of Object.keys(POSSIBLE_TICKET_TYPES[ticket_type])) {
      ticket.data = ticket.data || {};
      if (POSSIBLE_TICKET_TYPES[ticket_type][attr] !== typeof ticket.data[attr]) {
        return false;
      }
    }
    return true;
  }
  return false;
}

ticketRouter.get('/ticket-handler', async function (ctx, next) {
  const response = { Success: false }
  try{
    const body = ctx.query;
    // If new type request, then create field data from body (assign because problem with JSON.stringify for circular object)
    // else old type request
    body.data = (!body.data) ? Object.assign({}, body) : body.data;
     if (validation(body)) {
      const { type, data}  = body;
      if (type == 'Order'){
        let service = getServiceName(ctx.state.pancakeUser.city, ctx.request.headers.referer)
        if (service){
          data.service = service;
        }
      }
      ctx.state.pancakeUser.sendTicket(type, data);
      response.Success = true;
    }
  } catch (e) {
      logger.error(e);
  }
  ctx.body = response;
});


ticketRouter.post('/ticket-handler', async function (ctx, next) {
  ctx.type = 'application/json'
  const response = { Success: false }
  try{
    const body = ctx.request.body;
    // If new type request, then create field data from body (assign because problem with JSON.stringify for circular object)
    // else old type request
    console.log(ctx.request.data);
    body.data = (!body.data) ? Object.assign({}, body) : body.data;
    console.log('BEFORE IF');
    if (validation(body)) {
      const { type, data}  = body;
      if (type == 'Order'){
        let service = getServiceName(ctx.state.pancakeUser.city, ctx.request.headers.referer)
        if (service){
          data.service = service;
        }
      }
      ctx.state.pancakeUser.sendTicket(type, data);
      response.Success = true;
    }
  } catch (e) {
      console.log('CATCH', e);
      logger.error(e);
  }
  ctx.body = JSON.stringify(response);
});

module.exports = {ticketRouter}