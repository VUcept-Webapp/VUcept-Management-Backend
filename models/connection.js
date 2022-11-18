const mysql = require('mysql2');
const { rds_connection, test_connection } = require('../lib/db_config');

var DB_CONFIG = rds_connection;
if (process.env.TEST_STATUS === '1'){
    DB_CONFIG = test_connection;
    console.log("Testing Environment");
}

connection = mysql.createPool(DB_CONFIG);
connection.getConnection((err, connection)=> {
    if(err) {
        return console.error('error: ' + err.message);
    }

    console.log('Database connected successfully');
    connection.release();
});

module.exports = connection;
