'use strict';

const Aj_errors_base = require('/p/pancake/errors/Aj_errors_base.js');

module.exports = class Aj_error_not_valid_param extends Aj_errors_base {
  constructor(msg) {
    super();
    this.message = msg;
    this.set_status(422);
    this.set_error({
      code: -5,
      text: 'Not valid param. '+msg
    });
  }
};