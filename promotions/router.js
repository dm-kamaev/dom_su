"use strict";

const CONF = require('/p/pancake/settings/config.js');
const Router = require('koa-router');
const { getPromotion, getPromotionList } = require('./store');
const { getTemplate, loadTemplate } = require('/p/pancake/utils/index.js');
const AuthApi = require('/p/pancake/auth/authApi.js');
const logger = require('/p/pancake/lib/logger.js');
const rp = require('/p/pancake/my/request_promise.js');
const check_auth = require('/p/pancake/auth/check_auth.js');

const promotionsTemplateOpts = {
    path: 'templates/promotions/promotions.html',
    name: 'promotions'
}

const menu = {
    main: true,
    skidki_akcii: true
}

loadTemplate(promotionsTemplateOpts)

const promotionsRouter = new Router();

promotionsRouter.get('promotionsList', /^\/skidki_akcii\/$/, async function(ctx, next) {
  const modelList = getPromotionList(ctx.state.pancakeUser.city);
  const template = getTemplate(promotionsTemplateOpts);
  const title = 'Скидки и акции от Домовенка';
  ctx.body = template(ctx.proc({
    ItemList: modelList,
    Begin: true,
    End: true,
    HasRightSide: false,
    menu: menu,
    title: title
  }))
})

promotionsRouter.get('promotionsItem', /^\/skidki_akcii\/([0-9a-zA-Z_\-]+)\/$/, async function (ctx, next) {
    const modelList = getPromotionList(ctx.state.pancakeUser.city)
    const promotion = getPromotion(ctx.state.pancakeUser.city, ctx.params[0])
    if (promotion === undefined){
        await next()
        return
    }
    const template = getTemplate(promotionsTemplateOpts);
    const sectionName = ctx.params[0];
    const hashTitle = {
        reviews: 'Скидки и акции от Домовенка (обзоры)',
        lateness: 'Свежие скидки и акции от Домовенка',
        schedule: 'Расписание скидок и акций от Домовенка',
        certificates: 'Сертификаты на скидки и акции от Домовенка',
        birthday: 'Скидки и акции от Домовенка в день рождения',
        invite: 'Скидки и акции от Домовенка (приглашения)',
        coupons: 'Купоны на скидки и акции от Домовенка',
    };
    const title = hashTitle[sectionName] || 'Скидки и акции от Домовенка';
    ctx.body = template(ctx.proc({
        ItemList: modelList,
        Item: promotion,
        Begin: true,
        End: true,
        HasRightSide: true,
        menu: menu,
        title,
    }))
})

promotionsRouter.get('promotionsListAjax', /^\/m\/skidki_akcii$/, async function (ctx, next) {
    try {
        const modelList = getPromotionList(ctx.state.pancakeUser.city)
        const response = { Success: true, Data: {ItemList: modelList, Begin: true, End: true }}
        ctx.type = 'application/json'
        ctx.body = JSON.stringify(response)
    } catch (e) {
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

promotionsRouter.get('promotionsItemAjax', /^\/m\/skidki_akcii\/([0-9a-zA-Z_\-]+)$/, async function (ctx, next) {
    try {
        const promotion = getPromotion(ctx.state.pancakeUser.city, ctx.params[0])
        let response = { Success: true, Data: { Item: promotion} }
        ctx.type = 'application/json'
        ctx.body = response
    } catch (e){
        logger.info(e)
        ctx.type = 'application/json'
        ctx.body = JSON.stringify({ Success: false })
    }
})

// /promotion
promotionsRouter.get('/promotion/', check_auth.ajax(async function (ctx, next) {
  const client_id = new AuthApi(ctx).get_auth_data().client_id;
  ctx.status = 200;
  try {
    const url = `${CONF.domain}/private/get_promotion/${client_id}`;
    const reply = await rp.get(url, { rejectUnauthorized: false });
    if (reply.response.status === 500) {
      throw reply.body;
    }
    ctx.body = {
      ok: true,
      data: reply.body,
    };
  } catch (err) {
    logger.warn(err);
    ctx.body = {
      ok: false,
      error: {
        code: -1,
        text: `Internal error`,
      }
    };
  }
}));

module.exports = {
    promotionsRouter,
};