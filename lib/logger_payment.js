#!/usr/local/bin/node

'use strict';

// LOGGER FOR PAYMENT

const CONF = require('/p/pancake/settings/config.js');
const fs = require('fs');
const time = require('/p/pancake/my/time.js');
const wf_sync = require('/p/pancake/my/wf_sync.js');
const Email = require('/p/pancake/my/email.js');
const assert = require('assert');

const FOLDER_LOG = '/p/log/payment';
if (!wf_sync.exist(FOLDER_LOG)) {
  wf_sync.create_dir(FOLDER_LOG);
}


module.exports = class Logger_payment {
  constructor(ctx, params) {
    // singlteon
    if (ctx.state.logger_payment) {
      return ctx.state.logger_payment;
    }
    ctx.state.logger_payment = this;


    if (!params || !params.order_id) {
      throw new Error('You must set order_id');
    }
    this.option = {
      title: 'payment',
      json_stringify: true,
      consoleLog: true,
    };
    this.option = Object.assign({}, this.option, params);

    const option = this.option;
    this.title = option.title;
    // this.fileOne = option.fileOne;
    this.streamFile = fs.createWriteStream(FOLDER_LOG+'/'+option.order_id+'.log', { flags : 'a' });
    this.jsonStringify = option.json_stringify;
    this.consoleLog = option.consoleLog;
    this.period = 1000 * 60 * 5; // 5 минут

    this.journalWarnings = {};
  }

  // this.log('')
  log(text) {
    this.write_(text);
    if (this.consoleLog) {
      console.log(text);
    }
  }

  // this.info('OOps error', new Error('Error'), { name: 1, key: 2, test: 3 })
  info() {
    let text = '';
    for (var i = 0, l = arguments.length; i < l; i++) {
      let el = arguments[i];
      if (el instanceof Error) {
        text += el.stack+' ';
      } else if (this.jsonStringify && el instanceof Object) {
        text += JSON.stringify(el, null, 2)+' ';
      } else {
        text += el+' ';
      }
    }

    const now = time.get();

    var title = this.title.trim().toUpperCase();
    var prefix = time.format('INFO: [YYYY/MM/DD hh:mm:ss] ', now) + '[' + title + '] info_ms:' + now.in_ms + '\n';
    // const prefix_with_color = color.set_bgreen(prefix);
    const prefix_with_color = prefix;

    const output = prefix_with_color + text;
    this.write_(output);
    if (this.consoleLog) {
      console.log(output);
    }
  }

  // this.warn('OOps error', new Error('Error'), { name: 1, key: 2, test: 3 })
  warn() {
    let text = '';
    for (var i = 0, l = arguments.length; i < l; i++) {
      let el = arguments[i];
      if (el instanceof Error) {
        text += el.stack+' ';
      } else if (this.jsonStringify && el instanceof Object) {
        text += JSON.stringify(el, null, 2)+' ';
      } else {
        text += el+' ';
      }
    }

    const now = time.get();

    var title = this.title.trim().toUpperCase();
    var prefix = time.format('WARN: [YYYY/MM/DD hh:mm:ss] ', now) + '[' + title + '] error_ms:' + now.in_ms + '\n';
    // const prefix_with_color = color.set_bred(prefix);
    const prefix_with_color = prefix;

    const output = prefix_with_color + text;
    this.sendOrNotEmail_(title, prefix + text);
    this.write_(output);
    if (this.consoleLog) {
      console.log(output);
    }
  }

  write_(text) {
    this.streamFile.write(text+' \n\n');
  }

  sendOrNotEmail_(title, output) {
    const ms = time.get().in_ms;
    const journalWarnings = this.journalWarnings;
    if (journalWarnings[title]) {
      var diff = ms - journalWarnings[title];
      if (diff > this.period) { // if the timeout is over then send email
        journalWarnings[title] = ms;
        sendEmail(title, output);
      }
    } else { // if not exist error with "title"
      journalWarnings[title] = ms;
      sendEmail(title, output);
    }
  }
}

function sendEmail(title, output) {
  if (CONF.is_prod) {
    const subject = 'Warning: в '+title+'. Время: '+time.format('YYYY-MM-DD hh:mm:ss');
    // output = 'ENV = "'+CONF.env+'" \n'+output;
    output = 'ENV = "'+CONF.env+'" \n'+output;
    const data = {
      subject,
      text: output
    };
    new Email().toMe(data).send().catch(err => console.log(err));
  }
}

// ======================
// unit_test();
function unit_test() {

  let logger_payment;

  logger_payment = new module.exports();

  logger_payment = new module.exports({
    order_id: 7378
  });

  logger_payment.info('Hell world');
  logger_payment.info('Hell world', new Error('Here'), [ 1, 2, 3 ]);

  logger_payment.warn('OOps error', new Error('Error'), { name: 1, key: 2, test: 3 });

}
