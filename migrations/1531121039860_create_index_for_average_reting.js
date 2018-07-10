exports.shorthands = undefined;

exports.up = (pgm) => {
  return pgm.sql('CREATE UNIQUE INDEX reviews_average_rating_unique_i_average_rating ON reviews_average_rating (average_rating)');
};

exports.down = (pgm) => {
  return pgm.sql('DROP INDEX reviews_average_rating_unique_i_average_rating');
};
