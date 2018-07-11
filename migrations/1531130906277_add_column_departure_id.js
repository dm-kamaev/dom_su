exports.shorthands = undefined;

exports.up = (pgm) => {
  return pgm.sql('ALTER TABLE reviews ADD COLUMN departure_id VARCHAR(36)');
};

exports.down = (pgm) => {
  return pgm.sql('ALTER TABLE reviews DROP COLUMN departure_id');
};
