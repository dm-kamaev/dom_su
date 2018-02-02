const child = require('/p/pancake/my/child.js');

exports.up = () => {
  return child.exec('mkdir -p /p/pancake/stat/employee_photo/').catch(err => { throw err; });
};

exports.down = () => {
  return child.exec('rm -rf /p/pancake/stat/employee_photo/').catch(err => { throw err; });
};
