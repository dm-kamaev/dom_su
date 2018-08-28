'use strict';

// const CONF = require('/p/pancake/settings/config.js');
// const logger = require('/p/pancake/lib/logger.js');
const Magic_url = require('/p/pancake/private/Magic_url.js');
const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');

/** @namespace load_data_from_1c */
const load_data_from_1c = exports;

load_data_from_1c.for_menu_client_pa = async function (ctx, auth_data) {
  const magic_url = new Magic_url('private');
  console.log('load_data_from_1c.for_menu_client_pa=', auth_data);
  if (auth_data.client_id) {
    const { uuid, token, client_id } = auth_data;
    const req_for_1c = new Request1Cv3(token, uuid, null, ctx);
    req_for_1c.add('Client.GetCommon', { ClientID: client_id });
    await req_for_1c.do();
    const { 'Client.GetCommon': GetCommon } = req_for_1c.get_all();
    if (!GetCommon.ok) {
      throw new Error(JSON.stringify(GetCommon));
    }
    return {
      authUrl: '/private/auth',
      ordersUrl: magic_url.getRedirectLastOrderUrl(),
      GetCommon: {
        response: GetCommon.data
      },
    };
  } else {
    return {
      authUrl: '/private/auth',
      ordersUrl: magic_url.getRedirectLastOrderUrl(),
      GetCommon: {
        response: ''
      }
    };
  }
};
