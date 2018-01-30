#!/usr/local/bin/node

'use strict';

// WORK WITH PHONE

const db = require('/p/pancake/my/db.js');
const logger = require('/p/pancake/lib/logger.js');

const phone = exports;

// if user come from 2gis
// example url: https://nn.domovenok.su/?utm_source=2gis.ru&utm_medium=referral&utm_referrer=2gis.ru
// phone –– '78312281061'
phone.set_for_from_2gis = function (ctx, phone) {
  const user = ctx.state.pancakeUser;
  phone = user.set_phone(phone);
  db.edit('UPDATE users SET current_phone=$1 WHERE uuid=$2', [ phone, user.uuid ]).catch(err => logger.warn(err));
};


phone.get = function (ctx) {
  const user = ctx.state.pancakeUser;
  const track = user.track;
  // let number = (this.state.pancakeUser.track.numbers && this.state.pancakeUser.track.numbers[this.state.pancakeUser.city.keyword]) ? this.state.pancakeUser.track.numbers[this.state.pancakeUser.city.keyword] :  this.state.pancakeUser.city.phone
  let phone;
  if (track.numbers && track.numbers[user.city.keyword]) {
    phone = track.numbers[user.city.keyword];
  } else if (user.get_phone()) {
    phone = user.get_phone();
  } else {
    phone = user.city.phone;
  }
  return phone;
};

