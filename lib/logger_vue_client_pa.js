#!/usr/local/bin/node

'use strict';

// CLIENT LOGGER FOR vue client_pa

const FactoryLogger = require('/p/pancake/my/factoryLogger.js');

module.exports = new FactoryLogger({
  title: 'vue-client-pa',
  fileOne: '/p/log/app/vue_client_pa.log',
  json_stringify: true,
  consoleLog: true,
}).get();