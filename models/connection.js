const mysql = require('mysql2');

// database connection - Connection Pool
const pool = mysql.createPool({
    connectionLimit : 100,
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DATABASE
});

pool.getConnection((err, connection)=> {
    if(err)
    throw err;
    console.log('Database connected successfully');
    connection.release();
});

module.exports = pool;