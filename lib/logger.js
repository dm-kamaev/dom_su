#!/usr/local/bin/node

"use strict";

// MAIN LOGGER FOR pancake

const FactoryLogger = require('/p/pancake/my/factoryLogger.js');

module.exports = new FactoryLogger({
  title: 'pancake',
  fileOne: '/p/log/app/pancake.log',
  jsonStringify: true,
  consoleLog: true,
}).get();