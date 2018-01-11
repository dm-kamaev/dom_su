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
  'api1C': { // Лиза
    'ip': '192.168.1.144',
    'url': '/domovenok/hs/api/v2/',
    oldAPI: '/domovenok/hs/api/',
    'port': 80,
    'ticket_url': '/domovenok/hs/rq'
  },
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
  if (env === 'dev') {
    CONF.domain = 'https://www.dev.domovenok.su';
  } else if (env === 'dev2') {
    CONF.domain = 'https://www.dev2.domovenok.su';
  } else if (env === 'prod') {
    CONF.domain = 'https://www.domovenok.su';
    CONF.pg = {
      user: 'domovenok',
      password: 'TQ7Ee3q74F6hPNfp',
      database: 'domovenok',
      host: 'localhost'
    };
    CONF.api1C = {
      ip: '192.168.2.4', // prod
      url: '/domovenok/hs/api/v2/',
      oldAPI: '/domovenok/hs/api/',
      port: 80,
      ticket_url: '/domovenok/hs/rq'
    };
    CONF.analytics = {
      google: 'UA-26472404-10'
    };
  }
  return CONF;
}();