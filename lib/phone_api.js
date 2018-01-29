#!/usr/local/bin/node

'use strict';

// WORK WITH PHONE

const db = require('/p/pancake/my/db.js');
const logger = require('/p/pancake/lib/logger.js');

const phone = exports;

// if user come from 2gis
// example url: https://nn.domovenok.su/?utm_source=2gis.ru&utm_medium=referral&utm_referrer=2gis.ru
phone.set_for_from_2gis = function (ctx) {
  const user = ctx.state.pancakeUser;
  const phone = user.set_phone('78312281061');
  db.edit('UPDATE users SET current_phone=$1 WHERE uuid=$2', [ phone, user.uuid ]).catch(err => logger.warn(err));
};


phone.get = function (ctx) {
  const user = ctx.state.pancakeUser;
  const track = user.track;
  const phone = (track.numbers && track.numbers[user.city.keyword]) ? track.numbers[user.city.keyword] : user.get_phone();
  return phone;
};

