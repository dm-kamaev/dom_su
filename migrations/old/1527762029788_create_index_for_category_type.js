
exports.up = (pgm) => {
  return pgm.sql('CREATE INDEX phones_i_category_type ON phones (category_type)');
};

exports.down = (pgm) => {
  return pgm.sql('DROP INDEX phones_i_category_type');
};
