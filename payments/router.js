'use strict';

const Router = require('koa-router');
const logger = require('logger')(module, 'pay.log')
const { models, ErrorCodes } = require('models')
const { Payment } = models
const crypto = require('crypto')
const querystring = require('querystring')
const request_promise = require('/p/pancake/my/request_promise.js');
const { getTemplate, loadTemplate } = require('utils')
const https = require('https');
const paymentsRouter = new Router();
const moment = require('moment')
const { SingleRequest1C } = require('api1c')
const { URLSearchParams } = require('url');

let regExpAmount = new RegExp(/^(:?\d+)((\.|\,)(:?\d{1,2}))?$/, 'g')

const URL_TINKOFF = "securepay.tinkoff.ru"
const DEFAULT_PAYMENT_ORG_TYPE = 'tinkoff_ksd'
const PaymentOrgType = {
    'tinkoff_ksd': {
        'NAME': 'tinkoff_ksd',
        'TERMINAL_KEY': 'domovenok3DS',
        'PASSWORD': '1AOJ.Di8b8EwGt,X'
        // TEST KSD
        // 'PASSWORD': 'q6YYOi^^jsTo@l1S'
    },
    'tinkoff_ipatova': {
        'NAME': 'tinkoff_ipatova',
        'TERMINAL_KEY': '1487066466356',
        'PASSWORD': 'f7ydxrgo3c42l9ub'
        // TEST Ipatova
        // 'TERMINAL_KEY': '1487066466356DEMO',
        // 'PASSWORD': 'b85qudmm7bagosat',
    }
}

// KSD
const TERMINAL_KEY = 'domovenok3DS'
const PASSWORD = '1AOJ.Di8b8EwGt,X'
// TEST KSD
// PASSWORD = 'q6YYOi^^jsTo@l1S'

// IP Ipatova
// const TERMINAL_KEY = '1487066466356'
// const PASSWORD = 'f7ydxrgo3c42l9ub'

const TEMP_TERMINAL_KEY = '1487066466356'
const TEMP_PASSWORD = 'f7ydxrgo3c42l9ub'

// TEST IP Ipatovagi
// const TERMINAL_KEY = '1487066466356DEMO'
// const PASSWORD = 'b85qudmm7bagosat'


loadTemplate({path: 'templates/payments/init.html', name: 'paymentsInit'})
loadTemplate({path: 'templates/payments/success.html', name: 'paymentsSuccess'})
loadTemplate({path: 'templates/payments/failure.html', name: 'paymentsFailure'})

async function getTerminalData(paymentId, orderId, ctx) {
    if (paymentId) {
        let payment = await Payment.findOne({where: {PaymentId: paymentId}})
        if (payment && payment.payment_org_type){
            return PaymentOrgType[payment.payment_org_type]
        }
    }
    try{
        if (orderId){
            let singleRequest = new SingleRequest1C(
                'Client.GetPaymentOrgType', // name
                {"OrderID": orderId}, // param
                null, // token
                null, // userUUID
                null, // ip
                null, // userAgent
                ctx
            );
            let response = await singleRequest.do()
            if (PaymentOrgType[response.PaymentOrgType]){
                return PaymentOrgType[response.PaymentOrgType]
            }
            logger.error(`PaymentOrgType error ${response}, OrderID - ${orderId}`)
        }
    } catch (e){
        logger.error('Error Get Payment Org Type')
        logger.error(e)
    }
    return PaymentOrgType[DEFAULT_PAYMENT_ORG_TYPE]
}


async function confirm(payment) {
    let getParam = {'PaymentId': payment.PaymentId}
    let terminalData = await getTerminalData(payment.PaymentId)
    getParam['TerminalKey'] = terminalData.TERMINAL_KEY
    getParam['Password'] = terminalData.PASSWORD
    getParam['Amount'] = payment.Amount
    getParam['IP'] = payment.IP
    getParam['Token'] = get_token(getParam)
    let body = querystring.stringify(getParam)
    let response = ''
    let connectParam = {
        hostname: URL_TINKOFF,
        port: 443,
        path: "/rest/Confirm",
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    if (connectParam.method == 'POST'){
        connectParam.headers['Content-length'] = Buffer.from(body).length;
    }
    let responseTinkoff = await new Promise((reslove, reject) => {
        let req = https.request(connectParam, (res) => {
            res.setEncoding('utf8')
            res.on('data', (chunk) => {
                response += chunk
            });
            res.on('end', () => {
                reslove(response);
            });
        })
        req.setTimeout(1000 * 20, function () {
            reject(new Error(`Request timeout error - ${connectParam}`))
        })
        req.on('error', (e) => {
            reject(new Error(`The request ended in failure - ${connectParam}`))
        })
        if (connectParam.method == 'POST'){
            req.write(body)
        }
        req.end()
    })
    let parseResponseTinkoff = JSON.parse(responseTinkoff)
    logger.info(parseResponseTinkoff)
    if (parseResponseTinkoff.Success){
        return parseResponseTinkoff.Status
    } else {
        logger.error('Check payment state failure')
        logger.error(`${responseTinkoff}`)
    }
    return false
}

async function getState(paymentId) {
    let getParam = {'PaymentId': paymentId}
    let terminalData = await getTerminalData(paymentId)
    getParam['TerminalKey'] = terminalData.TERMINAL_KEY
    getParam['Password'] = terminalData.PASSWORD
    getParam['Token'] = get_token(getParam)
    let response = ''
    let body = querystring.stringify(getParam)
    let connectParam = {
        hostname: URL_TINKOFF,
        port: 443,
        path: "/rest/GetState",
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    if (connectParam.method == 'POST'){
        connectParam.headers['Content-length'] = Buffer.from(body).length;
    }
    let responseTinkoff = await new Promise((reslove, reject) => {
        let req = https.request(connectParam, (res) => {
            res.setEncoding('utf8')
            res.on('data', (chunk) => {
                response += chunk
            });
            res.on('end', () => {
                reslove(response);
            });
        })
        req.setTimeout(1000 * 20, function () {
            reject(new Error(`Request timeout error - ${connectParam}`))
        })
        req.on('error', (e) => {
            reject(new Error(`The request ended in failure - ${connectParam}`))
        })
        if (connectParam.method == 'POST'){
            req.write(body)
        }
        req.end()
    })
    let parseResponseTinkoff = JSON.parse(responseTinkoff)
    if (parseResponseTinkoff.Success){
        return parseResponseTinkoff.Status
    } else {
        logger.error('Check payment state failure')
        logger.error(`${responseTinkoff}`)
    }
    return false
}

paymentsRouter.get('/payments/success/', async function (ctx, next) {
    try{
        let payment = await Payment.findOne({where: {id: ctx.query.OrderId}})
        let paymentState = await getState(payment.PaymentId)
        if (['CONFIRMING', 'CONFIRMED'].indexOf(paymentState) > 0){
            logger.info(`Bank Check State - Success | Status - ${paymentState} | OrderId - ${payment.id} `)
            try {
                let data = {};
                data['OrderId'] = payment.OrderId
                data['Amount'] = payment.Amount
                data['Description'] = payment.Description
                data['PaymentOrgType'] = payment.payment_org_type
                data['id'] = payment.id
                data['date'] = moment.parseZone(moment(payment.create_time).utcOffset("+03:00").format('YYYY-MM-DDTHH:mm:ssZ')).format('YYYY-MM-DDTHH:mm:ss') + 'Z'
                data['PaymentId'] = payment.PaymentId
                data['user_id'] = ctx.state.pancakeUser.uuid
                // todo check ticket data
                try{
                    await ctx.state.pancakeUser.sendTicket('PaymentSuccess', data)
                } catch (e){
                    logger.error(`Tickets are not sent ${JSON.stringify(data)}`)
                }
                payment.success = true
                await payment.save()
                logger.info(`Payment Success Completed OrderId - ${payment.OrderId} | Id - ${payment.id}`)
                if (payment.redirectNewSite){
                    ctx.redirect(payment.redirectPath)
                    return
                }
                const template = getTemplate({path: 'templates/payments/success.html', name: 'paymentsSuccess'})
                ctx.body = template(ctx.proc({'sum': payment.Amount/100.0}))
                return
            } catch (e){
                logger.error(e)
                const template = getTemplate({path: 'templates/payments/success.html', name: 'paymentsSuccess'})
                ctx.body = template(ctx.proc())
                return
            }
        } else {
            logger.error(`Bank Check State - Failure | Status - ${paymentState} | OrderId - ${ctx.query.OrderId}`)
            ctx.status = 302
            ctx.redirect('/payments/failure/')
        }
    } catch (e){
        logger.error(e)
        ctx.status = 302
        ctx.redirect('/payments/failure/')
    }
})



function get_token(get_param) {
    let mas = []
    for (let param of Object.keys(get_param)){
        mas.push([param, get_param[param]])
    }
    mas.sort((a, b)=>a[0] > b[0])
    let token_str = ''
    for (let item of mas){
        token_str += item[1].toString()
    }
    let token = crypto.createHash('sha256').update(token_str).digest('hex');
    return token
}

paymentsRouter.get('/payments/', async function (ctx, next) {
    let context = {}
    if (ctx.query.order_id){
        context['order_id'] = ctx.query.order_id
    }
    if (ctx.query.amount){
        regExpAmount.lastIndex = 0;
        let match = regExpAmount.exec(ctx.query.amount)
        if (match === null){
            const template = getTemplate({path: 'templates/payments/failure.html', name: 'paymentsFailure'})
            ctx.body = template(ctx.proc())
            return
        }
        context['amount'] = ctx.query.amount
    }
    if (ctx.query.description){
        context['description'] = ctx.query.description
    }
    if (ctx.query.autosend){
        context['autosend'] = true
    }
    if (ctx.query.redirect){
        context['redirect'] = ctx.request.headers.referer
    }
    const template = getTemplate({path: 'templates/payments/init.html', name: 'paymentsInit'})
    ctx.body = template(ctx.proc(context))
})

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
paymentsRouter.get('/payments/failure/', async function (ctx, next) {
  const template = getTemplate({
    path: 'templates/payments/failure.html',
    name: 'paymentsFailure'
  });
  ctx.body = template(ctx.proc({'details': ctx.query.Details}));
  return;
});


// POST /payments/notification/
// request {
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
paymentsRouter.post('/payments/notification/', async function (ctx, next) {
    try {
      const body = ctx.request.body;
      console.log('===PAYMENTS_NOTIFICATION===');
      console.log('body=', body);
      console.log('request=', ctx.request, ctx.responce);
      const paymentId = body['PaymentId']
      const payment = await Payment.findOne({where: {PaymentId: paymentId}})
      let terminalData = await getTerminalData(paymentId)
      if (
        payment.id == body['OrderId'] &&
        payment.Amount == body['Amount'] &&
        terminalData.TERMINAL_KEY == body['TerminalKey']
      ) {
          logger.info(`Notification Success OrderId - ${payment.OrderId} | Id - ${payment.id}`)
          console.log(`Notification Success OrderId - ${payment.OrderId} | Id - ${payment.id}`);
          payment.notification = true
          await payment.save()
          ctx.body = 'OK'
      } else {
          logger.error(`Notification Failure OrderId - ${body['OrderId']} | Id - ${payment.id} | Amount - ${body['Amount']} | TerminalKey - ${terminalData.TERMINAL_KEY}`)
          console.log(`Notification Failure OrderId - ${body['OrderId']} | Id - ${payment.id} | Amount - ${body['Amount']} | TerminalKey - ${terminalData.TERMINAL_KEY}`);
      }
    } catch (err) {
      console.log(`FAILED Notification Failure OrderId - ${body['OrderId']}`, err);
    }
})


// CREATE payment
// POST /payments/take/
// request ––
// {
//   redirect: true,
//   order_id: 'ORD-1521872',
//   amount: 2490
// }
paymentsRouter.post('/payments/take/', async function (ctx, next) {
    console.log('body=', ctx.request.body);
    try{
        logger.info(`Take payment Amount - ${ctx.request.body.amount} | OrderId - ${ctx.request.body.order_id} | Descr - ${ctx.request.body.description} | IP - ${ctx.request.header['x-real-ip']}`)
        let get_param = {}
        let form_amount = ctx.request.body.amount
        let amount
        if (form_amount){
            regExpAmount.lastIndex = 0;
            let re_amount = regExpAmount.exec(form_amount)
            if (re_amount === null){
                logger.info(`Take payment Amount error OrderId - ${ctx.request.body.order_id} | Amount - ${ctx.request.body.amount}`)
                ctx.body = {"Success": true, "Data": {"redirect": '/payments/failure/'}}
                return
            }
            let whole = re_amount[1]
            let fraction = re_amount[2] || '';
            if (fraction) {
                fraction = fraction.replace(/[\.,]+/g, '');
            }
            if (!fraction){
                amount = whole + '00'
            } else if (fraction.length == 2){
                amount = whole + fraction
            } else if (fraction.length == 1){
                amount = whole + fraction + '0'
            } else {
                logger.error(`Take payment Amount error OrderId - ${ctx.request.body.order_id} | Amount - ${ctx.request.body.amount}`)
                ctx.body = {"Success": true, "Data": {"redirect": '/payments/failure/'}}
                return
            }
        }
        get_param['Amount'] = amount
        get_param['IP'] = ctx.request.header['x-real-ip']
        let terminalData = await getTerminalData(null, ctx.request.body.order_id, ctx)
        let last_payment = await Payment.findOne({order: [['id', 'DESC']]})
        let create_payment = {'OrderId': ctx.request.body.order_id, 'Amount': Number(get_param['Amount']), 'Description': ctx.request.body.description, 'IP': get_param['IP'], 'redirectNewSite': false, 'redirectPath': '', id: Number(last_payment.id) + 1, 'payment_org_type': terminalData['NAME']}
        if (ctx.request.body.redirect){
            create_payment['redirectNewSite'] = true
            create_payment['redirectPath'] = ctx.request.headers.referer
        }
        let payment = await Payment.create(create_payment)
        get_param['OrderId'] = payment.id

        // Get Terminal data

        get_param['TerminalKey'] = terminalData.TERMINAL_KEY
        get_param['Password'] = terminalData.PASSWORD

        get_param['Token'] = get_token(get_param)
        payment.Token = get_param['Token']
        await payment.save()
        let response = await new Promise((reslove, reject) => {
            // todo request in utils
            let req = https.get({host: URL_TINKOFF, path: "/rest/Init/?" + querystring.stringify(get_param) }, (res) => {
                let response = ''
                res.on('data', (chunk) => {
                  response += chunk;
                });
                res.on('end', ()=>{
                    reslove(response)
                })
            })
            req.setTimeout(1000 * 20, function () {
                reject(new Error(`Request tinkoff timeout error ${"/rest/Init/?" + querystring.stringify(get_param)}`))
            })
            req.on('error', (e) => {
                reject(new Error(`The request tinkoff ended in failure ${"/rest/Init/?" + querystring.stringify(get_param)}`))
            })
            req.end()
        })
        let parseResponse = JSON.parse(response)
        if (parseResponse['Success'] == true){
            logger.info(`Init Success OrderId - ${payment.OrderId}, Id - ${payment.id}`)
            payment.initial = true
            payment.PaymentId = parseResponse['PaymentId']
            await payment.save()
            if (payment.redirectPath) {
                ctx.response.set("Access-Control-Allow-Origin", "www.domovenok.su")
                ctx.body = {"Success": true, "Data": {"redirect": parseResponse['PaymentURL']}}
                return
            } else {
                ctx.body = {"Success": true, "Data": {"redirect": parseResponse['PaymentURL']}}
                return
            }
        }
        logger.error(`Init Failure OrderId - ${ctx.request.body.order_id} | ErrorCode - ${parseResponse['ErrorCode']} | Details - ${parseResponse['Details']}`)
        if (payment.redirectPath) {
            ctx.body = {"Success": false, "ErrorCode": -1}
            ctx.response.set("Access-Control-Allow-Origin", "www.domovenok.su")
            return
        }
        const template = getTemplate({path: 'templates/payments/failure.html', name: 'paymentsFailure'})
        ctx.body = template(ctx.proc())
        return
    } catch (e) {
        logger.info(e)
    }
    ctx.body = {"Success": true, "Data": {"redirect": '/payments/failure/'}}
})


class Send_to_1c {
  constructor() {
    this._1c_url = 'http://webhooks.domovenok.su/tinkoff';
    this._logger = function () {
      return {
        info: (...str) => {
          console.log('INFO:', str);
        },
        warn: (...str) => {
          console.log('WARN:', str);
        }
      }
    };
    this._logger = this._logger();
    // TODO: init logger
  }

  async success(query_param) {
    throw new Error('Not implement')
  }

  async fail(query_param) {
    try {
      const url = this._1c_url +'/?'+ new URLSearchParams(query_param)
      console.log('HERE', url);
      // return;
      const { error, response, body } = await request_promise.get(url);
      if (error) {
        // console.log('error writo to file', error, response);
        this._logger.warn('error writo to file', error, response);
      } else {
        // SEND responce to 1c
        this._logger.info('SEND responce to 1c =', body);
      }
    } catch (err) {
      this._logger.warn('err write to file', err);
    }
  }

}


module.exports = {
    paymentsRouter,
    getState
}