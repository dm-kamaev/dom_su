'use strict';

//  node create_migrations.js create_folder_stat

const CONF = require('/p/pancake/settings/config.js');
const child  = require('/p/pancake/my/child.js');
const list_param  = require('/p/pancake/my/argv.js').get_all();

const config_path = '/p/pancake/settings/config_migration.json';

if (!list_param.length) {
  throw new Error('Not exist list_param');
}

const cmd = `/p/pancake/node_modules/.bin/node-pg-migrate -f ${config_path} ${list_param.join(' ')}`;
console.log(cmd);

child.exec(cmd).then(out => console.log(out)).catch(err => console.log(err));
