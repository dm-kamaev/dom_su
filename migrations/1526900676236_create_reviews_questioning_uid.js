exports.up = (pgm) => {
  return pgm.sql('ALTER TABLE reviews ADD COLUMN questioning_uid VARCHAR(36) NULL');
};

exports.down = (pgm) => {
  return pgm.sql('ALTER TABLE reviews DROP COLUMN questioning_uid');
};
