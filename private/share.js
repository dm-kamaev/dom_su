'use strict';

// const CONF = require('/p/pancake/settings/config.js');
const wf = require('/p/clientPA/my/wf.js');
const mstch = require('mustache');
// const time = require('/p/clientPA/my/time.js');
// const logger = require('/p/clientPA/lib/logger.js');
const AuthApi = require('/p/pancake/auth/authApi.js');
const Magic_url = require('/p/pancake/private/Magic_url.js');
const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');
const PromoCode = require('/p/pancake/private/mongo_models/PromoCode.js');
const load_data_from_1c = require('/p/pancake/private/load_data_from_1c.js');
const render_vue_template = require('/p/pancake/private/render_vue_template.js');

const TEMPLATE_PATH = '/p/clientPA/template/share.html';

const share = exports;




// /private/share/cln8e0420c88c8e11e780e400155d594900
share.render_page_share = async function (ctx, uuidMUVal0) {
  uuidMUVal0 = transform_to_client_id(uuidMUVal0);
  const authApi = new AuthApi(ctx);
  const is_login = await authApi.isLoginAsClient();
  // console.log('is_login=', is_login);
  if (is_login) {
    // console.log('is_auth');
    const { client_id } = authApi.get_auth_data();
    if (uuidMUVal0 !== client_id) {
      ctx.redirect('/private' + new Magic_url('share').client(client_id).buildUrl());
      return;
    }
    // console.log('render_vuejs');
    await render_vue_template(ctx);
  } else {
    // console.log('not_auth');
    const result = await Promise.all([
      load_data_from_1c.for_menu_client_pa(ctx, { uuid: ctx.state.pancakeUser.uuid }),
      PromoCode.getPromo(uuidMUVal0),
      await wf.read(TEMPLATE_PATH)
    ]);
    const context = result[0];
    context.PromoCode = result[1];
    const template = result[2].toString();
    // addCsrf(req, context, meta);

    context.inviteUrl = ctx.request.url;
    if (context.PromoCode) {
      // console.log('PromoCode in mongodb', context.PromoCode);
      ctx.status = 200;
      ctx.body = mstch.render(template, context);
    } else {
      const result1C = await get_promo_code_from_1c(ctx, uuidMUVal0);
      // console.log('PromoCode from 1C', result1C);
      if (result1C.PromoCode) {
        ctx.status = 200;
        ctx.body = mstch.render(template, result1C);
        PromoCode.make(uuidMUVal0, result1C.PromoCode);
      } else {
        throw new Error(`Client don't have promo | clientId- ${uuidMUVal0}`);
      }
    }
  }
};

// OLD INVITE FRIEND
// /share/cln8e0420c88c8e11e780e400155d594900
share.render_old_page_share = async function (ctx, uuidMUVal0) {
  uuidMUVal0 = transform_to_client_id(uuidMUVal0);
  const authApi = new AuthApi(ctx);
  const is_login = await authApi.isLoginAsClient();
  if (is_login) {
    const { client_id } = authApi.get_auth_data();
    ctx.redirect('/private'+new Magic_url('share').client(client_id).buildUrl());
  } else {
    // console.log('not_auth');
    const result = await Promise.all([
      load_data_from_1c.for_menu_client_pa(ctx, { uuid: ctx.state.pancakeUser.uuid }),
      PromoCode.getPromo(uuidMUVal0),
      await wf.read(TEMPLATE_PATH)
    ]);
    const context = result[0];
    context.PromoCode = result[1];
    const template = result[2].toString();
    // addCsrf(req, context, meta);

    context.inviteUrl = ctx.request.url;
    if (context.PromoCode) {
      // console.log('PromoCode in mongodb', context.PromoCode);
      ctx.status = 200;
      ctx.body = mstch.render(template, context);
    } else {
      const result1C = await get_promo_code_from_1c(ctx, uuidMUVal0);
      // console.log('PromoCode from 1C', result1C);
      if (result1C.PromoCode) {
        ctx.status = 200;
        ctx.body = mstch.render(template, result1C);
        PromoCode.make(uuidMUVal0, result1C.PromoCode);
      } else {
        throw new Error(`Client don't have promo | clientId- ${uuidMUVal0}`);
      }
    }
  }
};



async function get_promo_code_from_1c(ctx, client_id) {
  const req_for_1c = new Request1Cv3(null, ctx.state.pancakeUser.uuid, null, ctx);
  req_for_1c.add('Client.GetPromoCode', { ClientID: client_id });
  await req_for_1c.do();
  const { 'Client.GetPromoCode': GetPromoCode } = req_for_1c.get_all();

  if (!GetPromoCode.ok) {
    throw new Error(JSON.stringify(GetPromoCode));
  }

  return {
    PromoCode: GetPromoCode.data.PromoCode
  };
}



/**
 * transform_to_client_id:
 * @param  {String} query: 86bab1741ea711e780e400155d594900
 * @return {String} 86bab174-1ea7-11e7-80e4-00155d594900
 */
function transform_to_client_id(uuid) {
  return uuid.slice(0, 8) + '-' + uuid.slice(8, 12) + '-' + uuid.slice(12, 16) + '-' + uuid.slice(16, 20) + '-' + uuid.slice(20);
}