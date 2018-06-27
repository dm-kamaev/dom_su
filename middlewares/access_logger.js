'use strict';

const rfs = require('rotating-file-stream');
const koa_morgan = require('/p/pancake/lib/koa_morgan.js');
const time = require('/p/pancake/my/time.js');
const logger_for_auth_user = require('/p/pancake/lib/logger_for_auth_user.js');
const logger = require('/p/pancake/lib/logger.js');


koa_morgan.token('uuid', function(req) {
  const state = req.ctx.state || {};
  const user = state.pancakeUser || {};
  return user.uuid || '';
});

koa_morgan.token('hit_id', function(req) {
  const context = req.ctx.state.context;
  return context.get('hit_id');
});

koa_morgan.token('ip', function(req) {
  const header = req.headers;
  return header['x-forwarded-for'] || '';
});

koa_morgan.token('req_time', function(req) {
  const context = req.ctx.state.context;
  return context.get('req_time');
});

koa_morgan.token('req_time_ms', function(req) {
  const context = req.ctx.state.context;
  return context.get('req_time_ms');
});


koa_morgan.token('headers', function(req) {
  return JSON.stringify(req.headers);
});


koa_morgan.token('request_body', function(req) {
  const ctx = req.ctx;
  const body = ctx.request.body;
  return (body instanceof Object) ? JSON.stringify(body) : body;
});


// logger for responce body, ONLY JSON
// write to file with global access_log
// if auth write to user's file
koa_morgan.token('responce_body_and_log_auth_user', function(req) {
  const ctx = req.ctx;
  const responce_body = ctx.body;

  // only json
  const str_responce_body = (responce_body instanceof Object) ? JSON.stringify(responce_body) : '';
  // logger_for_auth_user.init(ctx).then(() => {
  //   const user = ctx.state.pancakeUser || {};
  //   const context = ctx.state.context;

  //   const request_body = ctx.request.body;
  //   const str_request_body = (request_body instanceof Object) ? JSON.stringify(request_body) : '';
  //   const msg = [
  //     time.format('[YYYY/MM/DD hh:mm:ss]'),
  //     user.uuid,
  //     context.get('hit_id'),
  //     req.method,
  //     req.url,
  //     JSON.stringify(req.headers),
  //     str_request_body,
  //     str_responce_body,
  //   ].join(' | ');

  //   // console.log('HERE', msg);
  //   // if auth write user's file
  //   return logger_for_auth_user.log(msg);
  // }).catch(err =>{
  //   logger.warn(err);
  // });
  return str_responce_body;
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
    compress: function(source, dest) { // Modified compress function, add extension .gz
      // Also removes logs older than 30 days
      return (
        'cat ' + source + ' | gzip -c9 > ' + dest + '.gz; '+
        'rm -f ' + dest +';'+
        'find /p/log/access_log/*access_log_pancake.log -mtime +30 -delete;'+ // test: -mmin +3
        'find /p/log/access_log/*access_log_pancake.log.gz -mtime +30 -delete;'
      );
    }
  });

  return koa_morgan(function(tokens, req, res) {
    return [
      tokens.uuid(req, res),
      tokens.hit_id(req, res),
      // tokens['remote-addr'](req, res) || tokens['remote-user'](req, res),
      tokens.ip(req, res),
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
      tokens.headers(req, res), // log to file full headers not only user-agnet
      tokens.request_body(req, res), // log only to file
      tokens.responce_body_and_log_auth_user(req, res), // log only to file
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
      // tokens['remote-addr'](req, res) || tokens['remote-user'](req, res),
      tokens.ip(req, res),
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