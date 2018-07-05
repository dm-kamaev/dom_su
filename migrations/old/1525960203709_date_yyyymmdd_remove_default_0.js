exports.up = (pgm) => {
  pgm.sql('ALTER TABLE reviews ALTER COLUMN date_yyyymmdd DROP DEFAULT');
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE reviews ALTER COLUMN date_yyyymmdd SET DEFAULT 0');
};
