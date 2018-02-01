
exports.up = (pgm) => {
  return pgm.sql('CREATE INDEX employee_photo_i_file_uuid  ON employee_photo (file_uuid)');
};

exports.down = (pgm) => {
  return pgm.sql('DROP INDEX employee_photo_i_file_uuid');
};
