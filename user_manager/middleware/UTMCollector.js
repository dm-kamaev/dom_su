'use strict';

const UTMS_NAME = ['utm_medium', 'utm_source', 'utm_campaign', 'utm_term', 'utm_content', 'utm_referrer'];
const phone_api = require('/p/pancake/lib/phone_api.js');
const city_api = require('/p/pancake/cities/city_api.js');

async function UTMCollector(ctx, next) {
  let utm = {};
  // Google UTMS
  if (ctx.query.campaignid){
    utm['utm_medium'] = 'cpc';
    utm['utm_source'] = 'google';
    utm['utm_campaign'] = ctx.query.campaignid;
    if (ctx.query['utm_term']){
      utm['utm_term'] = ctx.query['utm_term'];
    }
    if (ctx.query['utm_content']){
      utm['utm_content'] = ctx.query['utm_content'];
    }
  } else {
    for (let name of UTMS_NAME){
      if (ctx.query[name]){
        utm[name] = ctx.query[name];
      }
    }
  }


  const is_2gis_reffer = (utm.utm_source === '2gis.ru' && utm.utm_medium === 'referral' && utm.utm_referrer === '2gis.ru');
  if (is_2gis_reffer) {
    // https://nn.domovenok.su/?utm_source=2gis.ru&utm_medium=referral&utm_referrer=2gis.ru
    // https://nn.dev2.domovenok.su/?utm_source=2gis.ru&utm_medium=referral&utm_referrer=2gis.ru
    if (city_api.is_nn(ctx)) {
      phone_api.set_for_from_2gis(ctx, '78312281061');
    // https://spb.domovenok.su/?utm_source=2gis.ru&utm_medium=referral&utm_referrer=2gis.ru
    // https://spb.dev2.domovenok.su/?utm_source=2gis.ru&utm_medium=referral&utm_referrer=2gis.ru
    } else if (city_api.is_spb(ctx)) {
      phone_api.set_for_from_2gis(ctx, '78124493114');
    }
  }

  if (Object.keys(utm).length !== 0){
    ctx.state.pancakeUser.saveUTMS(utm);
  }
  await next();
}

module.exports = {
  UTMCollector
};