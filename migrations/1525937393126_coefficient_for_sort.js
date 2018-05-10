exports.up = (pgm) => {
  return pgm.sql('ALTER TABLE reviews ADD COLUMN coefficient_for_sort SMALLINT NOT NULL DEFAULT 1');
};

exports.down = (pgm) => {
  return pgm.sql('ALTER TABLE reviews DROP COLUMN coefficient_for_sort');
};
