#!/usr/local/bin/node

'use strict';

// LOGGER FOR Websocket

const FactoryLogger = require('/p/pancake/my/factoryLogger.js');

module.exports = new FactoryLogger({
  title: 'Web_socket',
  fileOne: '/p/log/app/ws_pancake.log',
  json_stringify: true,
  consoleLog: true,
}).get();