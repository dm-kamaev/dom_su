'use strcit';

// ERROR  FROM 1C

const json = require('/p/pancake/my/json.js');

// TODO(2018.04.17): Refactor maybe

module.exports = class Error_1C_base extends Error {
  constructor(error_obj) {
    const str_error_obj = json.str(error_obj);
    super(str_error_obj);
    this._status = 500;
    this._body = {
      ok: false,
      error: error_obj
    };
  }

  set_status(status) {
    this._status = status;
  }
  set_error(error) {
    this._body.error = error;
  }

  get status() {
    return this._status;
  }

  get body() {
    return this._body;
  }
};