const mysql = require('mysql2');
const { rds_connection, test_connection } = require('../lib/db_config');


test = false;
const DB_CONFIG = rds_connection;
const dbName = 'RDS';
if (test == true){
    DB_CONFIG = test_connection;
    dbName = 'localhost';
}

connection = mysql.createConnection(DB_CONFIG);

connection.connect(function (err) {
    if (err){
        return console.error('error: ' + err.message);
    }
    console.log('Connected to database: ' + dbName);
});

connection.end(function(err) {
    if (err) {
      return console.log('error:' + err.message);
    }
    console.log('Closed database connection: ' + dbName);
});

module.exports = connection;