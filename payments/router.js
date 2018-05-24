'use strict';


// то есть фактически у них 4 набора настроек, рабочий и тестовый терминал на securepay.tinkoff.ru и рабочий и тестовый терминал на rest-api-test.tinkoff.ru

const CONF = require('/p/pancake/settings/config.js');
const Router = require('koa-router');
const logger = require('logger')(module, 'pay.log');
const log = require('/p/pancake/lib/logger.js');
const { models } = require('models');
const { Payment } = models;
const crypto = require('crypto');
const querystring = require('querystring');
const url_core = require('url');
const request_promise = require('/p/pancake/my/request_promise.js');
const { getTemplate, loadTemplate } = require('utils');
const https = require('https');
const paymentsRouter = new Router();
const moment = require('moment');
// const { SingleRequest1C } = require('api1c');
const Logger_payment = require('/p/pancake/lib/logger_payment.js');

let regExpAmount = new RegExp(/^(:?\d+)((\.|\,)(:?\d{1,2}))?$/, 'g');

// const DEFAULT_PAYMENT_ORG_TYPE = 'tinkoff_ksd';

// Two url for connection tinkoff
const URL_TINKOFF = (CONF.is_dev) ? 'rest-api-test.tinkoff.ru' : 'securepay.tinkoff.ru';

// Оба терминала доступны как по dev url, так и по prod url
const PaymentOrgType = {
  // продакшен терминал
  tinkoff_ksd: {
    NAME: 'tinkoff_ksd',
    TERMINAL_KEY: 'domovenok3DS',
    PASSWORD: '1AOJ.Di8b8EwGt,X'
    // TEST KSD
    // 'PASSWORD': 'q6YYOi^^jsTo@l1S'
  },
  // тестовый терминал
  terminal_dev: {
    NAME: 'terminal_dev',
    TERMINAL_KEY: 'domovenokDEMO',
    PASSWORD: '7wp9u3dbl5tv7d51'
  },
  // больше не существует
  // 'tinkoff_ipatova': {
  //   'NAME': 'tinkoff_ipatova',
  //   'TERMINAL_KEY': '1487066466356',
  //   'PASSWORD': 'f7ydxrgo3c42l9ub'
  // TEST Ipatova
  // 'TERMINAL_KEY': '1487066466356DEMO',
  // 'PASSWORD': 'b85qudmm7bagosat',
  // },
};

// OLD CODE
// KSD
// const TERMINAL_KEY = 'domovenok3DS';
// const PASSWORD = '1AOJ.Di8b8EwGt,X';
// TEST KSD
// PASSWORD = 'q6YYOi^^jsTo@l1S'

// IP Ipatova
// const TERMINAL_KEY = '1487066466356'
// const PASSWORD = 'f7ydxrgo3c42l9ub'

// const TEMP_TERMINAL_KEY = '1487066466356';
// const TEMP_PASSWORD = 'f7ydxrgo3c42l9ub';

// TEST IP Ipatovagi
// const TERMINAL_KEY = '1487066466356DEMO'
// const PASSWORD = 'b85qudmm7bagosat'


const enum_type_payment = {
  payment_for_bind_card: 'paymentForBindCard',
  payment_from_1c: 'paymentFrom1c',
  manual_payment: 'manualPayment',
};


loadTemplate({path: 'templates/payments/init.html', name: 'paymentsInit'});
loadTemplate({path: 'templates/payments/success.html', name: 'paymentsSuccess'});
loadTemplate({path: 'templates/payments/failure.html', name: 'paymentsFailure'});

// TODO(2018.05.21): Maybe move function to config object
async function getTerminalData() {
  if (CONF.is_dev) {
    return PaymentOrgType.terminal_dev;
  } else {
    return PaymentOrgType.tinkoff_ksd;
  }
}

// https://www-dev1.domovenok.su/payments/success?Success=true&ErrorCode=0&Message=None&Details=&Amount=20000&MerchantEmail=marianna%40domovenok.su&MerchantName=domovenok&OrderId=000000071&PaymentId=2309717&TranDate=&BackUrl=https%3A%2F%2Fwww.domovenok.su&CompanyName=%D0%9E%D0%9E%D0%9E+%C2%AB%D0%9A%D1%81%D0%94%C2%BB&EmailReq=marianna%40domovenok.su&PhonesReq=9295302312
async function getState(paymentId, logger_payment) {
  let getParam = {'PaymentId': paymentId};
  let terminalData = await getTerminalData(paymentId);
  if (logger_payment) {
    logger_payment.info('terminalData=', terminalData);
  }
  getParam['TerminalKey'] = terminalData.TERMINAL_KEY;
  getParam['Password'] = terminalData.PASSWORD;
  getParam['Token'] = get_token(getParam);
  let response = '';
  let body = querystring.stringify(getParam);
  let connectParam = {
    hostname: URL_TINKOFF,
    port: 443,
    path: '/rest/GetState',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  if (logger_payment) {
    logger_payment.info('getState=', connectParam, getParam);
  }
  if (connectParam.method == 'POST'){
    connectParam.headers['Content-length'] = Buffer.from(body).length;
  }
  let responseTinkoff = await new Promise((reslove, reject) => {
    let req = https.request(connectParam, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        response += chunk;
      });
      res.on('end', () => {
        reslove(response);
      });
    });
    req.setTimeout(1000 * 20, function () {
      reject(new Error(`Request timeout error - ${connectParam}`));
    });
    req.on('error', (e) => {
      reject(new Error(`The request ended in failure - ${connectParam} ${e}`));
    });
    if (connectParam.method == 'POST'){
      req.write(body);
    }
    req.end();
  });
  let parseResponseTinkoff = JSON.parse(responseTinkoff);

  if (parseResponseTinkoff.Success){
    return parseResponseTinkoff.Status;
  } else {
    logger.error('Check payment state failure');
    logger.error(`${responseTinkoff}`);

    if (logger_payment) {
      logger_payment.warn('Check payment state failure', responseTinkoff);
    }
  }
  return false;
}


// GET /payments/success/?Success=true&ErrorCode=0&Message=None&Details=Approved&Amount=313200&MerchantEmail=marianna@domovenok.su&MerchantName=domovenok&OrderId=42108&PaymentId=20862836&TranDate=17.05.2018+10:39:49&BackUrl=https://www.domovenok.su&CompanyName=ООО+«КсД»&EmailReq=marianna@domovenok.su&PhonesReq=9295302312
// ?Success=true
// &ErrorCode=0
// &Message=None
// &Details=Approved
// &Amount=313200
// &MerchantEmail=marianna@domovenok.su
// &MerchantName=domovenok
// &OrderId=42108
// &PaymentId=20862836
// &TranDate=17.05.2018+10:39:49
// &BackUrl=https://www.domovenok.su&CompanyName=ООО+«КсД»
// &EmailReq=marianna@domovenok.su
// &PhonesReq=9295302312
paymentsRouter.get('/payments/success/', async function (ctx) {
  if (wrong_domain(ctx)) {
    return;
  }

  const query_param = ctx.query;
  let logger_payment;
  try{
    const OrderId = query_param.OrderId;
    logger_payment = new Logger_payment(ctx, { order_id: OrderId });
    logger_payment.info('/payments/success/ '+ctx.request.url);

    // TODO: Maybe check only paymentId in db else payment from 1C

    // payment of 1 rub for bind card, format orderId 'PAY-85'
    if (/PAY-\d+/.test(OrderId)) {
      await payment_in_1c(ctx, enum_type_payment.payment_for_bind_card);
      return;
    // ORD-1521885-000000079, if payment generate in 1C
    } else if (/^ORD/.test(OrderId)) {
      await payment_in_1c(ctx, enum_type_payment.payment_from_1c);
      return;
    }

    const payment = await Payment.findOne({
      where: {
        id: OrderId, // example: 763267
        PaymentId: query_param.PaymentId, // exmaple: tinkoff_ksd
      }
    });
    // const payment = await Payment.findOne({
    //   where: {
    //     PaymentId: query_param.PaymentId, // example: 763267
    //     payment_org_type: query_param.payment_org_type,
    //   }
    // });
    if (payment) {
      logger_payment.info(payment);
    }

    // if payment generate in 1C
    if (!payment || !payment.PaymentId) {
      await payment_in_1c(ctx, 'payment_from_1c');
      return;
    }

    let paymentState = await getState(payment.PaymentId, logger_payment);
    if (['AUTHORIZED', 'CONFIRMING', 'CONFIRMED'].indexOf(paymentState) > 0) {
      logger.info(`Bank Check State - Success | Status - ${paymentState} | OrderId - ${payment.id} `);
      logger_payment.info(`bank check state - success | Status - ${paymentState} | OrderId - `, payment.dataValues);
      try {
        let data = {};
        data['OrderId'] = payment.OrderId;
        data['Amount'] = payment.Amount;
        data['Description'] = payment.Description;
        data['PaymentOrgType'] = payment.payment_org_type;
        data['id'] = payment.id;
        data['date'] = moment.parseZone(moment(payment.create_time).utcOffset('+03:00').format('YYYY-MM-DDTHH:mm:ssZ')).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        data['PaymentId'] = payment.PaymentId;
        data['user_id'] = ctx.state.pancakeUser.uuid;
        // todo check ticket data
        try{
          await ctx.state.pancakeUser.sendTicket('PaymentSuccess', data);
        } catch (e){
          logger.error(`Tickets are not sent ${JSON.stringify(data)}`);
          logger_payment.warn('Tickets are not sent', data);
        }
        payment.success = true;
        await payment.save();
        logger.info(`Payment Success Completed OrderId - ${payment.OrderId} | Id - ${payment.id}`);
        logger_payment.info('payment success completed orderId', payment.dataValues);
        if (payment.redirectNewSite){
          logger.info(`exist redirectNewSite: redirect to ${payment.redirectPath}`);
          ctx.redirect(payment.redirectPath);
          return;
        }
        const template = getTemplate({path: 'templates/payments/success.html', name: 'paymentsSuccess'});
        ctx.body = template(ctx.proc({
          sum: payment.Amount / 100.0,
          typePayment: enum_type_payment.manual_payment
        }));
        return;
      } catch (e){
        logger.error(e);
        logger_payment.warn(e);
        const template = getTemplate({path: 'templates/payments/success.html', name: 'paymentsSuccess' });
        ctx.body = template(ctx.proc({
          typePayment: enum_type_payment.manual_payment,
        }));
        return;
      }
    } else {
      logger.error(`Bank Check State - Failure | Status - ${paymentState} | OrderId - ${ctx.query.OrderId}`);
      logger_payment.warn(`Bank Check State - Failure | Status - ${paymentState} | OrderId - ${ctx.query.OrderId}`);
      ctx.status = 302;
      ctx.redirect('/payments/failure/');
    }
  } catch (e){
    logger.error(e);
    logger_payment.warn(e);
    ctx.status = 302;
    ctx.redirect('/payments/failure/');
  }
});


/**
 * payment_in_1c: handle for payment from 1c
 * @param  {Object} ctx
 * @param  {String} type_payment:  payment_for_bind_card || payment_from_1c || manual_payment
 */
async function payment_in_1c(ctx, type_payment) {
  const query_param = ctx.query;
  const logger_payment = new Logger_payment(ctx, { order_id: query_param.OrderId });
  try {
    // let payment_state = await getState(query_param.PaymentId, logger_payment) || '';
    // payment_state = payment_state.trim();
    // AUTHORIZED -- two step for payments
    const template = getTemplate({ path: 'templates/payments/success.html', name: 'paymentsSuccess' });
    ctx.status = 200;
    ctx.body = template(ctx.proc({
      sum: query_param.Amount / 100.0,
      typePayment: type_payment,
    }));
    logger_payment.info('payment in 1c: payment success completed');
  } catch (err) {
    logger_payment.warn('payment in 1c: ', err);
    ctx.status = 302;
    ctx.redirect(`/payments/failure/?OrderId=${query_param.OrderId}&Details=`+querystring.escape('Внутреняя ошибка')+'&typePayment='+type_payment);
  }
}


function get_token(get_param) {
  let mas = [];
  for (let param of Object.keys(get_param)){
    mas.push([param, get_param[param]]);
  }
  mas.sort((a, b)=>a[0] > b[0]);
  let token_str = '';
  for (let item of mas){
    token_str += item[1].toString();
  }
  let token = crypto.createHash('sha256').update(token_str).digest('hex');
  return token;
}

paymentsRouter.get('/payments/', async function (ctx) {
  let context = {};
  if (ctx.query.order_id){
    context['order_id'] = ctx.query.order_id;
  }
  if (ctx.query.amount){
    regExpAmount.lastIndex = 0;
    let match = regExpAmount.exec(ctx.query.amount);
    if (match === null){
      const template = getTemplate({path: 'templates/payments/failure.html', name: 'paymentsFailure'});
      ctx.body = template(ctx.proc());
      return;
    }
    context['amount'] = ctx.query.amount;
  }
  if (ctx.query.description){
    context['description'] = ctx.query.description;
  }
  if (ctx.query.autosend){
    context['autosend'] = true;
  }
  if (ctx.query.redirect){
    context['redirect'] = ctx.request.headers.referer;
  }
  const template = getTemplate({path: 'templates/payments/init.html', name: 'paymentsInit'});
  ctx.body = template(ctx.proc(context));
});


// GET /payments/failure/?Success=false&ErrorCode=102&Message=Попробуйте+повторить+попытку+позже&Details=&Amount=699000&MerchantEmail=marianna%40domovenok.su&MerchantName=domovenok&OrderId=7378&PaymentId=20777328&TranDate=&BackUrl=https%3A%2F%2Fwww.domovenok.su&CompanyName=ООО+«КсД»&EmailReq=marianna%40domovenok.su&PhonesReq=9295302312
// query params
// ?Success=false
// &ErrorCode=102
// &Message=Попробуйте+повторить+попытку+позже
// &Details=
// &Amount=699000
// &MerchantEmail=marianna%40domovenok.su
// &MerchantName=domovenok
// &OrderId=7378
// &PaymentId=20777328
// &TranDate=
// &BackUrl=https%3A%2F%2Fwww.domovenok.su
// &CompanyName=ООО+«КсД»
// &EmailReq=marianna%40domovenok.su
// &PhonesReq=9295302312
paymentsRouter.get('/payments/failure/', async function (ctx) {
  if (wrong_domain(ctx)) {
    return;
  }

  const order_id = ctx.query.OrderId;
  const details = ctx.query.Details || '';
  const typePayment = ctx.query.typePayment || '';
  let logger_payment = {
    info: () => {},
    warn: () => {}
  };
  if (order_id) {
    logger_payment = new Logger_payment(ctx, { order_id });
  }

  const template = getTemplate({
    path: 'templates/payments/failure.html',
    name: 'paymentsFailure',
  });
  ctx.body = template(ctx.proc({
    details,
    typePayment
  }));
  logger_payment.warn(`${ctx.request.url} fail payment`);
  return;
});


// POST /payments/notification/
// request body
// {
//   TerminalKey: 'domovenok3DS',
//   OrderId: '42008',
//   Success: 'true',
//   Status: 'AUTHORIZED',
//   PaymentId: '20795644',
//   ErrorCode: '0',
//   Amount: '376000',
//   RebillId: '',
//   CardId: '3157179',
//   Pan: '530403******8278',
//   ExpDate: '1219',
//   Token: '1e05ff157bae80522951f0b462f92c3f5af5b5e561b2557ab56f0fbe5ee0cb10'
// }
// {
//   TerminalKey: 'domovenok3DS',
//   OrderId: '42008',
//   Success: 'true',
//   Status: 'CONFIRMED',
//   PaymentId: '20795644',
//   ErrorCode: '0',
//   Amount: '376000',
//   RebillId: '',
//   CardId: '3157179',
//   Pan: '530403******8278',
//   ExpDate: '1219',
//   Token: '4c897d2743eefe0ca6c94426b8b71cfd702e14682625266a05315c3930266721'
// }
// {
//   TerminalKey: 'domovenok3DS',
//   OrderId: '000000003',
//   Success: true,
//   Status: 'REVERSED',
//   PaymentId: 20795528,
//   ErrorCode: '0',
//   Amount: 100,
//   CardId: 4515599,
//   Pan: '533157******8835',
//   ExpDate: '0422',
//   Token: 'dc85d586bfa36cf8b4c249c2d01c7b0ac2ae1856de985782b114a628d9c80aa9'
// }
paymentsRouter.post('/payments/notification/', async function (ctx) {
  const body = ctx.request.body;
  const logger_payment = new Logger_payment(ctx, { order_id: body.OrderId });
  try {
    logger_payment.info('/payments/notification/', 'request body =', body);
    const paymentId = body.PaymentId;
    const payment = await Payment.findOne({
      where: {
        PaymentId: '' + paymentId
      }
    });

    // send to 1с
    if (!payment) {
      const res = await send_to_1c_payment(body, logger_payment);
      if (res instanceof Error) {
        ctx.status = 500;
        ctx.body = res.toString();
      } else {
        ctx.status = 200;
        ctx.body = res;
      }
      logger_payment.info('/payments/notification/ responce ', ctx.body);
      return;
    }

    let terminalData = await getTerminalData(paymentId);
    if (
      payment.id == body['OrderId'] &&
      payment.Amount == body['Amount'] &&
      terminalData.TERMINAL_KEY == body['TerminalKey']
    ) {
      logger.info(`Notification Success OrderId - ${payment.OrderId} | Id - ${payment.id}`);
      logger_payment.info('Notification success /payments/notification/', body);
      payment.notification = true;
      await payment.save();
      ctx.body = 'OK';
    } else {
      logger.error(`Notification Failure OrderId - ${body['OrderId']} | Id - ${payment.id} | Amount - ${body['Amount']} | TerminalKey - ${terminalData.TERMINAL_KEY}`);
      logger_payment.warn('Notification incorrect /payments/notification/', 'payment=', {
        id: payment.id,
        Amount: payment.Amount,
        TERMINAL_KEY: terminalData.TERMINAL_KEY
      }, body);
    }
  } catch (err) {
    logger.error(`FAILED Notification Failure OrderId - ${body['OrderId']}`, err);
    logger_payment.warn('FAILED Notification /payments/notification/', err, body);
    ctx.status = 500;
  }
});


// CREATE payment
// POST /payments/take/
// request ––
// {
//   redirect: true,
//   order_id: 'ORD-1521872',
//   amount: 2490
// }
paymentsRouter.post('/payments/take/', async function (ctx) {
  try{
    logger.info(`Take payment Amount - ${ctx.request.body.amount} | OrderId - ${ctx.request.body.order_id} | Descr - ${ctx.request.body.description} | IP - ${ctx.request.header['x-real-ip']}`);
    let get_param = {};
    let form_amount = ctx.request.body.amount;
    let amount;
    if (form_amount){
      regExpAmount.lastIndex = 0;
      let re_amount = regExpAmount.exec(form_amount);
      if (re_amount === null){
        logger.info(`Take payment Amount error OrderId - ${ctx.request.body.order_id} | Amount - ${ctx.request.body.amount}`);
        ctx.body = {'Success': true, 'Data': {'redirect': '/payments/failure/'}};
        return;
      }
      let whole = re_amount[1];
      let fraction = re_amount[2] || '';
      if (fraction) {
        fraction = fraction.replace(/[\.,]+/g, '');
      }
      if (!fraction){
        amount = whole + '00';
      } else if (fraction.length == 2){
        amount = whole + fraction;
      } else if (fraction.length == 1){
        amount = whole + fraction + '0';
      } else {
        logger.error(`Take payment Amount error OrderId - ${ctx.request.body.order_id} | Amount - ${ctx.request.body.amount}`);
        ctx.body = {'Success': true, 'Data': {'redirect': '/payments/failure/'}};
        return;
      }
    }
    get_param['Amount'] = amount;
    get_param['IP'] = ctx.request.header['x-real-ip'];
    let terminalData = await getTerminalData(null, ctx.request.body.order_id, ctx);
    let last_payment = await Payment.findOne({order: [['id', 'DESC']]});
    let create_payment = {
      OrderId: ctx.request.body.order_id,
      Amount: Number(get_param['Amount']),
      Description: ctx.request.body.description,
      IP: get_param['IP'],
      redirectNewSite: false,
      redirectPath: '',
      id: Number(last_payment.id) + 1,
      payment_org_type: terminalData['NAME']
    };
    if (ctx.request.body.redirect){
      create_payment['redirectNewSite'] = true;
      // add create
      create_payment['redirectPath'] = ctx.request.headers.referer;
    }
    let payment = await Payment.create(create_payment);
    get_param['OrderId'] = payment.id;

    // Get Terminal data

    get_param['TerminalKey'] = terminalData.TERMINAL_KEY;
    get_param['Password'] = terminalData.PASSWORD;

    get_param['Token'] = get_token(get_param);
    payment.Token = get_param['Token'];
    await payment.save();
    let response = await new Promise((reslove, reject) => {
      // todo request in utils

      const req = https.get({
        host: URL_TINKOFF,
        path: '/rest/Init/?'+querystring.stringify(get_param)
      }, (res) => {
        let response = '';
        res.on('data', (chunk) => {
          response += chunk;
        });
        res.on('end', ()=>{
          reslove(response);
        });
      });
      req.setTimeout(1000 * 20, function () {
        reject(new Error(`Request tinkoff timeout error ${'/rest/Init/?' + querystring.stringify(get_param)}`));
      });
      req.on('error', (e) => {
        reject(new Error(`The request tinkoff ended in failure ${'/rest/Init/?' + querystring.stringify(get_param)} ${e}`));
      });
      req.end();
    });
    let parseResponse = JSON.parse(response);
    if (parseResponse['Success'] == true){
      logger.info(`Init Success OrderId - ${payment.OrderId}, Id - ${payment.id}`);
      payment.initial = true;
      payment.PaymentId = parseResponse['PaymentId'];
      await payment.save();
      if (payment.redirectPath) {
        ctx.response.set('Access-Control-Allow-Origin', 'www.domovenok.su');
        ctx.body = {'Success': true, 'Data': {'redirect': parseResponse['PaymentURL']}};
        return;
      } else {
        ctx.body = {'Success': true, 'Data': {'redirect': parseResponse['PaymentURL']}};
        return;
      }
    }
    logger.error(`Init Failure OrderId - ${ctx.request.body.order_id} | ErrorCode - ${parseResponse['ErrorCode']} | Details - ${parseResponse['Details']}`);
    if (payment.redirectPath) {
      ctx.body = {'Success': false, 'ErrorCode': -1};
      ctx.response.set('Access-Control-Allow-Origin', 'www.domovenok.su');
      return;
    }
    const template = getTemplate({path: 'templates/payments/failure.html', name: 'paymentsFailure'});
    ctx.body = template(ctx.proc({
      typePayment: enum_type_payment.manual_payment
    }));
    return;
  } catch (err) {
    logger.info(err);
    log.warn(err);
  }
  ctx.body = {'Success': true, 'Data': {'redirect': '/payments/failure/'}};
});


async function send_to_1c_payment(data, logger_payment) {
  const url = CONF.webhook.url;
  try {
    return await send_to_1c(url, data);
  } catch (err) {
    logger_payment.warn(`${url}`, '\n', err);
    return err;
  }
}


async function send_to_1c(url, data) {
  const { error, response, body } = await request_promise.post(url, {
    headers: {
      Authorization: 'Basic d2ViaG9va3M6M09ITUdsZmE3UQ=='
    },
    json: data
  });
  if (error) {
    throw error;
  }
  if (response.statusCode !== 200) {
    throw new Error(`statusCode ${response.statusCode} ${body}`);
  }
  return body;
}


// в tinkoff захардкожен url куда редиректить https://www-dev1.domovenok.su/payments/sucess...etc
// для того чтобы можно было тестить на виртуалках платежи, мы проверяем куку, в которой указан домен (ставим при нажатии 'Привязать карту')
// и редиректим на нужную виртуалку в случае не совпадения
function wrong_domain(ctx) {
  console.log('=== wrong_domain ===');

  // only for dev
  if (CONF.is_prod) {
    return false;
  }

  // example: https://www-dev2.domovenok.su
  const cookie_host = ctx.cookies.get('payment_domen');
  if (!cookie_host) {
    return false;
  }

  const headers = ctx.request.headers || {};
  const current_domain = get_url_for_check_domain('https://'+headers.host || '');
  const cookie_domain = get_url_for_check_domain(cookie_host || '');

  if (current_domain === cookie_domain) {
    return false;
  } else {
    ctx.redirect(cookie_domain+ctx.request.url);
    return true;
  }
}


// url –– https://www-dev1.domovenok.su
function get_url_for_check_domain(url) {
  return 'https://'+url_core.parse(url, true).host;
}

// TODO(2018.05.18): OLD CODE, REMOVE IN FUTURE
// function getTerminalData(paymentId, orderId, ctx) {
//   if (paymentId) {
//     let payment = await Payment.findOne({where: {PaymentId: paymentId}});
//     if (payment && payment.payment_org_type){
//       return PaymentOrgType[payment.payment_org_type];
//     }
//   }
//   try{
//     if (orderId){
//       let singleRequest = new SingleRequest1C(
//         'Client.GetPaymentOrgType', // name
//         {'OrderID': orderId}, // param
//         null, // token
//         null, // userUUID
//         null, // ip
//         null, // userAgent
//         ctx
//       );
//       let response = await singleRequest.do();
//       if (PaymentOrgType[response.PaymentOrgType]){
//         return PaymentOrgType[response.PaymentOrgType];
//       }
//       logger.error(`PaymentOrgType error ${response}, OrderID - ${orderId}`);
//     }
//   } catch (e){
//     logger.error('Error Get Payment Org Type');
//     logger.error(e);
//   }
//   return PaymentOrgType[DEFAULT_PAYMENT_ORG_TYPE];
// }


//  TODO(2018.05.18):  OLD CODE, REMOVE IN FUTURE
// async function confirm(payment) {
//   let getParam = {'PaymentId': payment.PaymentId};
//   let terminalData = await getTerminalData(payment.PaymentId);
//   getParam['TerminalKey'] = terminalData.TERMINAL_KEY;
//   getParam['Password'] = terminalData.PASSWORD;
//   getParam['Amount'] = payment.Amount;
//   getParam['IP'] = payment.IP;
//   getParam['Token'] = get_token(getParam);
//   let body = querystring.stringify(getParam);
//   let response = '';
//   let connectParam = {
//     hostname: URL_TINKOFF,
//     port: 443,
//     path: '/rest/Confirm',
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded'
//     }
//   };
//   if (connectParam.method == 'POST'){
//     connectParam.headers['Content-length'] = Buffer.from(body).length;
//   }
//   let responseTinkoff = await new Promise((reslove, reject) => {
//     let req = https.request(connectParam, (res) => {
//       res.setEncoding('utf8');
//       res.on('data', (chunk) => {
//         response += chunk;
//       });
//       res.on('end', () => {
//         reslove(response);
//       });
//     });
//     req.setTimeout(1000 * 20, function () {
//       reject(new Error(`Request timeout error - ${connectParam}`));
//     });
//     req.on('error', (e) => {
//       reject(new Error(`The request ended in failure - ${connectParam}`));
//     });
//     if (connectParam.method == 'POST'){
//       req.write(body);
//     }
//     req.end();
//   });
//   let parseResponseTinkoff = JSON.parse(responseTinkoff);
//   logger.info(parseResponseTinkoff);
//   if (parseResponseTinkoff.Success){
//     return parseResponseTinkoff.Status;
//   } else {
//     logger.error('Check payment state failure');
//     logger.error(`${responseTinkoff}`);
//   }
//   return false;
// }


module.exports = {
  paymentsRouter,
  getState
};