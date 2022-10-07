const mysql = require('mysql2');

// database connection
// Connection Pool
const connection = mysql.createConnection({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DATABASE
});

connection.connect(
    function (err) {
        if (err) throw err; 
        console.log("Connected!");
    });

module.exports = connection;