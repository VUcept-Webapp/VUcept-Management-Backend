const crypto = require('crypto'); 
const { STATUS_CODE, SORT_ORDER, TYPE, REGISTRATION_STATUS } = require('../lib/constants');
const connection = require('../models/connection');

//reset the entire database and delete all information
exports.resetDatabase = async (req, res) => {
  const query = `DELETE FROM users;`;

  const reset = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  try {
    await reset;
  } catch (error){
    return res.send({ status: STATUS_CODE.ERROR, result: error });
  }

  return res.send({ status: STATUS_CODE.SUCCESS });
};

// Shared functions
exports.insertUser = ({ email, name, type, visions }) => {
  const query = `INSERT INTO users (email, name, type, status, visions) VALUES (?,?,?,'unregistered',?)`;

  return new Promise((resolve, reject) => {
    connection.query(query, [email, name, type, visions], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  })
}

exports.verifyUser = ( email ) => {
  const queryCheck = 'SELECT COUNT(email) AS NUM FROM users WHERE email = ?';

  return new Promise ((resolve, reject) => {
    connection.query(queryCheck, email, (err, res) => {
      if (err) reject(err);
      else resolve(res[0]);
    })
  });
}

exports.removeUser = ( email ) => {
  const query = `DELETE FROM users WHERE email = ?`;

  return new Promise((resolve, reject) => {
    connection.query(query, email, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });
}

exports.editUser = ({ old_email, email, name, type, visions }) => {
  const query = `UPDATE users SET email = ?, name = ?, type = ?, visions = ? WHERE email = ?;`;
  console.log({ email, name, type, visions, old_email,  });

  return new Promise((resolve, reject) => {
    connection.query(query, [email, name, type, visions, old_email], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  })
}

//load with csv file
exports.loadfruserLoadfromcsvomcsv = async (req, res) => {
  const { file } = req.body;
  var duplicates = [];

  // Fetching the data from each row 
  // and inserting to the table "sample"
  for (var i = 0; i < file.length; i++) {
    var email = file[i]["email"],
      name = file[i]["name"],
      type = file[i]["type"],
      visions = file[i]["visions"];

    try {
      let verify = await this.verifyUser( email );
      if (verify.NUM > 0) {
        duplicates.push(email);
      } else{
        await this.insertUser({ email, name, type, visions });
      }
    } catch (error) {
      return res.send({ status: STATUS_CODE.ERROR, result: error });
    }
  }

  if(duplicates.length == 0){
    return res.send({ status: STATUS_CODE.SUCCESS });
  } else{
    return res.send({ status: STATUS_CODE.EMAIL_USED, result: duplicates });
  }
  
};

//add one user
exports.createUser = async (req, res) => {
  const { email, name, type, visions } = req.body;

  try {
    let verify = await this.verifyUser( email );
    if (verify.NUM > 0) {
      return res.send({ status: STATUS_CODE.EMAIL_USED, result: email });
    }

    let result = await this.insertUser({ email, name, type, visions });
    
    if (result.affectedRows) {
      return res.send({ status: STATUS_CODE.SUCCESS });
    }
  } catch (error) {
    return res.send({ status: STATUS_CODE.ERROR, result: error });
  }

  return res.send({ status: STATUS_CODE.ERROR });
};

//get all first year students, return a json object
exports.readUser = async (req, res) => {
  const name_sort = (!req.query.name_sort) ? '' : ' name ' + req.query.name_sort;
  const name_search = (!req.query.name_search) ? '' : ' name = ' + req.query.name_search;
  const email_sort = (!req.query.email_sort) ? '' : ' email ' + req.query.email_sort;
  const email_search = (!req.query.email_search) ? '' : ' email = ' + req.query.email_search;
  const visions_sort = (!req.query.visions_sort) ? '' : ' visions ' + req.query.visions_sort;
  const visions_filter = (!req.query.visions_filter) ? '' : ' visions = ' + req.query.visions_filter;
  const status_filter = (!req.query.status_filter) ? '' : ' status = ' + req.query.status_filter;
  const type_filter = (!req.query.type_filter) ? '' : ' type = ' + req.query.type_filter;
  const row_start = (!req.query.row_start) ? 0 : req.query.row_start;
  const row_num = (!req.query.row_num) ? 50 : req.query.row_num;
  // add variable "condition_order"
  const condition_order = (!req.query.condition_order) ? null : JSON.parse(req.query.condition_order);

  // check parameters
  const sort_list = [req.query.name_sort, req.query.email_sort, req.query.visions_sort];
  for (var i = 0; i < sort_list.length; ++i){
    if (sort_list[i] && (sort_list[i] !== SORT_ORDER.ASC) && (sort_list[i] !== SORT_ORDER.DESC)){
      console.log("SORT ERROR\n");
      return res.send({ status: STATUS_CODE.UNKNOWN_SORT });
    }
  }

  if ((req.query.status_filter) && (req.query.status_filter !== REGISTRATION_STATUS.REGISTERED) && 
  (req.query.status_filter !== REGISTRATION_STATUS.UNREGISTERED)){
    console.log("STATUS ERROR\n");
    return res.send({ status: STATUS_CODE.INCORRECT_STATUS });
  }

  if ((req.query.type_filter) && (req.query.type_filter !== TYPE.VUCEPTOR) && (req.query.type_filter !== TYPE.ADVISER)
  && (req.query.type_filter !== TYPE.BOARD)){
    console.log("TYPE ERROR\n");
    return res.send({ status: STATUS_CODE.INCORRECT_TYPE });
  }

  // create where string
  var where = '';
  const where_list = [name_search, email_search, visions_filter, status_filter, type_filter];
  where_list.forEach(cond => {
    if(cond !== ''){
      if (where !== ''){
        where = where + ' AND' + cond;
      } else {
        where = ' WHERE' + cond;
      }
    }
  })

  // ORDER BY A, B will first order database by A, if A is the same then order by B
  // if condition_order is not passed in, it will order with priorty of name -> email -> visions
  // if condition_order is given, it will only contain sorting conditions within condition_order 
  var orderby = '';
  var orderby_list = []
  if (condition_order == null){
    orderby_list = [name_sort, email_sort, visions_sort];
  } else {
    for(let i = 0; i < condition_order.length; i++){
      let cond = condition_order[i];
  
      switch (cond) {
        case "name_sort":
          orderby_list.push(name_sort);
          break;
        case "email_sort":
          orderby_list.push(email_sort);
          break;
        case "visions_sort":
          orderby_list.push(visions_sort);
      }
    }
  }

  orderby_list.forEach(order => {
    if(order !== ''){
      if (orderby !== ''){
        orderby = orderby + ' ,' + order;
      } else {
        orderby = ' ORDER BY' + order;
      }
    }
  })

  //calculate the number of pages
  const queryCount = "SELECT COUNT(*) AS count FROM users";
  var pages = 0;
  await connection.promise().query(queryCount)
  .then(data => {
    pages = Math.ceil(data[0][0].count/row_num);
  })
  .catch(error => {
    console.log(error);
  });

  const query = 'SELECT name, email, visions, type, status FROM users' +  where + orderby +
  ' LIMIT ' + row_num + ' OFFSET ' + row_start;

  const viewusers = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  try {
    var rows = await viewusers;
    return res.send({ status: STATUS_CODE.SUCCESS, result: {rows, pages}})
  } catch (error) {
    return res.send({ status: STATUS_CODE.ERROR, result: error });
  }
};

// async function countRows (table) {

// }

//delete one user
exports.deleteUser = async (req, res) => {
  try{
    const email = req.body.email;
   
    let verify = await this.verifyUser( email );

    if (verify.NUM == 0) {
      return res.send({ status: STATUS_CODE.INCORRECT_USER_EMAIL, result: email });
    }

    let result = await this.removeUser( email );

    if (result.affectedRows){
      return res.send({ status: STATUS_CODE.SUCCESS });
    }
  } catch (error) {
    return res.send({ status: STATUS_CODE.ERROR, result: error });
  }
  console.log('success');
  return res.send({ status: STATUS_CODE.SUCCESS});
}

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
      res.send({status: STATUS_CODE.ERROR});
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
  connection.promise().query(queryEmail, [email])
  .then(data => {
    if (data[0].length === 0) {
      console.log(data[0])
      return res.send({status: STATUS_CODE.INVALID_EMAIL});
    } else {
      //data[0][0] contains the actual json object that gets returned by mysql
      if (data[0][0].status !== REGISTRATION_STATUS.UNREGISTERED){
        return res.send({status : STATUS_CODE.USER_EXISTENT});
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
    console.log(error);
    return res.send({ status: STATUS_CODE.ERROR});
  });
}

function hashPassword (password, salt) {
   // Hashing user's salt and password with 1000 iterations, 
   hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`); 
   return hash;
}

//edit one user
exports.updateUser = async (req, res) => {
  const { old_email, email, name, type, visions } = req.body;

  try{
    let result = await this.editUser({ old_email, email, name, type, visions });
    return res.send({ status: STATUS_CODE.SUCCESS });
  } catch (error){
    return res.send({ status: STATUS_CODE.ERROR, result: error });
  }

};
