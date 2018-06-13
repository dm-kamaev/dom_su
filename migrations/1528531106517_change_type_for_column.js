exports.shorthands = undefined;

exports.up = (pgm) => {
  return 1;
  // pgm.sql('ALTER TABLE events_2017_2018 ALTER COLUMN user_uuid TYPE varchar');
};

exports.down = (pgm) => {
  return 1;
  // pgm.sql('ALTER TABLE events_2017_2018 ALTER COLUMN user_uuid TYPE varchar(26)');
};
