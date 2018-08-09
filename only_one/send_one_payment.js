'use strict';

const { Payment } = require('/p/pancake/models/models.js');
const loggerPay = require('/p/pancake/logger/index.js')(module, 'pay.log');
const { saveAndSend } = require('/p/pancake/tickets/index.js');
const moment = require('moment');

async function send_one_payment_to_1c(where) {
  const payment = await Payment.findAll({
    where
  });
  if (!payment) {
    throw new Error('Not found payment');
  }
  const data = {};
  data['OrderId'] = payment.OrderId;
  data['Amount'] = payment.Amount;
  data['Description'] = payment.Description;
  data['PaymentOrgType'] = payment.payment_org_type;
  data['id'] = payment.id;
  data['date'] = moment.parseZone(moment(payment.create_time).utcOffset('+03:00').format('YYYY-MM-DDTHH:mm:ssZ')).format('YYYY-MM-DDTHH:mm:ss') + 'Z';
  data['PaymentId'] = payment.PaymentId;
  // TODO add user_uuid field in payments
  // data['user_id'] = ctx.state.pancakeUser.uuid
  try{
    await saveAndSend('PaymentSuccess', data);
    loggerPay.info(`SCHEDULE Payment Success Completed OrderId - ${payment.OrderId} | Id - ${payment.id}`);
  } catch (e){
    loggerPay.error(`SCHEDULE Tickets are not sent ${JSON.stringify(data)}`);
  }
}

void async function () {
  await send_one_payment_to_1c({ id: 43738 });
}();