
exports.up = (pgm) => {
  return pgm.sql('ALTER TABLE phones ADD COLUMN category_type VARCHAR(20) DEFAULT \'client\'');
};

exports.down = (pgm) => {
  return pgm.sql('ALTER TABLE phones DROP COLUMN category_type');
};