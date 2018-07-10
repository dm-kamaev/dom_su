exports.shorthands = undefined;


exports.up = (pgm) => {
  return pgm.sql('CREATE INDEX mean_and_material_photo_i_file_uuid  ON mean_and_material_photo (file_uuid)');
};

exports.down = (pgm) => {
  return pgm.sql('DROP INDEX mean_and_material_photo_i_file_uuid');
};