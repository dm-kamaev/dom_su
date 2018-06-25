'use strict';
const config = require('config');
const phone_api = require('/p/pancake/lib/phone_api.js');
const time = require('/p/pancake/my/time.js');

const phoneDimensionDict = {
  moscow: 'dimension2',
  spb: 'dimension3',
  nn: 'dimension8',
};

function numberToTemplate(number, applicant_phone) {
  const number_WC = number.substring(4);
  const applicant_phone_wc = applicant_phone.substring(4);
  return {
    phoneHref: `+${number}`, // +74953696050
    phoneCode: `8 (${number.substring(1,4)})`, // 8 (495)
    phoneNumber: [number_WC.slice(0,3), number_WC.slice(3,5), number_WC.slice(5)].join('-'),  // 369-60-50
    // for potential employee
    applicantPhoneHref: `+${applicant_phone}`, // +74953696050
    applicantPhoneCode: `8 (${applicant_phone.substring(1,4)})`,
    applicantPhoneNumber: [ applicant_phone_wc.slice(0,3), applicant_phone_wc.slice(3,5), applicant_phone_wc.slice(5) ].join('-'),
  };
}

function ctxProcessor(data) {
  if (this.state.pancakeUser === undefined) {
    return data;
  }
  data = data || {};

  data.currentUrl = this.request.href;
  const user = this.state.pancakeUser;

  data.general = numberToTemplate(phone_api.get_for_client(this), phone_api.get_for_applicant(this));
  var general = data.general;
  general.city = user.city;
  general.path = this.path;
  general.develop = config.app.develop;
  general.production = config.app.production;
  /**
   * prev_month: '01'
   * @type {String}
   */
  const prev_month = time.minus_month(time.get()).double_month;
  general.currentRusMonth = time.get_month_name(prev_month);

  // Analytics

  // AB  Test

  let ABTestID, ABTestVariant;
  if (data.ABTest){
    ABTestID = data.ABTest.key || null;
    ABTestVariant = data.ABTest.variant || null;
  } else {
    ABTestID = null;
    ABTestVariant = null;
  }

  data.general.analytics = {
    GAUA: config.analytics.google,
    phone: data.general.phoneHref,
    phoneDimension: phoneDimensionDict[this.state.pancakeUser.city.keyword],
    ABTestID : ABTestID,
    ABTestVariant : ABTestVariant,
  };


  if (config.app.develop) {
    data.noindex = true;
  }

  // This code work for one case
  if (data.generateCanonical){
    data.canonical = true;
    data.canonicalPath = data.generateCanonical();
  } else if (data.autoCanonical != false && Object.keys(this.request.query).length > 0){
    data.canonical = true;
    data.canonicalPath = this.request.origin + this.request.path;
  }

  if (data.canonicalPath) {
    data.canonicalPath = data.canonicalPath.replace('http', 'https');
  }
  // Temporary for all page, with protocol https
  // In future custom for every page
  if (!data.canonical) {
    data.canonical = true;
    data.canonicalPath = this.request.origin.replace('http', 'https') + this.request.path;
  }

  // data for frontend
  const globalData = {
    clientId: user.get_client_id(),
  };
  data.globalData = JSON.stringify(globalData);

  return data;
}

module.exports = {
  ctxProcessor
};
