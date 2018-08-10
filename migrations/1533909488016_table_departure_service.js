exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS departure_service(
      departure_service_id  SERIAL PRIMARY KEY NOT NULL,
      departure_id  VARCHAR NOT NULL,
      service       VARCHAR NOT NULL,
      timestamp     TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    );
  `);
};

exports.down = (pgm) => {
  return pgm.sql('DROP TABLE departure_service');
};
