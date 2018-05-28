
exports.up = (pgm) => {
  pgm.sql('ALTER TABLE reviews RENAME date_yyyymmdd TO coefficient_for_sort');
  pgm.sql('ALTER TABLE reviews ALTER COLUMN coefficient_for_sort SET NOT NULL');
  pgm.sql('DROP INDEX reviews_i_rating_date');
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE reviews RENAME coefficient_for_sort TO date_yyyymmdd');
  pgm.sql('CREATE INDEX reviews_i_rating_date ON reviews (rating, date_yyyymmdd)');
};
