#!/usr/local/bin/node

'use strict';

// КОНФИГУРАЦИОННЫЙ ФАЙЛ

const env = require('/p/env/node_env.js');

if (env !== 'dev' && env !== 'dev2' && env !== 'dev3' && env !== 'prod') {
  throw new Error('Not valid env for node js "'+env+'"');
}

const CONF = {
  env,
  pg: {
    user: 'domovenok',
    password: 'domovenokPG',
    database: 'pancake',
    host: 'localhost'
  },
  // api1C: {
  //   ip: '192.168.1.63', // Саша
  //   url: '/domovenok/hs/api/v2/',
  //   oldAPI: '/domovenok/hs/api/',
  //   port: 80,
  //   ticket_url: '/domovenok/hs/rq'
  // },
  // 'api1C': { // Лиза
  //   'ip': '192.168.1.144',
  //   'url': '/domovenok/hs/api/v2/',
  //   oldAPI: '/domovenok/hs/api/',
  //   'port': 80,
  //   'ticket_url': '/domovenok/hs/rq'
  // },
  // api1C: { // Паша
  //   ip: '192.168.1.50',
  //   url: '/domovenok/hs/api/v2/',
  //   oldAPI: '/domovenok/hs/api/',
  //   port: 80,
  //   ticket_url: '/domovenok/hs/rq'
  // },
  // api1C: { // Не работающий прод
  //   ip: '192.168.1.241',
  //   port: 80,
  //   url: '/domovenok/hs/api/v2/',
  // }
  analytics: {
    google: 'UA-91645230-1'
  }
};

module.exports = function() {
  switch (env) {
    case 'dev':
      CONF.domain = 'https://www.dev.domovenok.su';
      CONF.api1C = get_api_1c('sasha');
      break;
    case 'dev2':
      CONF.domain = 'https://www.dev2.domovenok.su';
      CONF.api1C = get_api_1c('sasha');
      break;
    case 'prod':
      CONF.domain = 'https://www.domovenok.su';
      CONF.pg = {
        user: 'domovenok',
        password: 'TQ7Ee3q74F6hPNfp',
        database: 'domovenok',
        host: 'localhost'
      };
      CONF.api1C = get_api_1c('prod');
      CONF.analytics = {
        google: 'UA-26472404-10'
      };
      break;
    default:
      throw new Error('Not valid env for node js "'+env+'". Valid value: dev, dev2, prod');
  }
  return CONF;
}();


function get_api_1c(developer_name) {
  let api_1C;
  switch (developer_name) {
    case 'sasha':
      api_1C = {
        ip: '192.168.1.63', // Саша
        url: '/domovenok/hs/api/v2/',
        oldAPI: '/domovenok/hs/api/',
        port: 80,
        ticket_url: '/domovenok/hs/rq'
      };
      break;
    case 'liza':
      api_1C = { // Лиза
        ip: '192.168.1.144',
        url: '/domovenok/hs/api/v2/',
        oldAPI: '/domovenok/hs/api/',
        port: 80,
        ticket_url: '/domovenok/hs/rq'
      };
      break;
    case 'pasha':
      api_1C = { // Паша
        ip: '192.168.1.50',
        url: '/domovenok/hs/api/v2/',
        oldAPI: '/domovenok/hs/api/',
        port: 80,
        ticket_url: '/domovenok/hs/rq'
      };
      break;
    case 'prod':
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