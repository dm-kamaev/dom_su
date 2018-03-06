#!/usr/local/bin/node

'use strict';

// КОНФИГУРАЦИОННЫЙ ФАЙЛ

// const env = require('/p/env/node_env.js');
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
  PROD: 'prod'
};

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
  switch (CONF.env) {
    case 'dev':
      // CONF.domain = 'https://www.dev.domovenok.su';
      CONF.api1C = get_api_1c(enum_api_1C.LIZA);
      break;
    case 'dev2':
      // CONF.domain = 'https://www.dev2.domovenok.su';
      CONF.api1C = get_api_1c(enum_api_1C.LIZA);
      // CONF.api1C = get_api_1c(enum_api_1C.SASHA);
      break;
    case 'dev3':
      CONF.api1C = get_api_1c(enum_api_1C.SASHA);
      break;
    case 'prod':
      CONF.is_prod = true;
      // CONF.domain = 'https://www.domovenok.su';
      // CONF.pg.password = 'TQ7Ee3q74F6hPNfp';
      // CONF.pg.database ='domovenok',
      CONF.api1C = get_api_1c(enum_api_1C.PROD);
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
