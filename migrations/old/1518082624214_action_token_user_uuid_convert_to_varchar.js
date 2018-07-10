exports.up = (pgm) => {
  pgm.sql('ALTER TABLE action_token ALTER COLUMN user_uuid TYPE VARCHAR');
};

exports.down = (pgm) => {
  pgm.sql('ALTER TABLE action_token ALTER COLUMN user_uuid TYPE uuid');
};
