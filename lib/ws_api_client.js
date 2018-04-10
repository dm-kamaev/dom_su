#!/usr/local/bin/node

'use strict';

const CONF = require('/p/pancake/settings/config.js');
const logger_ws = require('/p/pancake/lib/logger_ws.js');
const Web_socket_client = require('/p/pancake/my/Web_socket_client.js');

const web_socket_client = new Web_socket_client();

module.exports = web_socket_client;

// "ws": {
//       "address": "ws://192.168.2.13:80/ws?",
//       "clientFlag": "Client1C",
//       "serverFlag": "Production",
//       "authKey": "asdjf27FASdh27daq3k1"
//   },
// CONF.ws = {
//   address: 'ws://127.0.0.1:8888/ws',
//   auth_key: 'SNYn4U1OqDWWxSBd1gZR',
// };

web_socket_client.on_open = function () {
  logger_ws.info('start WS working');
  const data = {
    Type: 'Request',
    Name: 'SpecialClient',
    Key: CONF.ws.auth_key
  };
  this.send(data);
};


web_socket_client.onmessage = function(message) {
  // TODO: NEXT;
  // if (this.appInterface) {
  //   this.appInterface.router(message);
  // }
};

web_socket_client.open(CONF.ws.address);