'use strict';

const util = require('util');
const CONF = require('/p/pancake/settings/config.js');
const uuidName = 'uuidMUVal';
const uuidRegWithoutDash = util.format(':%s%s([a-f0-9]{32})', uuidName);

// let serverPath;
// if (CONF.is_prod) {
//   serverPath = {
//     schema: "https",
//     domain: "www.domovenok.su",
//     uri: "private"
//   };
// } else {
//   "serverPath": {
//       "schema": "https",
//       "domain": "www-dev1.domovenok.su",
//       "uri": "private"
//   },
// }


module.exports = class Magic_url {
  constructor(namespace) {
    /* Constants */
    switch (namespace) {
      case 'private':
        this.currentUrl = '/private';
        break;
      case 'share':
        this.currentUrl = '/share';
        break;
      default:
        this.currentUrl = '/private';
        break;
    }
    this.pictureDownload = '/picture/';
    this.pictureEmployee = '/media/general/employee';
    this.pathMedia = '/public/media/employee/';
    this.ordersUrl = '/orders';
    this.authUrl = '/auth';
    this.logoutUrl = '/logout';
    /* API Site */
    this.actionLink = '/action';
    /* End API */
    /* Domovenok */
    // this.domovenokUrl = config.get('sitePath:schema') + '://' + config.get('sitePath:domain');
    // this.paUrl = config.get('serverPath:schema') + '://' + config.get('serverPath:domain');
    this.paUrl = CONF.domain_object.protocol + '//' + CONF.domain_object.host;
    // this.paPublicUrl = 'http://' + config.get('serverPath:domain');
    this.domovenokReview = '/otzivi/form/';
    /* End */
    /* End Constants */
    this.countParam = 0;
    this.projectPath = __dirname.split('/').slice(0, -1).join('/');

    this.pattern = '';
    return this;
  }

  _uuidFormat(uuid) {
    return uuid.replace(/-/g, '');
  }

  _addColumn(typeCode, uuid) {
    uuid = uuid || '';
    this.currentUrl += util.format('/%s%s', typeCode, this._uuidFormat(uuid));
    this.pattern += util.format('/%s%s', typeCode, util.format(uuidRegWithoutDash, this.countParam));
    this.countParam += 1;
    return this;
  }

  address(uuid) {
    let typeCode = 'adr';
    return this._addColumn(typeCode, uuid);
  }

  client(uuid) {
    let typeCode = 'cln';
    return this._addColumn(typeCode, uuid);
  }

  order(uuid) {
    let typeCode = 'ord';
    return this._addColumn(typeCode, uuid);
  }

  schedule(uuid) {
    let typeCode = 'shd';
    return this._addColumn(typeCode, uuid);
  }
  common() {
    let typeCode = 'common';
    return this._addColumn(typeCode);
  }

  isAjax() {
    this.currentUrl += '/m';
    this.pattern += '/m';
    return this;
  }

  buildUrl(args) {
    let response_url = this.currentUrl;
    if (args) {
      if (args.full === true) {
        response_url = this.paUrl + response_url;
      }
    }
    return response_url;
  }

  buildPattern() {
    return this.pattern;
  }

  getPictureDownloadUrl() {
    return this.currentUrl + this.pictureDownload;
  }

  getPictureEmployeeUrl() {
    return this.pictureEmployee;
  }

  getMediaPath(filename) {
    return this.projectPath + this.pathMedia + filename;
  }

  getDomovenokReviewUrl() {
    return this.domovenokUrl + this.domovenokReview;
  }

  getRedirectLastOrderUrl() {
    return this.currentUrl + this.ordersUrl;
  }

  getRedirectGeneral() {
    return this.currentUrl + '/';
  }

  getAuthUrl() {
    return this.currentUrl + this.authUrl;
  }

  getLogoutUrl() {
    return this.currentUrl + this.logoutUrl;
  }

  getActionLink(key) {
    return this.paUrl + this.actionLink + '/' + key;
  }

  getPancakeStaffUrl() {
    return '/staff/';
  }

  getPancakeDeactivateToken() {
    return '/staff/deactivate_token';
  }

  getPancakeCheckToken() {
    return '/staff/check_token';
  }

  getPancakePendingTokenUrl() {
    return '/staff/pending_token';
  }

  getActionLinkHandle() {
    return this.actionLink + '/:key';
  }

};