'use strict';

const Aj_errors_base = require('/p/pancake/errors/Aj_errors_base.js');

module.exports = class Aj_error_access_denied extends Aj_errors_base {
  constructor() {
    super();
    this.set_status(403);
    this.set_error({
      code: -3,
      text: 'Access denied'
    });
  }
};