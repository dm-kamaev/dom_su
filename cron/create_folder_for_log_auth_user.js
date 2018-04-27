#!/usr/bin/node

'use strict';

// create folder for log(about auth user)

const time = require('/p/pancake/my/time.js');
const child = require('/p/pancake/my/child.js');
const wf_sync = require('/p/pancake/my/wf_sync.js');


void async function () {
  console.log('START');
  if (!wf_sync.exist('/p/log/auth_user/')) {
    const res = await child.exec('mkdir -p /p/log/auth_user/');
    if (res instanceof Error) {
      throw res;
    }
  }
  const current_year = time.get().year;
  const list_month = [ '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', ];
  const promise_create_folder = list_month.map((month) => {
    const folder = '/p/log/auth_user/'+current_year+month;
    if (!wf_sync.exist(folder)) {
      return child.exec(`mkdir -p ${folder}`);
    } else {
      return Promise.resolve();
    }
  });
  await Promise.all(promise_create_folder);
  console.log('THE END');
  global.process.exit(0);
}();
