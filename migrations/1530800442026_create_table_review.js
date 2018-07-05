exports.shorthands = undefined;

exports.up = (pgm) => {
  return pgm.sql(`
    CREATE TABLE IF NOT EXISTS reviews_count(
      reviews_count_id   SERIAL PRIMARY KEY NOT NULL,
      rating             SMALLINT NOT NULL,
      percent            SMALLINT NOT NULL,
      timestamp          TIMESTAMP DEFAULT NOW()
    );
  `);
};

exports.down = (pgm) => {
  return pgm.sql('DROP TABLE reviews_count');
};
