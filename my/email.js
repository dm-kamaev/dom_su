#!/usr/local/bin/node

"use strict";

// EMAIL

const email = require('emailjs');

module.exports = class Email {
  constructor(option) {
    this.option = option || {};
    this.recipients = []; // получатели
    var res = getSender(this.option);
    this.from   = res.from;
    // this.sender = res.sender;
    this.server = email.server.connect(res.sender);
    this.attachment = [];
  }

  toMe(data) {
    data = data || {};
    const send_to = {
      text: data.text,
      from: this.from,
      to: 'kamaev.d@domovenok.su',
      subject: data.subject,
    };

    this.recipients.push(send_to);
    return this;
  }

  // Something another recipients
  // { subject, text, email }
  to(data) {
    this.recipients.push({
      text: data.text || '',
      from: this.from,
      to:   data.email,
      subject: data.subject,
    });
    return this;
  }

  send() {
    const recipient = this.recipients.shift();
    return this.sendOne_(recipient);
  }

  sendOne_(fromWhom_WhereTo) {
    return new Promise((resolve, reject) => {
      this.server.send(fromWhom_WhereTo, function(err, message) {
        if (!err) {
          console.log(message);
        }
        if (err) {
          console.log('emailjs error => ', err, '\n\n', fromWhom_WhereTo);
          reject(err);
        } else {
          resolve()
        }
      });
    });
  }
}

function getSender(option) {
  return {
    from: 'robot@domovenok.su',
    sender: {
      user: 'robot@domovenok.su',
      password: 'Domovenok2008',
      host: 'smtp.yandex.ru',
      ssl: true,
    },
  };
}

// new Email().to({
//   email: 'kamaev.d@domovenok.su',
//   subject: 'to',
//   text: 'Hello world to'
// }).toMe({
//   subject: 'toKamaev',
//   text: 'Hello world Kamaev'
// }).send();
