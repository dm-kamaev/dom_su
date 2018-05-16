'use strict';

// WORK WITH FILE

const fs = require('fs');

const wf_sync = exports;

/**
 * write sync utf-8
 * @param  {string} path [description]
 * @param  {string} data [description]
 */
wf_sync.write = function (path, data) {
  fs.writeFileSync(path, data, 'utf8');
};

/**
 * append
 * @param  {string} path
 * @param  {string} data)
 * @return {}
 */
wf_sync.append = function (path, data) { fs.appendFileSync(path, data,'utf8'); };

/**
 * exist file safe
 * @param  {[string} path
 * @return {boolean}
 */
wf_sync.exist = function(path) {
  try {
    return Boolean(fs.statSync(path));
  } catch (err) {
    return false;
  }
};


/**
 * rename
 * @param  {string} old_path
 * @param  {string} new_path
 */
wf_sync.rename = function (old_path, new_path) {
  fs.renameSync(old_path, new_path);
};


/**
 * get info about file
 * @param  {string} path
 * @return {object}
 {
   dev: 838860881,
   mode: 33204,
   nlink: 1,
   uid: 501,
   gid: 20,
   rdev: 0,
   blksize: 65536,
   ino: 51387,
   size: 1657,
   blocks: 8,
   atime: 2017-12-08T13:05:54.000Z,
   mtime: 2017-12-08T13:06:07.000Z,
   ctime: 2017-12-08T13:06:07.000Z,
   birthtime: 1970-01-01T00:00:00.000Z
  }
 */
wf_sync.get_file_info = function (path) {
  return fs.statSync(path);
};

/**
 * create_dir
 * @param  {String} dir
 */
wf_sync.create_dir = function (dir) {
  fs.mkdirSync(dir);
}


