exports.shorthands = undefined;

exports.up = (pgm) => {
  return pgm.sql(`
    CREATE TABLE IF NOT EXISTS mean_and_material_photo(
      mean_and_material_photo_id  SERIAL PRIMARY KEY NOT NULL,
      file_uuid          VARCHAR(36) NOT NULL,
      file_name          VARCHAR NOT NULL,
      mime_type          VARCHAR NOT NULL,
      timestamp          TIMESTAMP DEFAULT NOW()
    );
  `);
};

exports.down = (pgm) => {
  return pgm.sql('DROP TABLE mean_and_material_photo');
};
