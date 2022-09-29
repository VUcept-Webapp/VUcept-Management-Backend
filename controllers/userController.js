const mysql = require('mysql2');
const fs = require("fs");
const csv = require('csvtojson');

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
    if (err) throw err;``
    console.log("Connected!");
  });

//get all users, return a json object
exports.viewallusers = async (req, res) => {
  let message = "view user failed";
  const query = 'SELECT * FROM users';
  connection.promise().query(query)
    .then(data => {
      message = "view user success";
      res.send({ status: SUCCESS })
    })
    .catch(error => res.send({status: SUCCESS, error: error }));
};

//get all first year students, return a json object
exports.viewallstudents = async (req, res) => {
  let message = "view user failed";
  const query = 'SELECT * FROM students';
  connection.promise().query(query)
    .then(data => {
      message = "view user success";
      res.send({ message: message, data: data[0] })
    })
    .catch(error => res.send({ message: message, error: error }));
};

//add one user
exports.adduser = async (req, res) => {
  const { email, name, type, visions } = req.body;
  let message = 'Error in creating user';
  const query = `INSERT INTO users 
  (email, name, type, status, visions)
  VALUES (?,?,?,'unregistered',?)`;

  connection.promise().query(query, [email, name, type, visions])
    .then(data => {
      if (data[0].affectedRows) {
        message = 'user created successfully';
        res.send({ message: message, data: data[0] });
      }
    })
    .catch(error => {
      res.send({ message: message, error: error });
    });
};

//delete one user
exports.deleteuser = async (req, res) => {
  const { email } = req.body.email;
  let message = 'Error in deleting user';
  const query = `DELETE FROM users 
  WHERE email = ?;`;

  connection.promise().query(query, email)
    .then(data => {
      if (data[0].affectedRows) {
        message = 'user deleted successfully';
        res.send({ message: message, data: data[0] });
      }
    })
    .catch(error => {
      res.send({ message: message, error: error });
    });

  return res;
};

//edit one user
exports.edituser = async (req, res) => {
  const { email, name, type, visions } = req.body;
  let message = 'Error in editing user';
  const query = `UPDATE users 
  SET name = ?, type = ?, visions = ?
  WHERE email = ?`;

  connection.promise().query(query, [name, type, visions, email])
    .then(data => {
      if (data[0].affectedRows) {
        message = 'user edited successfully';
        console.log(message);
        res.send({ message: message, data: data[0] });
      }
    })
    .catch(error => {
      res.send({ message: message, error: error });
    });
};


//load with csv file
exports.loadfromcsv = async (req, res) => {
  const { file } = req.body;

  // Fetching the data from each row 
  // and inserting to the table "sample"
  for (var i = 0; i < file.length; i++) {
    var email = file[i]["email"],
      name = file[i]["name"],
      type = file[i]["type"],
      visions = file[i]["visions"];

    const query = `INSERT INTO users 
        (email, name, type, status, visions)
        VALUES (?,?,?,'unregistered',?)`;

    const body = [email, name, type, visions];

    // Insert row to databae
    connection.promise().query(query, body)
      .catch(error => {
        message = 'ERROR: user creation failed';
        res.send({ message: message, error: error });
      });
  }

  message = 'user created successfully';
  res.send({ message: message });
};