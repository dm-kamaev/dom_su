exports.shorthands = undefined;

exports.up = (pgm) => {
  return pgm.sql('CREATE UNIQUE INDEX reviews_ui_questioning_uid ON reviews (questioning_uid)');
};

exports.down = (pgm) => {
  return pgm.sql('DROP INDEX reviews_ui_questioning_uid');
};


