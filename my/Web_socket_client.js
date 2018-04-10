#!/usr/local/bin/node

'use strict';

// CLIENT WS FOR COMMUNICATE WITH Python WS (Tornado)

const Ws = require('ws');
const logger_ws = require('/p/pancake/lib/logger_ws.js');
const json = require('/p/pancake/my/json.js');

// "ws": {
//       "address": "ws://192.168.2.13:80/ws?",
//       "clientFlag": "Client1C",
//       "serverFlag": "Production",
//       "authKey": "asdjf27FASdh27daq3k1"
//   },

module.exports = class Web_socket_client {
  constructor() {
    this.auto_reconnect_interval = 2000 * 10; // ms // 20 sec
  }

  open(url) {
    this.url = url;
    this.can_reconnect = true;
    this.instance = new Ws(this.url);

    this.instance.on('open', () => {
      logger_ws.info('OPEN WS');
      this.on_open();
    });

    this.instance.on('message', (data, flags) => {
      this.onmessage(data, flags);
    });

    this.instance.on('close', (e) => {
      switch (e) {
        case 1000: // CLOSE_NORMAL
          logger_ws.log('WebSocket: closed normal');
          break;
        default: // Abnormal closure
          logger_ws.log('abnormal closure')
          this.reconnect(e);
          break;
      }
      this.onclose(e);
    });

    this.instance.on('error', (error) => {
      switch (error.code) {
        case 'ECONNREFUSED':
          logger_ws.warn('ON ERROR')
          this.reconnect(error);
          break;
        default:
          this.onerror(error);
          break;
      }
    });
  }


  send(data, option) {
    try {
      logger_ws.info(json.str(data));
      this.instance.send(json.str(data), option);
    } catch (error) {
      this.instance.emit('error', error);
    }
  }


  reconnect(e) {
    logger_ws.log(`WebSocketClient: retry in ${this.auto_reconnect_interval} ms `+e);
    var self = this;
    if (this.can_reconnect) {
      this.can_reconnect = false
      setTimeout(function() {
        logger_ws.log('WebSocketClient: reconnecting...');
        self.can_reconnect = true
        self.open(self.url);
      }, this.auto_reconnect_interval);
    }
  }


  onerror(e) {
    logger_ws.info('WebSocketClient: error'+JSON.stringify(arguments, null, 2));
  }

  onclose(e) {
    logger_ws.info('WebSocketClient: closed'+JSON.stringify(arguments, null, 2))
  }

};