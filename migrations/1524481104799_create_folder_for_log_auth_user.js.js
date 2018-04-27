const child = require('/p/pancake/my/child.js');
exports.up = () => {
  return child.exec('node /p/pancake/cron/create_folder_for_log_auth_user.js').catch(err => { throw err; });
};

exports.down = () => {
  return;
};
