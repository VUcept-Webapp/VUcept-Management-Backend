const mysql = require('mysql2');
const fs = require("fs");
const csv = require('csvtojson');
const { insertUser } = require('../models/userManagement');
const { STATUS_CODE, LOG_IN_STATUS, transport, SIGN_UP_STATUS, REGISTRATION_STATUS } = require('../lib/constants');
const crypto = require('crypto'); 
// const { connection } = require ('../models/model');


//remember search conditions
// const user_conditions = {
//   //camel case
//   nameSort, name_search, email_sort, email_search, visions_sort, visions_filter, status_filter, type_filter
// }

// const attendance_conditions = {
//   week_sort, week_filter
// }

const connection = mysql.createConnection({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  port: process.env.RDS_PORT,
  database: process.env.RDS_DATABASE
});

connection.connect(
  function (err) {
      if (err) throw err; ``
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

exports.login = async (req, res) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  const {email, password, code, originalCode} = req.body;
  connection.promise().query(query, [email.toLowerCase()])
    .then(data => {
      if (data[0].length === 0) {
        return res.send({status: LOG_IN_STATUS.INVALID_EMAIL});
      } else if (data[0][0].status === REGISTRATION_STATUS.UNREGISTERED){
        return res.send({status: LOG_IN_STATUS.REQUEST_SIGN_UP});
      } else if (code === originalCode){
        const inputPassword = hashPassword(password, data[0][0].salt);
        if (inputPassword === data[0][0].hash){
          return res.send({ status: LOG_IN_STATUS.SUCCESS});
        } else {
          return res.send({status: LOG_IN_STATUS.INVALID_PASSWORD});
        }
      } else {
        return res.send({ status: LOG_IN_STATUS.INVALID_CODE});
      }
    })
    .catch(error => {
      console.log(error);
      res.send({status: STATUS_CODE.ERROR});
    });
}

exports.sendEmail = async (req, res) =>{
  const code = Math.floor(100000 + Math.random() * 900000);
  const mailOptions = {
    from: process.env.MAIL_EMAIL,
    to: req.body.email,
    subject: 'VUcept Management Verification Code',
    text: 'Please enter the following verification code: ' + code
  };
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.send({status: STATUS_CODE.ERROR});
    } else {
      res.send({status: STATUS_CODE.SUCCESS, code: code})
    }
  });
}

exports.signUp = async (req, res) => {
  const {password, code, originalCode, email} = req.body;
  //check for verification code
  if (code !== originalCode) {
    return res.send({status: SIGN_UP_STATUS.INVALID_CODE});
  }
  //check for user status 
  const queryEmail = `SELECT * FROM users WHERE email = ?`;
  connection.promise().query(queryEmail, [email])
  .then(data => {
    if (data[0].length === 0) {
      console.log(data[0])
      return res.send({status: SIGN_UP_STATUS.INVALID_EMAIL});
    } else {
      //data[0][0] contains the actual json object that gets returned by mysql
      if (data[0][0].status !== REGISTRATION_STATUS.UNREGISTERED){
        return res.send({status : SIGN_UP_STATUS.USER_EXISTENT});
      }
    }
  })
  .catch(error => {
    console.log(error);
    return res.send({ status: STATUS_CODE.ERROR});
  });
  // Creating a unique salt for a particular user 
  const salt = crypto.randomBytes(16).toString('hex'); 
  const query = `UPDATE users 
  SET hash = ?, salt = ?, status = 'registered'
  WHERE email = ?`;
  const hash = hashPassword(password, salt);

  connection.promise().query(query, [hash, salt, email])
  .then(data => {
    if (data[0].affectedRows) {
      return res.send({status : STATUS_CODE.SUCCESS});
    }
  })
  .catch(error => {
    return res.send({ status: STATUS_CODE.ERROR});
  });
}

function hashPassword (password, salt) {
   // Hashing user's salt and password with 1000 iterations, 
   hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 
   return hash;
}




