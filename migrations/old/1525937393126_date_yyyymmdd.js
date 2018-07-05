exports.up = (pgm) => {
  return pgm.sql('ALTER TABLE reviews ADD COLUMN date_yyyymmdd INT NOT NULL DEFAULT 0');
};

exports.down = (pgm) => {
  return pgm.sql('ALTER TABLE reviews DROP COLUMN date_yyyymmdd');
};
