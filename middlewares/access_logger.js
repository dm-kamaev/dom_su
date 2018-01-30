'use strict';

const koa_morgan = require('/p/pancake/lib/koa_morgan.js');
const rfs = require('rotating-file-stream');

koa_morgan.token('uuid', function(req, res) {
  const uuid = req.ctx.state.pancakeUser.uuid;
  return uuid;
});

koa_morgan.token('hit_id', function(req, res) {
  const context = req.ctx.state.context;
  return context.get('hit_id');
});

koa_morgan.token('req_time', function(req, res) {
  const context = req.ctx.state.context;
  return context.get('req_time');
});

koa_morgan.token('req_time_ms', function(req, res) {
  const context = req.ctx.state.context;
  return context.get('req_time_ms');
});

const access_logger = exports;
// /Users/dmitrijd/Desktop/p/pancake/middlewares
// console.log(__dirname);
// FORMAT:
// 92661aa8-7f51-431f-bc70-589530799f87 | 7aefc400-05a0-11e8-96f9-f1b08f6d19b2 | ::ffff:127.0.0.1 | POST | /event-handler | Tue Jan 30 2018 12:32:25 GMT+0300 (MSK) | 1517304745024 | 54.441ms | 200 | 16 | https://www.dev2.domovenok.su/ | HTTP/1.0 | Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36
// write in file
access_logger.to_file = function() {

  const folder = '/p/log/access_log/';
  const stream = rfs('access_log_pancake.log', {
    interval: '1d', // rotate daily
    path: folder,
    compress: 'gzip'
  });

  return koa_morgan(function(tokens, req, res) {
    return [
      tokens.uuid(req, res),
      tokens.hit_id(req, res),
      tokens['remote-addr'](req, res) || tokens['remote-user'](req, res),
      tokens.method(req, res),
      tokens.url(req, res),
      // tokens['date'](req, res, 'clf'),
      tokens.req_time(req, res),
      tokens.req_time_ms(req, res),
      tokens['response-time'](req, res) + 'ms',
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      tokens.referrer(req, res),
      'HTTP/' + tokens['http-version'](req, res),
      tokens['user-agent'](req, res),
    ].join(' | ');
  }, {
    stream
  });
};

// write to stdout
access_logger.to_out = function() {
  return koa_morgan(function(tokens, req, res) {
    return [
      tokens.uuid(req, res),
      tokens.hit_id(req, res),
      tokens['remote-addr'](req, res) || tokens['remote-user'](req, res),
      tokens.method(req, res),
      tokens.url(req, res),
      // tokens['date'](req, res, 'clf'),
      tokens.req_time(req, res),
      tokens.req_time_ms(req, res),
      tokens['response-time'](req, res) + 'ms',
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      tokens.referrer(req, res),
      'HTTP/' + tokens['http-version'](req, res),
      tokens['user-agent'](req, res),

    ].join(' | ');
  });
};