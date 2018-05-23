'use strict';

// const db = require('/p/pancake/my/db.js');
const fs = require('fs');
const zlib = require('zlib');
zlib.async_gunzip = require('util').promisify(zlib.gunzip);
// const wf_sync = require('/p/pancake/my/wf_sync.js');
const promise_api = require('/p/pancake/my/promise_api.js');

const { url_name: URL_NAME } = require('/p/pancake/my/argv.js').get_hash();

void async function () {
  const folder = '/p/log/access_log/';
  var file_data_s = await get_list_file_with_data(folder);
  // var data = file_data_s[0].data;
  // console.log(data);
  var hash_url_time = {};
  // [file_data_s[0]].forEach(({ data }) => {
  file_data_s.forEach(({ data }) => {
    data.split('\n').forEach(file => {
      var parts = file.split(' | ');
      var url = parts[4];
      var responce_time = parts[7];
      // console.log(url, responce_time);
      if (!url || !responce_time || responce_time === 'undefinedms') {
        return;
      }
      if (!hash_url_time[url]) {
        hash_url_time[url] = [];
      }
      hash_url_time[url].push(parseFloat(responce_time.replace(/ms/g, '')));
    });
  });
  Object.keys(hash_url_time).forEach(key => {
    hash_url_time[key].sort((a, b) => b - a);
  });

  console.log('url=', URL_NAME, hash_url_time[URL_NAME] || 'NOT FOUND');

}();



async function get_list_file_with_data(folder) {
  var files = fs.readdirSync(folder).filter(file => {
    if (/access_log_pancake\.log/.test(file) && /log\.gz/.test(file)) {
      return true;
    }
  });
  var list = [];
  await promise_api.queue(files, async function(file) {
    var path = folder + file;
    var buff_data = await zlib.async_gunzip(fs.readFileSync(path));
    list.push({
      path: path,
      data: buff_data.toString(),
    });
  });
  return list;
}
// zlib.gunzip(body, function(err, dezipped) {
//       callback(dezipped.toString());
//     });