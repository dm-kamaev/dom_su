exports.shorthands = undefined;

exports.up = (pgm) => {
  return pgm.sql('CREATE INDEX ab_test_i_key ON ab_test (key)');
};

exports.down = (pgm) => {
  return pgm.sql('DROP INDEX ab_test_i_key');
};
