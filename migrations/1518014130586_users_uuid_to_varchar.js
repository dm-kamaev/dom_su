exports.up = (pgm) => {
  pgm.sql('ALTER TABLE users ALTER COLUMN uuid TYPE VARCHAR');
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE users ALTER COLUMN uuid TYPE uuid');
};
