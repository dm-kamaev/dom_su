'use strcit';

module.exports = class Aj_error extends Error {
  constructor() {
    super();
    this._status = 500;
    this._body = {
      ok: false,
      error: {
        code: -2,
        text: 'Internal error',
      }
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

  /**
   * get_responce:
   * @return {Object} { ok: false, { code: -1, text: '....text....' }}
   */
  get body() {
    return this._body;
  }


  /**
   * get_responce:
   * @return {Object} { ok: false, { code: -1, text: '....text....' }}
   */
  get_body() {
    return this._body;
  }

};