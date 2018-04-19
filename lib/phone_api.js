#!/usr/local/bin/node

'use strict';

// WORK WITH PHONE ON SITE

const db = require('/p/pancake/my/db.js');
const logger = require('/p/pancake/lib/logger.js');

const phone_api = exports;

// if user come from 2gis
// example url: https://nn.domovenok.su/?utm_source=2gis.ru&utm_medium=referral&utm_referrer=2gis.ru
// phone –– '78312281061'
phone_api.set_for_from_2gis = function (ctx, phone) {
  const user = ctx.state.pancakeUser;
  phone = user.set_phone(phone);
  db.edit('UPDATE users SET current_phone=$1 WHERE uuid=$2', [ phone, user.uuid ]).catch(err => logger.warn(err));
};

// get phone for client on site
phone_api.get_for_client = function (ctx) {
  const user = ctx.state.pancakeUser;
  // { done: null, waiting: null, numbers: { moscow: '74957899080' }, applicant_numbers: { moscow: '74957893321 } }
  const track = user.track;
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


// get phone for applicant(potenial employee) on site
phone_api.get_for_applicant = function (ctx) {
  const user = ctx.state.pancakeUser;
  // { done: null, waiting: null, numbers: { moscow: '74957899080' }, applicant_numbers: { moscow: '74957893321 } }
  const track = user.track;
  const applicant_numbers = track.applicant_numbers;
  const city_keyword = user.city.keyword;
  let phone;
  if (applicant_numbers && applicant_numbers[city_keyword]) {
    phone = applicant_numbers[city_keyword];
  } else if (user.get_phone()) {
    phone = user.get_phone();
  } else {
    phone = user.city.phone;
  }
  return phone;
};

