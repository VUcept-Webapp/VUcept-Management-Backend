const fs = require("fs");
const { STATUS_CODE, SORT_ORDER, TYPE, REGISTRATION_STATUS } = require('../lib/constants');
const connection = require('../models/connection');

//reset the entire database and delete all information
exports.resetDatabase = async (req, res) => {
  const query = `DELETE FROM users;` + 'DELETE FROM students;' + 'DELETE FROM student_attendance;' +
  `DELETE FROM student_events;` + 'DELETE FROM vuceptor_events;' + 'DELETE FROM vuceptor_attendance;';

  const reset = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  try{
    await reset;
  } catch (error){
    return res.send({ status: STATUS_CODE.ERROR, message: error });
  }

  return res.send({ status: STATUS_CODE.ERROR });
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
      return res.send({ status: STATUS_CODE.ERROR, message: error });
    }
  }

  if(duplicates.length == 0){
    return res.send({ status: STATUS_CODE.SUCCESS });
  } else{
    return res.send({ status: STATUS_CODE.EMAIL_USED, message: duplicates });
  }
  
};

//add one user
exports.createUser = async (req, res) => {
  const { email, name, type, visions } = req.body;

  try {
    let verify = await this.verifyUser( email );
    if (verify.NUM > 0) {
      return res.send({ status: STATUS_CODE.EMAIL_USED, message: email });
    }

    let result = await this.insertUser({ email, name, type, visions });
    
    if (result.affectedRows) {
      return res.send({ status: STATUS_CODE.SUCCESS });
    }
  } catch (error) {
    return res.send({ status: STATUS_CODE.ERROR, message: error });
  }

  return res.send({ status: STATUS_CODE.ERROR });
};

//get all first year students, return a json object
exports.readUser = async (req, res) => {
  const name_sort = (!req.query.name_sort) ? ' name ASC' : ' name ' + req.query.name_sort;
  const name_search = (!req.query.name_search) ? '' : ' name = ' + req.query.name_search;
  const email_sort = (!req.query.email_sort) ? '' : ' email ' + req.query.email_sort;
  const email_search = (!req.query.email_search) ? '' : ' email = ' + req.query.email_search;
  const visions_sort = (!req.query.visions_sort) ? '' : ' visions ' + req.query.visions_sort;
  const visions_filter = (!req.query.visions_filter) ? '' : ' visions = ' + req.query.visions_filter;
  const status_filter = (!req.query.status_filter) ? '' : ' status = ' + req.query.status_filter;
  const type_filter = (!req.query.type_filter) ? '' : ' type = ' + req.query.type_filter;
  const row_start = (!req.query.row_start) ? 0 : req.query.row_start;
  const row_num = (!req.query.row_num) ? 10 : req.query.row_num;

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

  var orderby = '';
  const orderby_list = [name_sort, email_sort, visions_sort];
  orderby_list.forEach(order => {
    if(order !== ''){
      if (orderby !== ''){
        orderby = orderby + ' ,' + order;
      } else {
        orderby = ' ORDER BY' + order;
      }
    }
  })
  
  const query = 'SELECT name, email, visions, type, status FROM users' +  where + orderby +
  ' LIMIT ' + row_num + ' OFFSET ' + row_start;

  const viewusers = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  try {
    let result = await viewusers;
    return res.send({ status: STATUS_CODE.SUCCESS, message: result})
  } catch (error) {
    return res.send({ status: STATUS_CODE.ERROR, message: error });
  }
};

//delete one user
exports.deleteUser = async (req, res) => {
  try{
    const email = req.body.email;
   
    let verify = await this.verifyUser( email );

    if (verify.NUM == 0) {
      return res.send({ status: STATUS_CODE.INCORRECT_USER_EMAIL, message: email });
    }

    let result = await this.removeUser( email );

    if (result.affectedRows){
      return res.send({ status: STATUS_CODE.SUCCESS });
    }
  } catch (error) {
    return res.send({ status: STATUS_CODE.ERROR, message: error });
  }

  return res.send({ status: STATUS_CODE.ERROR });
};

//edit one user
exports.updateUser = async (req, res) => {
  const { old_email, email, name, type, visions } = req.body;

  try{
    let verify = await this.verifyUser( old_email );
    
    console.log(verify);

    if (verify.NUM == 0) {
      return res.send({ status: STATUS_CODE.INCORRECT_USER_EMAIL, message: old_email });
    }

    let remove = await this.removeUser( old_email );
    if (remove.affectedRows){
      console.log('update in process....');
    }

    let result = await this.insertUser({ email, name, type, visions });
    if (result.affectedRows) {
      return res.send({ status: STATUS_CODE.SUCCESS });
    }
  } catch (error){
    return res.send({ status: STATUS_CODE.ERROR, message: error });
  }

  return res.send({ status: STATUS_CODE.ERROR });
};

