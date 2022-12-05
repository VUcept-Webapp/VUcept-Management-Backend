require('dotenv').config();
const crypto = require('crypto'); 
const connection = require('../models/connection');
const { STATUS_CODE, REGISTRATION_STATUS} = require('../lib/constants');
const sendEmail = require('../lib/mailHelpers');
const jwt = require('jsonwebtoken');

/**
 * Generate the access token for login and signup 
 * @param {Object} type - user type
 * @returns the access token string
 */
const generateAccessToken = (type) => {
  console.log(type)
  const userType = {type: type.type};
  return jwt.sign(userType, process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn: '30m'
  });
}

/**
 * the refresh token for login and signup; it has an expiration date of three days 
 * @param {Object} type user type
 * @returns the refresh token string
 */
const generateRefreshToken = (type) => {
  console.log(type)
  const userType = {type: type.type};
  return jwt.sign(userType, process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '3d'
    });
}

/**
 * check the user's authentication status
 * @param {string} email 
 * @param {string} password 
 * @returns 
 */
const authenticateUser = async (email, password) =>{
  try {
    const checkResult = await checkUser(email);
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
      user: { name,  email,  visions, type}});
    } else {
      return ({status: STATUS_CODE.INVALID_PASSWORD});
    }
  } catch(e){
    console.log(e);
    return ({status: STATUS_CODE.ERROR});
  }
}

/**
 * insert a refresh token into the db
 * @param {string} token 
 * @returns Promise
 */
const storeToken = (token) =>{
  const query = "INSERT INTO tokens (token) VALUES (?)";
  return new Promise((resolve, reject) => {
    connection.query(query, token, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });
}

/**
 * delete a refresh token from the db
 * @param {string} token 
 * @returns Promise
 */
const deleteToken = (token) =>{
  const query = "DELETE FROM tokens WHERE token = ?";
  return new Promise((resolve, reject) => {
    connection.query(query, token, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });
}

/**
 * find a refresh token from the db
 * @param {string} token 
 * @returns Promise
 */
 const findToken = (token) =>{
  const query = "SELECT COUNT(*) FROM tokens WHERE token = ?";
  return new Promise((resolve, reject) => {
    connection.query(query, token, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });
}

/**
 * generate a new access token according to the refresh token passed in by frontend 
 * @param {Object} req 
 * @param {Object} res 
 * @returns the status of the operation and the new access token 
 */
exports.getAccessToken = async (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.send({status: STATUS_CODE.NO_TOKEN});
  try {
    const tokenResult = await findToken(refreshToken);
    //the refresh token is not in the database 
    if (tokenResult === 0) return res.send({status: STATUS_CODE.NOT_VALID_TOKEN});
    //verify the refresh token 
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, type) =>{
      if (err) return res.send({status: STATUS_CODE.NOT_VALID_TOKEN});
      const newToken = generateAccessToken(type);
      return res.send({status: STATUS_CODE.SUCCESS, token: newToken});
    })
  } catch (e) {
    console.log(e);
    return res.send({status: STATUS_CODE.ERROR});
  }
}

/**
 * logs the user when they are authenticated
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
exports.login = async (req, res) => {
  const {email, password} = req.body;
  try {
    //authenticate user 
    const authResult = await authenticateUser(email, password);
    if (authResult.status !== STATUS_CODE.SUCCESS){
      return res.send(authResult);
    } else {
      const user = authResult.user;
      //generate tokens for authorized users; the token only remembers the user type 
      const accessToken = generateAccessToken({type: user.type});
      const refreshToken = generateRefreshToken({type: user.type});
      //store the refresh token in the db 
      try {
        await storeToken(refreshToken);
      } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
      }
      return res.send({status : STATUS_CODE.SUCCESS, user, accessToken, refreshToken});
    }
  } catch (e){
    console.log(e);
    return res.send({status: STATUS_CODE.ERROR});
  }
}

/**
 * send verification email that has verification code during signup and login
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
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

/**
 * Create password for an authorized user
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
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

/**
 * change password for a specific user
 * @param {Object} req 
 * @param {Object} res 
 * @returns the status code of the operation 
 */
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

/**
 * check and returns a user's information based on email
 * @param {string} email 
 * @returns all relevant information about the user 
 */
async function checkUser(email){
  const query = `SELECT * FROM users WHERE email = ?`;
  return new Promise((resolve, reject) => {
    connection.query(query, email, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  })
}

/**
 * change password for a user based on email
 * @param {string} password 
 * @param {string} email 
 * @returns 
 */
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

/**
 * create the encrypted password based on the user's specific salt
 * @param {string} password 
 * @param {string} salt 
 * @returns the hashed password string
 */
const hashPassword = (password, salt) => {
    // Hashing user's salt and password with 1000 iterations, 
    hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 
    return hash;
}

/**
 * sign out the user by deleting their refresh token out of the database 
 * @param {Object} req 
 * @param {Object} res 
 */
exports.signOut = async (req, res) => {
  const token = req.body.refreshToken;
  try {
    await deleteToken(token);
    return res.send({status : STATUS_CODE.SUCCESS});
  } catch (e){
    return res.send({status: STATUS_CODE.ERROR});
  }
}

/**
 * The middleware that authenticate an access token
 * @param {Object} req 
 * @param {Object} res 
 * @param {function} next 
 */
exports.authenticateToken = (req, res, next) =>{
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.send({status: STATUS_CODE.NO_TOKEN});

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, type) =>{
    if (err) return res.send({status: STATUS_CODE.NOT_VALID_TOKEN})
    req.type = type.type;
    next();
  })
}