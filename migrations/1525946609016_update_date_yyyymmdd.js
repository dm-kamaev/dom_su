const CONF = require('/p/pancake/settings/config.js');
const update_date_yyyymmdd = require('/p/pancake/only_one/update_date_yyyymmdd.js');

exports.up = async () => {
  return await update_date_yyyymmdd();
};

exports.down = () => {
  return Promise.resolve();
};
