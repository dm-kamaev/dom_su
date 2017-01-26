'use strict';
const config = require('config');
const mysql = require('mysql');

const {user, database, password, host} = config.db
const connection = mysql.createConnection({user: user, password:password, database: database, host: host});

connection.connect();

module.exports = connection;