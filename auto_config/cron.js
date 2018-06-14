'use strict';

// GENERATED ECOSYSTEM.JSON

// const CONF = require('/p/pancake/settings/config.js');
const wf_sync = require('/p/pancake/my/wf_sync.js');
const auto_config = require('./auto_config.js');
//

const CRON_FILE = '/etc/cron.d/pancake';

wf_sync.write(CRON_FILE, get_cron_file());


function get_cron_file() {
  var str = auto_config.remove_leading_space`
    NODE=/usr/local/bin/node

    # every 10:00
    00 10 * * * root $NODE /p/pancake/cron/create_folder_for_log_auth_user.js

    # every 1 minute
    * * * * * domovenok $NODE /p/pancake/cron/free_phones.js > ~/free_phones.log 2>&1 &

  `;
  return str;
}