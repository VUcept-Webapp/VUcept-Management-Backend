const mysql = require('mysql2');

// Connection Pool
const connection = mysql.createConnection({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    port     : process.env.RDS_PORT,
    database : process.env.RDS_DATABASE
});

connection.connect(
    function(err) {
        if (err) throw err;
        console.log("Connected!");
  });

//get all users, return a json object
exports.viewallusers = (req, res) => {
  const query = 'SELECT * FROM users';
  connection.promise().query(query)
    .then(data => res.status(200).send(data[0]))
    .catch(error => res.status(400).send(error));
};

//add one user
exports.adduser = (req, res) => {
  const { email, name, type, status, group } = req.body;

  const query = `INSERT INTO users VALUES (?,?,?,?,?)`;

  connection.promise().query(query, [email, name, type, status, group])
  .then(data => {
    if (data[0].affectedRows) {
      message = 'user created successfully';
      res.status(200).send({message: message, data: data[0]});
    }
  })
  .catch(error => {
    message = 'Error in creating user';
    res.status(400).send({message: message, error: error});
  });
};