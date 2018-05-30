
const CONF = require('/p/pancake/settings/config.js');

exports.up = (pgm) => {
  if (CONF.is_dev) {
    return pgm.sql('CREATE INDEX users_i_its_robot ON users (its_robot)');
  } else {
    // this fucking module can't CREATE INDEX CONCURRENTLY, because can't disable transaction
    return '!!! EXEC !!! ===> CREATE INDEX CONCURRENTLY users_i_its_robot ON users (its_robot)';
  }
};

exports.down = (pgm) => {
  return pgm.sql('DROP INDEX users_i_its_robot');
};
