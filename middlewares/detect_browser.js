'use strict';

// DETECT OLD BROWSER AND REDIRECT TO PAGE FOR UPDATE

const logger = require('/p/pancake/lib/logger.js');
const browser_detect = require('browser-detect');

const url_for_update_browser = 'vash-brauzer-ustarel';
const reg_exp_url = new RegExp(url_for_update_browser)

module.exports = async function (ctx, next) {
  const is_url_for_update = reg_exp_url.test(ctx.request.url);
  const headers = ctx.headers;
  const user_agent = headers['user-agent'];
  const ie_10 = (user_agent === 'Mozilla/5.0 (compatible; WOW64; MSIE 10.0; Windows NT 6.2)');
  const is_not_1c = !(user_agent && /1C/.test(user_agent));
  const old_browser = ie_10 || its_old_browser(browser_detect(user_agent))

  // console.log('user_agent=', ctx.request.url, user_agent);
  // if (is_not_1c && old_browser) {
  if (ie_10) {
    // console.log('OLD BROWSER');
    // console.log('go to vash-brauzer-ustarel \n\n');
    if (is_url_for_update) {
      return await next();
    }
    ctx.status = 302;
    ctx.redirect('/'+url_for_update_browser);
  } else {
    // console.log('GOOD BROWSER');
    if (is_url_for_update) {
      ctx.status = 302;
      ctx.redirect('/');
      return;
    }
    await next();
  }
};


/**
 * its_old_browser
 * @param  {Object} browser
 * {
 *   name: 'chrome',
 *   version: '66.0.3359',
 *   versionNumber: 66.03359,
 *   mobile: false,
 *   os: 'OS X 10.12.6'
 * }
 * @return {Boolean}         ]
 */
function its_old_browser(browser) {
  // console.log('\n\nABOUT BROWSER', browser);
  if (!browser) {
    return false;
  }

  let res = false;
  let browser_name = browser.name || '';
  browser_name = browser_name.toLowerCase();
  let version_number = parseInt(browser.versionNumber, 10);
  switch (browser_name) {
    case 'ie':
      if (version_number && version_number < 11) {
        res = true;
      }
      break;
    case 'chrome':
      if (version_number && version_number < 30) {
        res = true;
      }
      break;
    case 'firefox':
      if (version_number && version_number < 40) {
        res = true;
      }
      break;
    case 'opera':
      if (version_number && version_number < 30) {
        res = true;
      }
      break;
    default:
      res = false
  }

  const old_mobile_safari = browser_name === 'safari' && browser.mobile && version_number && version_number < 6;
  if (old_mobile_safari) {
    res = true;
  }

  return res;
}