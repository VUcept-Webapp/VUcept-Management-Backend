require('dotenv').config();
const crypto = require('crypto'); 
const connection = require('../models/connection');
const { STATUS_CODE, REGISTRATION_STATUS} = require('../lib/constants');
const sendEmail = require('../lib/mailHelpers');
const jwt = require('jsonwebtoken');

const authenticateUser = async (email, password) =>{
  try {
    const checkResult = await checkUser(email.toLowerCase());
    if (checkResult.length === 0) {
      return ({status: STATUS_CODE.INCORRECT_USER_EMAIL});
    }
    const userData = checkResult[0];
    if (userData.status === REGISTRATION_STATUS.UNREGISTERED){
      return ({status : STATUS_CODE.REQUEST_SIGN_UP});
    }
    const inputHash = hashPassword(password,  userData.salt);
    if (inputHash ===  userData.hash){
      const name =  userData.name;
      const email =  userData.email;
      const visions =  userData.visions;
      const type =  userData.type;
      return ({status: STATUS_CODE.SUCCESS,
      data: { name,  email,  visions, type}});
    } else {
      return ({status: STATUS_CODE.INVALID_PASSWORD});
    }
  } catch(e){
    console.log(e);
    return ({status: STATUS_CODE.ERROR});
  }
}

const generateAccessToken = (user) =>{
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m'});
}

exports.login = async (req, res) => {
  const {email, password} = req.body;
  try {
    //authenticate user 
    const authResult = await authenticateUser(email, password);
    if (authResult.status != STATUS_CODE.SUCCESS) return res.send(authResult);
    //generate jwt token 
    const user = authResult.data;
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    return res.send({status: STATUS_CODE.SUCCESS, data: user, 
      accessToken: accessToken, refreshToken: refreshToken});
  } catch (e){
    return res.send({status: STATUS_CODE.ERROR});
  }
}
  
exports.sendVerificationEmail = async (req, res) =>{
  const code = Math.floor(100000 + Math.random() * 900000);
  try {
      sendEmail.sendEmail({
      from: process.env.MAIL_EMAIL,
      to: req.body.email,
      subject: 'VUcept Management Verification Code',
      text: 'Please enter the following verification code: ' + code
    });
    return res.send({status: STATUS_CODE.SUCCESS, code : code});
  } catch (e){
    console.log(e);
    return res.send({status: STATUS_CODE.ERROR})
  }
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

