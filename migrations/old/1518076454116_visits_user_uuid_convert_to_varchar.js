exports.up = (pgm) => {
  pgm.sql('ALTER TABLE visits ALTER COLUMN user_uuid TYPE VARCHAR');
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE visits ALTER COLUMN user_uuid TYPE uuid');
};
