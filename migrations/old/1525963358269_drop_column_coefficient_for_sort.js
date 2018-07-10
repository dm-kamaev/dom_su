exports.up = (pgm) => {
  pgm.sql('ALTER TABLE reviews DROP COLUMN IF EXISTS coefficient_for_sort');
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE reviews ADD COLUMN coefficient_for_sort TYPE INT NOT NULL DEFAULT 1');
};
