'use strict';

const mongoose = require('mongoose');
const CONF = require('/p/pancake/settings/config.js');

module.exports = mongoose;

mongoose.Promise = global.Promise;
mongoose.connect(CONF.mongodb.url, {
  useMongoClient: true,
  // sets how many times to try reconnecting
  reconnectTries: Number.MAX_VALUE,
  // sets the delay between every retry (milliseconds)
  reconnectInterval: 1000
});

