'use strict';

// node --expose-gc /p/pancake/only_one/search_url_in_access_log.js url_name=/staff/6ec953b4-bed7-11e7-80e6-00155d594900/news/

const fs = require('fs');
const zlib = require('zlib');
zlib.async_gunzip = require('util').promisify(zlib.gunzip);
// const wf_sync = require('/p/pancake/my/wf_sync.js');
const promise_api = require('/p/pancake/my/promise_api.js');

const { url_name: URL_NAME } = require('/p/pancake/my/argv.js').get_hash();


void async function () {
  const folder = '/p/log/access_log/';
  var hash_url_time = {};
  hash_url_time = await get_list_file_with_data(hash_url_time, folder);
  Object.keys(hash_url_time).forEach(key => {
    hash_url_time[key].sort((a, b) => b - a);
  });

  console.log('url=', URL_NAME, hash_url_time[URL_NAME] || 'NOT FOUND');

}();



async function get_list_file_with_data(hash_url_time, folder) {
  var files = fs.readdirSync(folder).filter(file => {
    if (/access_log_pancake\.log/.test(file)) {
      return true;
    }
  });
  await promise_api.queue(files, async function(file) {
    var path = folder + file;
    var buff_data;
    if (/.log$/.test(file)) {
      buff_data = fs.readFileSync(path);
    } else if (/log\.gz$/.test(file)) {
      buff_data = await zlib.async_gunzip(fs.readFileSync(path));
    } else {
      throw new Error('Not valid extension '+file);
    }

    parse_data(hash_url_time, buff_data.toString());
    // global.gc();
  });
  return hash_url_time;
}

const reg_url = new RegExp(URL_NAME);
const reg_staff_url = new RegExp('staff');
function parse_data(hash_url_time, data) {
  data.split('\n').forEach(file => {
    var parts = file.split(' | ');
    var url = parts[4];
    var responce_time = parts[7];
    // console.log(url, responce_time);

    if (!url || !responce_time || responce_time === 'undefinedms') {
      return;
    }

    // skip staff url
    if (reg_staff_url.test(url)) {
      return;
    }

    if (!reg_url.test(url)) {
      return;
    }

    if (!hash_url_time[url]) {
      hash_url_time[url] = [];
    }
    responce_time = parseFloat(responce_time.replace(/ms/g, ''));
    if (responce_time > 1000) {
      console.log(parts);
    }
    hash_url_time[url].push(responce_time);
  });
}