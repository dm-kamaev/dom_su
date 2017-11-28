'use strict';

// CONNECTOR FOR POSTGRES
// TODO: Inject logger

const pg = require('pg');
// const config = require('config');

const db = exports;

// const configPool = {
//   user: config.db.user, // name of the user account
//   password: config.db.password, // name of the user account
//   database: config.db.database, // name of the database
//   host: config.db.host,
//   max: 10, // max number of clients in the pool
//   idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
// };
const configPool = {
  user: "domovenok",
  password: "domovenokPG",
  database: "pancake",
  host: "localhost",
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed

};

const pool = new pg.Pool(configPool);

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.log('Unexpected error on idle client', err);
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
db.read =  async function (query, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(query, params);
    return res.rows;
  } catch(err) {
    return new Error(err);
  } finally {
    client.release();
  }
};

// TODO: readOne
// db.readOne = function (query, params) {

// };

// TODO: to finalize
db.write = async function (query, params) {
  const client = await pool.connect();
  try {
    const res = await client.query(query, params);
    return res.rows[0];
  } catch(e) {
    console.log(new Error(e));
  } finally {
    client.release();
  }
};

// EXAMPLE
// (async function () {
//   let res
//   res = await db.read('SELECT * FROM users LIMIT 1', ['2131']);
//   // res = await db.read('SELECT * FROM users WHERE uuid=$1 LIMIT 1', ['3eedc2f4-3206-4632-9a3f-60cad6257aa2']);
//   console.log('Res=', res);
// }());



