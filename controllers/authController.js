const crypto = require('crypto'); 
const connection = require('../models/connection');
const { STATUS_CODE, REGISTRATION_STATUS } = require('../lib/constants');

  exports.login = async (req, res) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    const {email, password} = req.body;
    //check for user status 
    try {
      const checkResult = await checkUser(email.toLowerCase());
      if (checkResult.length === 0) {
        return res.send({status: STATUS_CODE.INCORRECT_USER_EMAIL});
      }
      if (checkResult[0].status === REGISTRATION_STATUS.UNREGISTERED){
        return res.send({status : STATUS_CODE.REQUEST_SIGN_UP});
      }
      const inputHash = hashPassword(password, checkResult[0].salt);
      if (inputHash === checkResult[0].hash){
        return res.send({status: STATUS_CODE.SUCCESS});
      } else {
        return res.send({status: STATUS_CODE.INVALID_PASSWORD});
      }
    } catch(e){
      console.log(e);
      return res.send({status: STATUS_CODE.ERROR});
    }
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
    const {password, email} = req.body;
    //check for user status 
    try {
      const checkResult = await checkUser(email.toLowerCase());
      if (checkResult.length === 0) {
        return res.send({status: STATUS_CODE.INCORRECT_USER_EMAIL});
      }
      if (checkResult[0].status !== REGISTRATION_STATUS.UNREGISTERED){
        return res.send({status : STATUS_CODE.USER_EXIST});
      }
    } catch(e){
      console.log(e);
      return res.send({status: STATUS_CODE.ERROR});
    }

    // Creating a unique salt for a particular user 
    try{
      const changePasswordResult = await changePassword(password, email);
      if (changePasswordResult.affectedRows) {
        return res.send({status : STATUS_CODE.SUCCESS});
      }
    } catch (e){
      console.log(e);
      return res.send({status : STATUS_CODE.ERROR});
    }
  }

  exports.changePassword = async (req, res) => {
    const {password, email} = req.body;
    //check for user status 
    try {
      const checkResult = await checkUser(email.toLowerCase());
      if (checkResult.length === 0) {
        return res.send({status: STATUS_CODE.INCORRECT_USER_EMAIL});
      }
      if (checkResult[0].status === REGISTRATION_STATUS.UNREGISTERED){
        return res.send({status : STATUS_CODE.REQUEST_SIGN_UP});
      }
    } catch(e){
      console.log(e);
      return res.send({status: STATUS_CODE.ERROR});
    }

    // Creating a unique salt for a particular user 
    try {
      const changePasswordResult = await changePassword(password, email);
      if (changePasswordResult.affectedRows) {
        return res.send({status : STATUS_CODE.SUCCESS});
      }
    } catch (e){
      console.log(e);
      return res.send({status : STATUS_CODE.ERROR});
    }
  }

  async function checkUser(email){
    const queryEmail = `SELECT * FROM users WHERE email = ?`;

    return new Promise((resolve, reject) => {
      connection.query(queryEmail, [email], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      })
    })
  }

  async function changePassword (password, email) {
    const salt = crypto.randomBytes(16).toString('hex'); 
    const query = `UPDATE users 
    SET hash = ?, salt = ?, status = 'registered'
    WHERE email = ?`;
    const hash = hashPassword(password, salt);
    return new Promise((resolve, reject) => {
      connection.query(query, [hash, salt, email], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      })
    })
  }
  
  function hashPassword (password, salt) {
     // Hashing user's salt and password with 1000 iterations, 
     hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 
     return hash;
  }

