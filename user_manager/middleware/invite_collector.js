'use strict';

const CONF = require('/p/pancake/settings/config.js');
const phone_api = require('/p/pancake/lib/phone_api.js');
const city_api = require('/p/pancake/cities/city_api.js');
const logger = require('/p/pancake/lib/logger.js');
const tickets_store = require('/p/pancake/tickets/store.js');

const invite_collector = module.exports;

// /?invite=:uuid
invite_collector.send_to_1c = async function (ctx, next) {
  const invite = ctx.query.invite
  if (!invite){
    return await next();
  }

  try {
    tickets_store.saveAndSend('Invite', { user_id: ctx.state.pancakeUser.uuid, invite }, ctx);
  } catch (err) {
    logger.warn(err);
  }

  await next();
};
