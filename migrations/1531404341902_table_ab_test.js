exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS ab_test(
      ab_test_id   SERIAL PRIMARY KEY NOT NULL,
      name         VARCHAR,
      key          VARCHAR NOT NULL,
      for_new_user  BOOLEAN DEFAULT False,
      variations    VARCHAR NOT NULL,
      timestamp     TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    );
  `);
};

exports.down = (pgm) => {
  return pgm.sql('DROP TABLE ab_test');
};
