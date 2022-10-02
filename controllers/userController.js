const mysql = require('mysql2');
const fs = require("fs");
const csv = require('csvtojson');
const { insertUser } = require('../models/userManagement');
const { STATUS_CODE } = require('../lib/constants');

//remember search conditions
// const user_conditions = {
//   //camel case
//   nameSort, name_search, email_sort, email_search, visions_sort, visions_filter, status_filter, type_filter
// }

// const attendance_conditions = {
//   week_sort, week_filter
// }

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

exports.addUser = async (req, res) => {
  try {
    await insertUser(req.body);
    console.log(req.body);
  } catch(err) {
    console.log(err);
    res.send({ status: STATUS_CODE.ERROR });
  }
  console.log('success');
  res.send({ status: STATUS_CODE.SUCCESS});
}