const mysql = require('mysql2');
const { rds_connection, test_connection } = require('../lib/db_config');

var DB_CONFIG = rds_connection;

if (process.env.TEST_STATUS === '1'){
    DB_CONFIG = test_connection;
    console.log("Testing Environment");
}

const pool = mysql.createPool(DB_CONFIG);

pool.getConnection((err, connection)=> {
    if(err)
    throw err;
    console.log('Database connected successfully');
    connection.release();
});

module.exports = pool;


// connect = (connection) => {
//     connection.connect(function (err) {
//         if (err){
//             return console.error('error: ' + err.message);
//         }
//         console.log('Connected to database');
//       });   
// }

// disconnect = (connection) => {
//     connection.end(function(err) {
//         if (err) {
//           return console.log('error:' + err.message);
//         }
//         console.log('Closed database connection');
//     });
// }
