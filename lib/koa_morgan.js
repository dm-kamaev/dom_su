'use strict';

const originalMorgan = require('morgan');

/**
 * Expose `morgan`.
 */

module.exports = morgan;

morgan.compile = originalMorgan.compile;
morgan.format = originalMorgan.format;
morgan.token = originalMorgan.token;

function morgan(format, options) {
  const fn = originalMorgan(format, options);
  return (ctx, next) => {
    ctx.req.my_state = ctx.state;
    return new Promise((resolve, reject) => {
      fn(ctx.req, ctx.res, (err) => {
        err ? reject(err) : resolve(ctx);
      });
    }).then(next);
  };
}
