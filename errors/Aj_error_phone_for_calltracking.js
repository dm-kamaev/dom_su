'use strict';

const Aj_errors_base = require('/p/pancake/errors/Aj_errors_base.js');

module.exports = class Aj_error_phone_for_calltracking extends Aj_errors_base {
  /**
   * @param  {String} message
   */
  constructor(message) {
    super(message);
    this.message = message;
    this.set_status(422);
    this.set_error({
      code: -6,
      text: message
    });
  }
};