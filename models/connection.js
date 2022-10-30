const mysql = require('mysql2');
const { rds_connection, test_connection } = require('../lib/db_config');

dbConfig = () => {
    let DB_CONFIG = rds_connection;

    if (process.env.TEST_STATUS === '1'){
        DB_CONFIG = test_connection;
        console.log("Testing Environment");
    }

    connection = mysql.createConnection(DB_CONFIG);

    return connection;
};

connect = (connection) => {
    connection.connect(function (err) {
        if (err){
            return console.error('error: ' + err.message);
        }
        console.log('Connected to database');
      });
}

disconnect = (connection) => {
    connection.end(function(err) {
        if (err) {
          return console.log('error:' + err.message);
        }
        console.log('Closed database connection');
    });
}

module.exports = { dbConfig, connect, disconnect };