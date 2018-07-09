exports.shorthands = undefined;

exports.up = (pgm) => {
  return pgm.sql('CREATE UNIQUE INDEX reviews_count_unique_i_rating ON reviews_count (rating)');
};

exports.down = (pgm) => {
  return pgm.sql('DROP INDEX reviews_count_unique_i_rating');
};
