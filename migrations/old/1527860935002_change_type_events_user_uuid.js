exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql('ALTER TABLE events ALTER COLUMN user_uuid TYPE varchar(36)');
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE events ALTER COLUMN user_uuid TYPE uuid');
};
