exports.up = (pgm) => {
  return pgm.sql('DROP INDEX reviews_i_rating_date');

};

exports.down = (pgm) => {
  return pgm.sql('CREATE INDEX reviews_i_rating_date ON reviews (rating, date)');
};
