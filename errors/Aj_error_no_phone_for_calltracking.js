'use strict';

const Aj_errors_base = require('/p/pancake/errors/Aj_errors_base.js');

module.exports = class Aj_error_no_phone_for_calltracking extends Aj_errors_base {
  constructor() {
    const message = 'There are no availables phones';
    super(message);
    this.message = message;
    this.set_status(422);
    this.set_error({
      code: -6,
      text: message
    });
  }
};