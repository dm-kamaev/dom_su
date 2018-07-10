
exports.up = (pgm) => {
  return pgm.sql('ALTER TABLE users ADD COLUMN last_client_id VARCHAR(36) NULL');
};

exports.down = (pgm) => {
  return pgm.sql('ALTER TABLE users DROP COLUMN last_client_id');
};
