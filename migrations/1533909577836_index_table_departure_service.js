exports.shorthands = undefined;

exports.up = (pgm) => {
  return pgm.sql('CREATE INDEX departure_service_i_key ON departure_service (departure_id)');
};

exports.down = (pgm) => {
  return pgm.sql('DROP INDEX departure_service_i_key');
};
