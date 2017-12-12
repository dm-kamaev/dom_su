'use strict';

// CONNECTOR FOR POSTGRES
// TODO: add config

const pg = require('pg');
const logger = require('/p/pancake/lib/logger.js');
// const config = require('config');

const SHOW_SQL = true;
const db = exports;

// const configPool = {
//   user: config.db.user, // name of the user account
//   password: config.db.password, // name of the user account
//   database: config.db.database, // name of the database
//   host: config.db.host,
//   max: 10, // max number of clients in the pool
//   idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
// };
let configPool;
switch (process.env.NODE_ENV) {
  case 'development':
    configPool = {
      user: 'domovenok',
      password: 'domovenokPG',
      database: 'pancake',
      host: 'localhost',
      max: 10, // max number of clients in the pool
      idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
    };
    break;
  case 'production':
    configPool = {
      'user': 'domovenok',
      'password': 'TQ7Ee3q74F6hPNfp',
      'database': 'domovenok',
      'host': 'localhost',
      max: 10, // max number of clients in the pool
      idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
    };
    break;
  default:
    throw new Error('DB required NODE_ENV from list: production, development');
}

const pool = new pg.Pool(configPool);

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  logger.warn('Unexpected error on idle client => ' + err);
  logger.warn(client);
});


/**
 * read
 * @param  {string} query  'SELECT * FROM users WHERE uuid=$1'
 * @param  {array}  params ['3eedc2f4-3206-4632-9a3f-60cad6257aa2']
 * @return {array}
 * [{
    uuid: '3eedc2f4-3206-4632-9a3f-60cad6257aa2',
    data: null,
    createdAt: 2017-02-01T13:52:01.983Z,
    updatedAt: 2017-02-01T13:52:01.983Z,
    last_action: null
  }]
 */
db.read = async function (query, params) {
  const client = await pool.connect();
  let result;
  try {
    const res = await client.query(query, params);
    result = res.rows;
    if (SHOW_SQL) {
      logger.info(`SQL: ${query} ` + ((params) ? JSON.stringify(params, null, 2) : null));
    }
    client.release();
    return result;
  } catch(err) {
    result = new DbError(query, err, params);
    logger.warn(result);
    client.release();
    return result;
  }
};


/**
 * read one, add to query LIMIT 1
 * @param  {string} query   'SELECT * FROM users WHERE uuid=$1'
 * @param  {[array]} params  ['3eedc2f4-3206-4632-9a3f-60cad6257aa2']
 * @return {object || null}
 */
db.read_one = async function (query, params) {
  const client = await pool.connect();
  let result;
  try {
    const res = await client.query(query+' LIMIT 1', params);
    result = res.rows[0] || null;
    if (SHOW_SQL) {
      logger.info(`SQL: ${query} ` + ((params) ? JSON.stringify(params, null, 2) : null));
    }
    client.release();
    return result;
  } catch(err) {
    result = new DbError(query, err, params);
    logger.warn(result);
    client.release();
    return result;
  }
};


/**
 * insert or update
 * @param  {string} query  INSERT INTO auth_data (uuid, client_id, employee_id, token) VALUES ($1, $2, $3, $4);'
 * @param  {array} params [ this.uuid,  ClientID, EmployeeID, Token ]
 * @return {number}
 */
db.edit = async function (query, params) {
  const client = await pool.connect();
  let result;
  try {
    const res = await client.query(query, params);
    result = res.rowCount;
    if (SHOW_SQL) {
      logger.info(`SQL: ${query} ` + ((params) ? JSON.stringify(params, null, 2) : null));
    }
    client.release();
    return result;
  } catch(err) {
    result = new DbError(query, err, params);
    logger.warn(result);
    client.release();
    return result;
  }
};


class DbError extends Error {
  constructor(query, err, params) {
    super(err);
    this.query = query;
    this.params = params;
  }
}
// EXAMPLE
// (async function () {
//   let res
//   res = await db.read('SELECT * FROM users LIMIT 1', ['2131']);
//   // res = await db.read('SELECT * FROM users WHERE uuid=$1 LIMIT 1', ['3eedc2f4-3206-4632-9a3f-60cad6257aa2']);
//   console.log('Res=', res);
// }());



/**
 * transform_named_params
 * @param  {string} query  'INSERT INTO auth_data (uuid=, client_id, employee_id, token) VALUES (:uuid, :client_id, :employee_id, :token)'
 * @param  {object} params {
    uuid: '7f193762-1585-4fe1-bbde-05c1aad2fe01',
    client_id: '6ed99ac9-9657-11e2-beb6-1078d2da50b0',
    employee_id: 'e7958b5e-360e-11e2-a60e-08edb9b907e8',
    token: 'e1fe386b-2849-4546-a9cc-64d36649411f',
   }
 * @return {object}  {
 *  query: 'INSERT INTO auth_data (uuid, client_id, employee_id, token) VALUES ($1, $2, $3, $4)',
 *  params: [ '7f193762-1585-4fe1-bbde-05c1aad2fe01', '6ed99ac9-9657-11e2-beb6-1078d2da50b0', 'e7958b5e-360e-11e2-a60e-08edb9b907e8', 'e1fe386b-2849-4546-a9cc-64d36649411f']
 * }
 */
// function transform_named_params(query, params) {
//   const keys = Object.keys(params);
//   const hash = {};
//   const array_param = [];
//   for (var i = 0, l = keys.length; i < l; i++) {
//     const key = keys[i];
//     hash[key] = '$'+(i+1);
//     array_param.push(params[key]);
//     const reg = new RegExp(':'+key+'', 'g');
//     query = query.replace(reg, hash[key]);
//   }
//   return { query, params: array_param };
// }

// console.log(
//   transform_named_params('INSERT INTO auth_data (uuid, client_id, employee_id, token) VALUES (:uuid, :client_id, :employee_id, :token)', {
//     token: 'e1fe386b-2849-4546-a9cc-64d36649411f',
//     client_id: '6ed99ac9-9657-11e2-beb6-1078d2da50b0',
//     employee_id: 'e7958b5e-360e-11e2-a60e-08edb9b907e8',
//     uuid: '7f193762-1585-4fe1-bbde-05c1aad2fe01',
//   })
// );

