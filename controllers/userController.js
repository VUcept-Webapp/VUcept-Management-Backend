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
exports.viewallusers = async (req, res) => {
  let message = "view user failed";
  const query = 'SELECT * FROM users';
  connection.promise().query(query)
    .then(data => {
      message = "view user success";
      res.status(200).send({message: message, data: data[0]})
    })
    .catch(error => res.status(400).send({message: message, error: error}));
};

//add one user
exports.adduser = async (req, res) => {
  const { email, name, type, visions} = req.body;
  let message = 'Error in creating user';
  const query = `INSERT INTO users 
  (email, name, type, status, visions)
  VALUES (?,?,?,'unregistered',?)`;

  connection.promise().query(query, [email, name, type, visions])
  .then(data => {
    if (data[0].affectedRows) {
      message = 'user created successfully';
      res.status(200).send({message: message, data: data[0]});
    }
  })
  .catch(error => {
    res.status(400).send({message: message, error: error});
  });
};

//delete one user
exports.deleteuser = async (req, res) => {
  const {email} = req.body.email;
  let message = 'Error in deleting user';
  const query = `DELETE FROM users 
  WHERE email = ?;`;

  connection.promise().query(query, email)
  .then(data => {
    if (data[0].affectedRows) {
      message = 'user deleted successfully';
      res.status(200).send({message: message, data: data[0]});
    }
  })
  .catch(error => {
    res.status(400).send({message: message, error: error});
  });

  return res;
};

//edit one user
exports.edituser = async (req, res) => {
  const { email, name, type, visions} = req.body;
  let message = 'Error in editing user';
  const query = `UPDATE users 
  SET name = ?, type = ?, visions = ?
  WHERE email = ?`;

  connection.promise().query(query, [name, type, visions, email])
  .then(data => {
    if (data[0].affectedRows) {
      message = 'user edited successfully';
      console.log(message);
      res.status(200).send({message: message, data: data[0]});
    }
  })
  .catch(error => {
    res.status(400).send({message: message, error: error});
  });
};