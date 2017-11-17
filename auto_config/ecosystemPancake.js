'use strict';

// GENERATED ECOSYSTEM.JSON

const ENV = process.env.NODE_ENV;
const wf = require('/p/pancake/my/wf.js');

console.log('===== ENV = ', ENV, '=====');
let ecosystem;
if (ENV === 'development') {
  ecosystem = {
    "apps" : [
      {
        "name": "pancake",
        "script": "/p/pancake/app.js",
        "out_file": "/p/log/pm2/pancake.log",
        "error_file": "/p/log/pm2/pancake.log",
        "env": {
          "NODE_PATH": "/p/pancake",
          "NODE_ENV": "development"
        }
      }
    ]
  }
  writeEcosystem(ecosystem);
} else if (ENV === 'production') {
  ecosystem = {
    "apps" : [
      {
        "name"      : "pancake",
        "script"    : "app.js",
        "out_file": "/p/log/pm2/pancake.log",
        "error_file": "/p/log/pm2/pancake.log",
        "env": {
          "NODE_PATH": "/srv/www/pancake"
        },
        "env_production" : {
          "NODE_ENV": "production"
        }
      }
    ]
  }
  writeEcosystem(ecosystem);
} else {
  console.log('NOT VALID ENV ', ENV);
}


function writeEcosystem(ecosystem) {
  const path = '/p/pancake/ecosystem.json';
  wf.write(path, JSON.stringify(ecosystem, null, 2)).then(() => {
    console.log('SUCCESS write ', path);
  }).catch(err =>
    console.log('ERROR=', err)
  );
}