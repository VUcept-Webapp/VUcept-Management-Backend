const mysql = require('mysql2');

// database connection - Connection Pool
const connection = mysql.createPool({
    connectionLimit : 100,
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DATABASE
});

module.exports = connection;