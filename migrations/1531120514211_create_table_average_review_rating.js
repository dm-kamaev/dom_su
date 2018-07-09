exports.shorthands = undefined;

exports.up = (pgm) => {
  return pgm.sql(`
    CREATE TABLE IF NOT EXISTS reviews_average_rating(
      reviews_average_rating_id  SERIAL PRIMARY KEY NOT NULL,
      average_rating     NUMERIC(2, 1) NOT NULL,
      timestamp          TIMESTAMP DEFAULT NOW()
    );
  `);
};

exports.down = (pgm) => {
  return pgm.sql('DROP TABLE reviews_average_rating');
};

