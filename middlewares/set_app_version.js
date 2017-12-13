'use strict';

// DETECT APP VERSIO FOR MOBILE APP
const logger = require('/p/pancake/lib/logger.js');

module.exports = async function (ctx, next) {
  const headers = ctx.headers;
  const x_requested_with = headers['x-requested-with'];
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
  const is_cordova = x_requested_with && x_requested_with !== 'XMLHttpRequest';
  if (is_cordova) {
    const state = ctx.state;
    if (!app_version) {
      state.app_version = '1.0.0';
    } else {
      state.app_version = app_version;
    }
    logger.log('=== pancake.app_version === '+ctx.state.app_version);
  }
  await next();
};


