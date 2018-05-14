'use strict';

// GENERATED ECOSYSTEM.JSON

const wf = require('/p/pancake/my/wf.js');
const CONF = require('/p/pancake/settings/config.js');

let ecosystem;
if (CONF.is_dev) {
  ecosystem = {
    apps : [
      {
        name: 'pancake',
        script: '/p/pancake/app.js',
        out_file: '/p/log/pm2/pancake.log',
        error_file: '/p/log/pm2/pancake.log',
        merge_logs: true,
        env: {
          NODE_PATH: '/p/pancake',
          NODE_ENV: 'development'
        }
      }
    ]
  };
  if (CONF.is_dev1) {
    var pancake_ecosytem = ecosystem.apps[0];
    pancake_ecosytem.watch = [ 'staff', 'models', 'reviews', 'middlewares' ];
    pancake_ecosytem.ignore_watch = [ 'node_modules', 'staff/templates' ];
  }

  writeEcosystem(ecosystem);
} else if (CONF.is_prod) {
  ecosystem = {
    'apps' : [
      {
        'name'      : 'pancake',
        'script'    : 'app.js',
        'out_file': '/p/log/pm2/pancake.log',
        'error_file': '/p/log/pm2/pancake.log',
        'merge_logs': true,
        'env': {
          'NODE_PATH': '/srv/www/pancake'
        },
        'env_production' : {
          'NODE_ENV': 'production'
        }
      }
    ]
  };
  writeEcosystem(ecosystem);
}


function writeEcosystem(ecosystem) {
  const path = '/p/pancake/ecosystem.json';
  wf.write(path, JSON.stringify(ecosystem, null, 2)).then(() => {
    console.log('SUCCESS write ', path);
  }).catch(err =>
    console.error('ERROR=', err)
  );
}