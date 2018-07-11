exports.shorthands = undefined;

exports.up = (pgm) => {
  return pgm.sql('CREATE UNIQUE INDEX reviews_ui_departure_id ON reviews (departure_id )');
};

exports.down = (pgm) => {
  return pgm.sql('DROP INDEX reviews_ui_departure_id');
};

