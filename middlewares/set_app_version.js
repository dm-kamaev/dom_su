'use strict';

// DETECT APP VERSIO FOR MOBILE APP

const logger = require('/p/pancake/lib/logger.js');

module.exports = async function (ctx, next) {
  const headers = ctx.headers;
  // VARIANT (not all)
  // "com.android.browser"
  // "ru.domovenok.app"
  // "ru.yandex.searchplugin"
  // "com.ksmobile.cb"
  // "com.android.browser"
  // "com.instagram.android"
  // "com.android.browser"
  // "com.facebook.katana"
  // "com.ksmobile.cb"
  // "XMLHttpRequest",
  // "com.samsung.android.messaging"
  // "com.android.browser"
  // "com.facebook.orca"
  // "com.facebook.orca"
  // "com.facebook.orca"
  // "com.android.mms"
  // "com.htc.sense.browser"
  const app_version = headers['app-version'];
  const state = ctx.state;
  state.is_mobile = detect_mobile(headers);
  if (!app_version) {
    state.app_version = '1';
  } else {
    state.app_version = app_version;
  }
  logger.log('=== pancake.app_version === '+ctx.state.app_version);
  logger.log('=== pancake.is_mobile === '+state.is_mobile);
  await next();
};


function detect_mobile(headers) {
  const is_cordova_new_method = headers['is-cordova'];
  const x_requested_with = headers['x-requested-with'];
  const is_cordova_old_method = x_requested_with && x_requested_with !== 'XMLHttpRequest';
  if (is_cordova_new_method){
    return true;
  } else {
    return Boolean(is_cordova_old_method);
  }
}