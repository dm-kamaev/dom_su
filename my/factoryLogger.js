#!/usr/local/bin/node

"use strict";

// CREATE LOGGER

const fs = require('fs');
const time = require('/p/pancake/my/time.js');
const wf_sync = require('/p/pancake/my/wf_sync.js');
const Email = require('/p/pancake/my/email.js');

module.exports = class FactoryLogger {
  // option –– {
  //   title: 'clientPa',
  //   fileOne: '/p/log/app/clientPA.log',
  //   jsonStringify: true,
  //   consoleLog: true,
  // }
  constructor(option) {
    this.option = option;
  }

  get() {
    return new Logger(this.option);
  }

  rotate_by_restart_app() {
    const file_path = this.option.fileOne;
    if (!wf_sync.exist(file_path)) {
      wf_sync.write(file_path, '');
      return this;
    }
    const file_info = wf_sync.get_file_info(file_path);
    const mtime = time.format('YYYY_MM_DD_hh_mm_ss', file_info.mtime);
    const new_name_for_old_file = file_path.replace(/\.log$/, '__' + mtime);
    console.log(file_path, file_path.replace(/\.log$/, '_' + mtime + '.log'));
    wf_sync.rename(file_path, file_path.replace(/\.log$/, '_' + mtime + '.log'));
    wf_sync.write(file_path, '');
    return this;
  }
};

// TODO: check env variable
// TODO: rotate, when restart app
// TODO: set color
class Logger {
  constructor(option) {
    this.title = option.title;
    this.fileOne = option.fileOne;
    this.streamFile = fs.createWriteStream(this.fileOne, { flags : 'a' });
    this.jsonStringify = option.json_stringify;
    this.consoleLog = option.consoleLog;
    this.period = 1000 * 60 * 5; // 5 минут

    this.journalWarnings = {};
  }

  log(text) {
    this.write_(text);
    if (this.consoleLog) {
      console.log(text);
    }
  }

  info(text) {
    if (this.jsonStringify && text instanceof Object) {
      text = JSON.stringify(text, null, 2);
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

  warn(text) {
    if (!text) {
      return;
    }
    if (this.jsonStringify && text instanceof Object) {
      text = JSON.stringify(text, null, 2);
    }
    const now = time.get();
    let error;
    if (text instanceof Error) {
      error = text.stack;
    } else {
      error = new Error(text).stack;
    }

    var title = this.title.trim().toUpperCase();
    var prefix = time.format('[YYYY/MM/DD hh:mm:ss] ', now) + '[' + title + '] error_ms:' + now.in_ms + '\n';
    // const prefix_with_color = color.set_bred(prefix);
    const prefix_with_color = prefix;

    const output = prefix_with_color + error;
    this.sendOrNotEmail_(title, prefix + error);
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
  // if (CONF.is_env('prod') && me.is_send_email) {
  const subject = 'Warning: в '+title+'. Время: '+time.format('YYYY-MM-DD hh:mm:ss');
  // output = 'ENV = "'+CONF.env+'" \n'+output;
  output = 'ENV = "dev2" \n'+output;
  const data = {
    subject,
    text: output
  };
  new Email().toMe(data).send().catch(err => console.log(err));
  // }
}

// const logger = new module.exports({
//   title: 'pancake',
//   fileOne: '/p/log/clientPA.log',
//   jsonStringify: true,
// }).get();

// logger.warn('Opps its failed1');
// logger.warn('Opps its failed2');
// logger.warn('Opps its failed3');
// logger.warn('Opps its failed4');
// logger.warn('Opps its failed5');