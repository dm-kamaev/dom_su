#!/usr/local/bin/node

'use strict';

// КОНФИГУРАЦИОННЫЙ ФАЙЛ

const os = require('os');
const config = require('/p/pancake/settings/config_pancake.json');

if (!config.env) {
  throw new Error('Not exist env for node js "'+config.env+'"');
}
// if (env !== 'dev' && env !== 'dev2' && env !== 'dev3' && env !== 'prod') {
//   throw new Error('Not valid env for node js "'+env+'"');
// }

const enum_api_1C = {
  SASHA: 'sasha',
  PASHA: 'pasha',
  LIZA: 'liza',
  MASHA: 'masha',
  PROD: 'prod'
};

const HOSTNAME = os.hostname();
const CONF = config;
// const CONF = {
//   env,
//   pg: {
//     user: 'domovenok',
//     password: 'domovenokPG',
//     database: 'pancake',
//     host: 'localhost',
//     port: 5432,
//     max: 10, // max number of clients in the pool
//     idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
//   },
//   session_uid: 'session_uid_dom_dev', // cookie user uuid
//   analytics: {
//     google: 'UA-91645230-1'
//   }
// };

module.exports = function() {
  const env = CONF.env;
  // remove in future
  CONF.is_new_dev = () => {
    return (HOSTNAME === 'dev1' && env === 'dev1') || (HOSTNAME === 'dev2' && env === 'dev2') || (HOSTNAME === 'dev3' && env === 'dev3');
  };
  CONF.is_dev = (CONF.env !== 'prod');
  CONF.is_prod = (CONF.env === 'prod');
  CONF.ws = { // websocket
    address: 'ws://127.0.0.1:8888/ws',
    auth_key: 'SNYn4U1OqDWWxSBd1gZR',
  };
  switch (env) {
    case 'dev1':
      CONF.is_dev1 = true;
      // CONF.domain = 'https://www.dev2.domovenok.su';
      CONF.api1C = get_api_1c(enum_api_1C.SASHA);
      CONF.webhook = get_webhook(enum_api_1C.LIZA);
      break;
    case 'dev2':
      // CONF.domain = 'https://www.dev.domovenok.su';
      CONF.api1C = get_api_1c(enum_api_1C.PASHA);
      CONF.webhook= get_webhook(enum_api_1C.LIZA);
      break;
    case 'dev3':
      CONF.api1C = get_api_1c(enum_api_1C.SASHA);
      CONF.webhook= get_webhook(enum_api_1C.LIZA);
      break;
    case 'prod':
      CONF.api1C = get_api_1c(enum_api_1C.PROD);
      CONF.ws.address = 'ws://ws.domovenok.su/ws';
      CONF.webhook= get_webhook(enum_api_1C.PROD);
      // CONF.domain = 'https://www.domovenok.su';
      // CONF.pg.password = 'TQ7Ee3q74F6hPNfp';
      // CONF.pg.database ='domovenok',
      // CONF.analytics = {
      //   google: 'UA-26472404-10'
      // };
      // CONF.session_uid = 'session_uid_dom';
      break;
    default:
      CONF.api1C = get_api_1c(enum_api_1C.SASHA);
      console.log('Environment not determined: installed default settings');
      // throw new Error('Not valid env for node js "'+env+'". Valid value: dev, dev2, prod');
  }
  return CONF;
}();


function get_api_1c(developer_name) {
  let api_1C;
  switch (developer_name) {
    case enum_api_1C.SASHA:
      api_1C = {
        ip: '192.168.1.63', // Саша
        url: '/domovenok/hs/api/v2/',
        oldAPI: '/domovenok/hs/api/',
        port: 80,
        ticket_url: '/domovenok/hs/rq'
      };
      break;
    case enum_api_1C.LIZA:
      api_1C = { // Лиза
        ip: '192.168.1.144',
        url: '/domovenok/hs/api/v2/',
        oldAPI: '/domovenok/hs/api/',
        port: 80,
        ticket_url: '/domovenok/hs/rq'
      };
      break;
    case enum_api_1C.PASHA:
      api_1C = { // Паша
        ip: '192.168.1.50',
        url: '/domovenok/hs/api/v2/',
        oldAPI: '/domovenok/hs/api/',
        port: 80,
        ticket_url: '/domovenok/hs/rq'
      };
      break;
    case enum_api_1C.MASHA:
      api_1C = { // Маша
        ip: '192.168.1.119',
        url: '/domovenok/hs/api/v2/',
        oldAPI: '/domovenok/hs/api/',
        port: 80,
        ticket_url: '/domovenok/hs/rq'
      };
      break;
    case enum_api_1C.PROD:
      api_1C = {
        ip: '192.168.2.4', // prod
        url: '/domovenok/hs/api/v2/',
        oldAPI: '/domovenok/hs/api/',
        port: 80,
        ticket_url: '/domovenok/hs/rq'
      };
      break;
    default:
      throw new Error(`Not valid developer_name '${developer_name}'. Valid value: sasha, liza, pasha, prod`);
  }
  return api_1C;
}


function get_webhook(developer_name) {
  let webhook;
  switch (developer_name) {
    case enum_api_1C.LIZA:
      webhook = {
        url: 'http://pc45.domovenok.corp/domovenok/hs/webhooks/tinkoff',
      };
      break;
    case enum_api_1C.PROD:
      webhook = {
        url: 'http://webhooks.domovenok.su/tinkoff',
      };
      break;
    default:
      throw new Error(`Not valid developer_name '${developer_name}'. Valid value: liza, prod`);
  }
  return webhook;
}
