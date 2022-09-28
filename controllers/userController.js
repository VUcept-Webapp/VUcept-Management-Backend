const mysql = require('mysql');

// Connection Pool
const connection = mysql.createConnection({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    port     : process.env.RDS_PORT
});

connection.connect(
    function(err) {
        if (err) throw err;
        console.log("Connected!");
  });


// View Users
exports.viewallusers = (req, res) => {
    connection.query('SELECT * FROM users', (err, rows) => {
      if (!err) {
        res.send({ rows }); // Not sure if this will work
        // for (let row of rows) {
        //     res.send(JSON.stringify(row));
        // }
      } else {
        console.log(err);
      }

      console.log('The data from user table');
    });
  }

// Add new user
exports.create = (req, res) => {
    const {name, email, type, status, group} = req.body;
    let searchTerm = req.body.search;
  
    // User the connection
    connection.query('INSERT INTO users SET name = ?, email = ?, type = ?, status = ?, group = ?', [name, email, type, status, group], (err, rows) => {
      if (!err) {
        res.send({ alert: 'User added successfully.' }); // Not sure if this will work
      } else {
        console.log(err);
      }

      console.log('The data from user table: \n', rows);
    });
  }

