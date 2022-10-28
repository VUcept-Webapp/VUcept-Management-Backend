// RDS database connection
const rds_connection = {
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DATABASE
};

// testing database connection
const test_connection = {
    host: process.env.LOCAL_HOSTNAME,
    user: process.env.LOCAL_USERNAME,
    password: process.env.LOCAL_PASSWORD,
    port: process.env.LOCAL_PORT,
    database: process.env.LOCAL_DATABASE
};

module.exports = {
    rds_connection,
    test_connection
}