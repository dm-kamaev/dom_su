#!/usr/local/bin/node

'use strict';

// МОДУЛЬ ДЛЯ РАБОТЫ с CONTEXT

const logger = require('/p/pancake/lib/logger.js');

module.exports = class Context {

  constructor(ctx) {
    this.ctx = ctx || {};
  }

  set(key, val) {
    const ctx = this.ctx;
    if(ctx[key]) {
      const txt_err = `context.set already exist value by key '${key}'`;
      logger.warn(txt_err);
    } else {
      ctx[key] = val;
      return val;
    }
  }

  get(key) {
    const val = this.ctx[key];
    if (val || val === '' || val === 0 || val === false) {
      return val;
    } else {
      const txt_err = `context.get not exist value by key '${key}'`;
      logger.warn(txt_err);
      return new Error(txt_err);
    }
  }
};

// var context = new module.exports();
// context.set('test', { hello: true });
// context.get('test');
// context.set('test', [1, 2, 3]);