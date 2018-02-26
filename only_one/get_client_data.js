'use strict';

const db = require('/p/pancake/my/db.js');
const wf_sync = require('/p/pancake/my/wf_sync.js');
const promise_api = require('/p/pancake/my/promise_api.js');
const Request1Cv3 = require('/p/pancake/api1c/request1Cv3.js');

void async function () {
  let auth_datas = await db.read(`
    SELECT
      ad.auth_data_id,
      ad.uuid,
      ad.client_id,
      ad.employee_id,
      ad.token,
      up.phone
    FROM
      auth_data as ad
    LEFT JOIN
      uuid_phone as up
    ON
      ad.uuid = up.uuid
    WHERE
      client_id IS NOT NULL
  `);
  if (auth_datas instanceof Error) {
    throw auth_datas;
  }
  const ctx = {
    state: {
      app_version: 2,
      is_mobile: false
    }
  };
  console.log(auth_datas);
  auth_datas = uniq_auth_data_by_client_id(auth_datas);
  const count_client_id = auth_datas.length;
  console.log('COUNT client_id', auth_datas.length);
  await promise_api.queue(auth_datas, function (auth_data) {
    return new Promise(function (resolve) {
      setTimeout(async function() {
        console.log('remained= ', count_client_id);
        resolve(request(auth_data, ctx));
      }, 2000);
    });
  });
}();


async function request(auth_data, ctx) {
  const file_name = '/p/pancake/only_one/client_data/'+auth_data.auth_data_id+'.txt';
  if (wf_sync.exist(file_name)) {
    return;
  }
  const request1Cv3 = new Request1Cv3(null, null, null, ctx);
  await request1Cv3.add('Client.GetCommon', { ClientID: auth_data.client_id }).do();
  let get_common = request1Cv3.get();
  if (get_common.ok) {
    get_common = get_common.data;
  } else {
    throw get_common;
  }
  get_common.phone = auth_data.phone;
  console.log('\n\n===========================');
  console.log(`SUCCESS WRITE auth_data: ${JSON.stringify(auth_data, null, 2)} get_common: ${JSON.stringify(get_common, null, 2)}`);
  wf_sync.write(file_name, JSON.stringify(get_common, null, 2));
}


function uniq_auth_data_by_client_id(auth_datas) {
  var hash = {};
  auth_datas.forEach(auth_data => hash[auth_data.client_id] = auth_data);
  return Object.keys(hash).map(client_id => hash[client_id]);
}