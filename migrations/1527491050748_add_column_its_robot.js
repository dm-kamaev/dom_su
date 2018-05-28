exports.up = (pgm) => {
  return pgm.sql('ALTER TABLE users ADD COLUMN its_robot BOOLEAN DEFAULT false');
};

exports.down = (pgm) => {
  return pgm.sql('ALTER TABLE users DROP COLUMN its_robot');
};
