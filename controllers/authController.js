const crypto = require('crypto'); 
const connection = require('../models/connection');
const { STATUS_CODE, REGISTRATION_STATUS } = require('../lib/constants');

exports.login = async (req, res) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    const {email, password, code, originalCode} = req.body;
    connection.promise().query(query, [email.toLowerCase()])
      .then(data => {
        if (data[0].length === 0) {
          return res.send({status: STATUS_CODE.INVALID_EMAIL});
        } else if (data[0][0].status === REGISTRATION_STATUS.UNREGISTERED){
          return res.send({status: STATUS_CODE.REQUEST_SIGN_UP});
        } else if (code === originalCode){
          const inputPassword = hashPassword(password, data[0][0].salt);
          if (inputPassword === data[0][0].hash){
            return res.send({ status: STATUS_CODE.SUCCESS});
          } else {
            return res.send({status: STATUS_CODE.INVALID_PASSWORD});
          }
        } else {
          return res.send({ status: STATUS_CODE.INVALID_CODE});
        }
      })
      .catch(error => {
        console.log(error);
        return res.send({status: STATUS_CODE.ERROR});
      });
  }
  
  exports.sendVerificationEmail = async (req, res) =>{
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
      return res.send({status: STATUS_CODE.INVALID_CODE});
    }
    //check for user status 
    const queryEmail = `SELECT * FROM users WHERE email = ?`;
    await connection.promise().query(queryEmail, [email])
    .then(data => {
      if (data[0].length === 0) {
        return res.send({status: STATUS_CODE.INVALID_EMAIL});
      }
      //data[0][0] contains the actual json object that gets returned by mysql
      if (data[0][0].status !== REGISTRATION_STATUS.UNREGISTERED){
        return res.send({status : STATUS_CODE.USER_EXISTENT});
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

    console.log("here");
    connection.promise().query(query, [hash, salt, email])
    .then(data => {
      if (data[0].affectedRows) {
        return res.send({status : STATUS_CODE.SUCCESS});
      }
    })
    .catch(error => {
      console.log(error);
      return res.send({ status: STATUS_CODE.ERROR});
    });
  }
  
  function hashPassword (password, salt) {
     // Hashing user's salt and password with 1000 iterations, 
     hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 
     return hash;
  }