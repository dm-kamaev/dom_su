const db = require('/p/pancake/my/db2.js');

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql('ALTER TABLE events ADD COLUMN user_uuid uuid DEFAULT NULL');
  pgm.sql('CREATE INDEX events_i_user_uuid ON events (user_uuid)');
};

exports.down = (pgm) => {

};
