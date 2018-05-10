#!/usr/bin/node

'use strict';

//  node migrate.js creeate migration name
//  node migrate.js up (all)
//  node migrate.js down
//  node migrate.js up 1 (only one)
//  node migrate.js unlock

const CONF = require('/p/pancake/settings/config.js');
const child  = require('/p/pancake/my/child.js');
const list_param  = require('/p/pancake/my/argv.js').get_all();
const wf_sync = require('/p/pancake/my/wf_sync.js');

const pg = CONF.pg;
const config_path = '/p/pancake/settings/config_migration.json';
wf_sync.write('/p/pancake/settings/config_migration.json', JSON.stringify({
  user: pg.user,
  password: pg.password,
  name: pg.database,
  host: pg.host,
  port: pg.port
}, null, 2));

if (!list_param.length) {
  throw new Error('Not exist list_param');
}
const NODE_ENV = CONF.is_dev ? 'development' : 'production';
const cmd = `NODE_PATH=$NODE_PATH:/p/pancake NODE_ENV=${NODE_ENV} /p/pancake/node_modules/.bin/node-pg-migrate -f ${config_path} ${list_param.join(' ')}`;
console.log(cmd);

child.exec(cmd).then(out => console.log(out)).catch(err => console.error(err));
