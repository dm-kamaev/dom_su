const child = require('/p/pancake/my/child.js');

exports.shorthands = undefined;

exports.up = (pgm) => {
  return child.exec('node /p/pancake/cron/calc_count_for_reviews.js ').catch(err => { throw err; });
};

exports.down = (pgm) => {
  return true;
};
