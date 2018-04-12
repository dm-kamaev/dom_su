'use strict';

const db = require('/p/pancake/my/db.js');
const promise_api = require('/p/pancake/my/promise_api.js');
const json2xls = require('json2xls');
const fs = require('fs');

void async function () {
  const paymnets = await db.read(`
    SELECT
      "id",
      "create_time",
      "OrderId",
      "PaymentId",
      "Amount",
      "IP",
      "Description",
      "Token",
      "CustomerKey",
      "DATA",
      "initial",
      "notification",
      "success",
      "redirectNewSite",
      "redirectPath",
      "createdAt",
      "updatedAt",
      payment_org_type
    FROM
      payments
  `);
  fs.writeFileSync('/p/pancake/only_one/payments.xlsx',  json2xls(paymnets), 'binary');
  global.process.exit();
}();

