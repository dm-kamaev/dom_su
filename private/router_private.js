'use strict';

const Router = require('koa-router');
const CONF = require('/p/pancake/settings/config.js');
const wf = require('/p/clientPA/my/wf.js');
const mstch = require('mustache');
// const time = require('/p/clientPA/my/time.js');
// const logger = require('/p/clientPA/lib/logger.js');
const AuthApi = require('/p/pancake/auth/authApi.js');
const Magic_url = require('/p/pancake/private/Magic_url.js');
const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');
const PromoCode = require('/p/pancake/private/mongo_models/PromoCode.js');

const router_private = module.exports = new Router({
  prefix: '/private'
});

const urls = [
  '/adr:uuidMUVal0([a-f0-9]{32})',
  '/adr:uuidMUVal0([a-f0-9]{32})/shd:uuidMUVal1([a-f0-9]{32})',
  '/adr:uuidMUVal0([a-f0-9]{32})/ord:uuidMUVal1([a-f0-9]{32})',
  '/bind-card-error',
  '/bind-card-success',
  '/payment-success',
  '/profile',
  '/order',
  '/order/history',
  '/order/services',
  '/order/service',
  '/order/time',
  '/order/address',
  '/order/info',
  '/order/addition',
  '/order/window',
  '/order/town'
];
urls.forEach(async (url) => { router_private.get(url, render_vue_template); });

// /private/?isMobile=true => /private/adr09300a595f4f11e880ea00155d594900
// /private => /private/adr09300a595f4f11e880ea00155d594900/ord90c4ef0b901911e8831440167eadd993 || /private/adr09300a595f4f11e880ea00155d594900/shd90c4ef0b901911e8831440167eadd993
// /private/?utm_medium=something => /private/adr09300a595f4f11e880ea00155d594900/ord90c4ef0b901911e8831440167eadd993?utm_medium=something || /private/adr09300a595f4f11e880ea00155d594900/shd90c4ef0b901911e8831440167eadd993?utm_medium=something
router_private.get('/', check_login_client, redirect_from_root_page_to_page_with_uuid);

// /private/orders/?isMobile=true => /private/adr09300a595f4f11e880ea00155d594900
// /private/orders => /private/adr09300a595f4f11e880ea00155d594900/ord90c4ef0b901911e8831440167eadd993 || /private/adr09300a595f4f11e880ea00155d594900/shd90c4ef0b901911e8831440167eadd993
// /private/orders?utm_medium=something => /private/adr09300a595f4f11e880ea00155d594900/ord90c4ef0b901911e8831440167eadd993?utm_medium=something || /private/adr09300a595f4f11e880ea00155d594900/shd90c4ef0b901911e8831440167eadd993?utm_medium=something
router_private.get('/orders', check_login_client, redirect_from_root_page_to_page_with_uuid);

async function redirect_from_root_page_to_page_with_uuid(ctx) {
  const is_mobile = (ctx.request.query.isMobile === 'true') ? true : false;

  const { token, uuid, client_id } = new AuthApi(ctx).get_auth_data();
  const req_for_1c = new Request1Cv3(token, uuid, null, ctx);
  req_for_1c.add('Client.GetCommon', { ClientID: client_id, }).add('Client.GetDepartureList', { Filter: { Status: 'Active' } }).add('Client.GetDeparture', {}).add('Client.GetScheduleNEW', {});
  await req_for_1c.do();
  const {
    'Client.GetCommon': GetCommon,
    'Client.GetDepartureList': GetDepartureList,
    'Client.GetDeparture': GetDeparture,
    'Client.GetScheduleNEW': GetSchedule,
  } = req_for_1c.get_all();
  GetCommon.name = 'Client.GetCommon';
  GetDepartureList.name = 'Client.GetDepartureList';
  GetDeparture.name = 'Client.GetDeparture';
  GetSchedule.name = 'Client.GetScheduleNEW';
  [ GetCommon, GetDepartureList, GetDeparture, GetSchedule ].forEach(function(method){
    if (!method.ok && method.name !== 'Client.GetDeparture' && method.name !== 'Client.GetScheduleNEW'){
      throw new Error(JSON.stringify(method));
    }
  });
  const redirect_path = new Magic_url().address(GetDepartureList.data.ObjectID);
  if (!is_mobile) {
    if (GetDeparture.ok) {
      redirect_path.order(GetDeparture.data.DepartureID);
    } else if (GetSchedule.ok) {
      redirect_path.schedule(GetSchedule.data.ObjectID);
    }
  }
  ctx.redirect(redirect_path.buildUrl() + add_utm_query(ctx.request.query));
}


function add_utm_query(query, startWith) {
  const utmMarks = ['utm_medium', 'utm_source', 'utm_campaign', 'utm_term', 'utm_content'];
  let utmParam = startWith || '';
  let concatSymbol = '';
  for (var qry in query) {
    if (-1 !== utmMarks.indexOf(qry.toLowerCase())) {
      concatSymbol = (utmParam) ? '&' : '?';
      utmParam += concatSymbol + qry + '=' + query[qry];
    }
  }
  return utmParam;
}


// page with form auth
router_private.get('/auth', async function(ctx) {
  const headers = ctx.request.headers;
  const uuid = headers['x-dom-auth'] || ctx.cookies.get('u_uuid') || null;
  // TODO: use u_uuid in future
  const pancake_session_cookie = (CONF.is_prod) ? 'session_uid_dom' : 'session_uid_dom_dev';
  const session_uid_dom = ctx.cookies.get(pancake_session_cookie);
  if ((session_uid_dom && uuid) && session_uid_dom !== uuid) {
    const host = headers.host;
    ctx.cookies.set(pancake_session_cookie, uuid, {
      httpOnly: false,
      domain: host,
      maxAge: 9 * 365 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    ctx.cookies.set('u_uuid', uuid, {
      httpOnly: false,
      domain: host,
      maxAge: 9 * 365 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    // remove old cookie for '.domovenok.su'
    ctx.cookies.set(pancake_session_cookie, null, {
      httpOnly: false,
      domain: '.domovenok.su',
      maxAge: 0
    });
  }
  const authApi = new AuthApi(ctx);
  const is_login_client = await authApi.isLoginAsClient();
  const is_login_client_staff = await authApi.isLoginAsClientEmployee();

  if (is_login_client_staff) { // client, client-staff
    ctx.redirect('/staff');
  } else if (is_login_client) { // staff
    await render_vue_template(ctx);
  } else { // if not auth
    await render_vue_template(ctx);
  }
});

router_private.get('/logout', async function(ctx) {
  new AuthApi(ctx).logout();
  return ctx.redirect('/private/auth');
});


// /private/set_cookies/?action=qa&u_uuid=ee91b57d-f9fb-4f76-a78c-f03a81cc9ac3&session_uid_dom_dev=ee91b57d-f9fb-4f76-a78c-f03a81cc9ac3&A=ee91b57d-f9fb-4f76-a78c-f03a81cc9ac3LIamcspfjB1516263739720&B=ae7b122a4f9df6f552584aa4083607a6fa3eebf8abad25594020883b77284fd1e3773eb0eef178519d7e449a71a8e36100c841fef0ed79e811a535a504e5815d&status=2
router_private.get('/set_cookies/', async function (ctx) {
  const query = ctx.request.query;
  // quick auth for 1C
  if (query.action === 'qa') {
    const days_to_live = 90;
    const maxAge = days_to_live * 24 * 60 * 60 * 1000; // 3 month
    const cookie_param = { domain: ctx.request.headers.host, maxAge, path: '/', httpOnly: false };
    Object.keys(query).forEach(cookie_name => {
      if (cookie_name === 'action') {
        return;
      }
      ctx.cookies.set(cookie_name, query[cookie_name], cookie_param);
    });
    ctx.redirect('/private/auth');
  } else {
    ctx.status = 200;
    ctx.body = 'Not exist cookie';
  }
});


router_private.middleware_for_difficult_url = async function (ctx, next) {
  const url = ctx.request.url;
  if (!/^\/private/.test(url)) {
    return await next();
  }

  // /private/psmYYYYMM
  if (/^\/private\/psm\d{6}$/.test(url)) {
    await render_vue_template(ctx);
  } else if (/^\/private\/share\/cln.+/.test(url)) {
    const m = url.match(/cln(.+)$/);
    console.log('m[1]=', m[1]);
    await render_page_share(ctx, m[1]);
  } else {
    await next();
  }
};

// all url which start with
async function render_vue_template(ctx) {
  const body = await wf.read('/p/clientPA/template/index.html');
  ctx.status = 200;
  ctx.body = body;
}

// ===magicParse===
// req.params= { uuidMUVal0: '86bab1741ea711e780e400155d594900' }
// uuidMUVal0 /uuidMUVal/ [ 'uuidMUVal', index: 0, input: 'uuidMUVal0' ]
// after req.params= { uuidMUVal0: '86bab174-1ea7-11e7-80e4-00155d594900' }

/**
 * transform_to_client_id:
 * @param  {String} query: 86bab1741ea711e780e400155d594900
 * @return {String} 86bab174-1ea7-11e7-80e4-00155d594900
 */
function transform_to_client_id(uuid) {
  return uuid.slice(0, 8) + '-' + uuid.slice(8, 12) + '-' + uuid.slice(12, 16) + '-' + uuid.slice(16, 20) + '-' + uuid.slice(20);
}


// /private/share/cln8e0420c88c8e11e780e400155d594900
async function render_page_share(ctx, uuidMUVal0) {
  uuidMUVal0 = transform_to_client_id(uuidMUVal0);
  const authApi = new AuthApi(ctx);
  const is_login = await authApi.isLoginAsClient() || await authApi.isLoginAsClientEmployee();
  // console.log('is_login=', is_login);
  if (is_login) {
    // console.log('is_auth');
    const { client_id } = authApi.get_auth_data();
    if (uuidMUVal0 !== client_id) {
      console.log('redirect to'+ '/private' + new Magic_url('share').client(client_id).buildUrl());
      ctx.redirect('/private' + new Magic_url('share').client(client_id).buildUrl());
      return;
    }
    // console.log('render_vuejs');
    await render_vue_template(ctx);
  } else {
    // console.log('not_auth');
    const result = await Promise.all([
      data_for_menu(),
      PromoCode.getPromo(uuidMUVal0),
      await wf.read('/p/clientPA/template/share.html')
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
}

async function data_for_menu() {
  return {
    authUrl: '/private/auth',
    ordersUrl: new Magic_url('private').getRedirectLastOrderUrl(),
    GetCommon: {
      response: ''
    }
  };
}

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



async function check_login_client(ctx, next) {
  const authApi = new AuthApi(ctx);
  const is_login_client = await authApi.isLoginAsClient();
  if (is_login_client) {
    await next();
  } else {
    ctx.status = 302;
    ctx.redirect('/private/auth');
  }
}
