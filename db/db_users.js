'use strict';


const db = require('/p/pancake/my/db.js');

const db_users = exports;

// TODO: description
// TODO: add index for client_id in auth_data
// uuid -- users_uuid 3eedc2f4-3206-4632-9a3f-60cad6257aa2
db_users.get_client_id = async function (uuid) {
  const res = await db.read_one('SELECT last_client_id FROM users WHERE uuid = $1', [ uuid ]);
  let client_id;
  if (res && !(res instanceof Error)) {
    client_id = res.last_client_id;
  }
  return client_id;
};