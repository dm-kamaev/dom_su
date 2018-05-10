const CONF = require('/p/pancake/settings/config.js');
const update_coefficient_for_sort = require('/p/pancake/only_one/update_coefficient_for_sort.js');

exports.up = async () => {
  return await update_coefficient_for_sort();
};

exports.down = () => {
  return Promise.resolve();
};
