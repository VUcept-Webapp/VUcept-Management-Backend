const fs = require("fs");
const { STATUS_CODE, SORT_ORDER, TYPE, REGISTRATION_STATUS } = require('../lib/constants');
const connection = require('../models/connection');

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

exports.verifyUser = ({ email }) => {
  const queryCheck = 'SELECT 1 FROM users WHERE email = ?';

  return new Promise ((resolve, reject) => {
    connection.query(queryCheck, email, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });
}

exports.removeUser = ({ email }) => {
  const query = `DELETE FROM users WHERE email = ` + email;

  return new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });
}

//load with csv file
exports.loadfruserLoadfromcsvomcsv = async (req, res) => {
  const { file } = req.body;

  // Fetching the data from each row 
  // and inserting to the table "sample"
  for (var i = 0; i < file.length; i++) {
    var email = file[i]["email"],
      name = file[i]["name"],
      type = file[i]["type"],
      visions = file[i]["visions"];

    try {
      let verify = await this.verifyUser({ email });
      if (verify[0] > 0) {
        return res.send({ status: STATUS_CODE.EMAIL_USED, message: email });
      }
      await this.insertUser({ email, name, type, visions });
    } catch (error) {
      return res.send({ status: STATUS_CODE.ERROR, message: error });
    }
  }

  return res.send({ status: STATUS_CODE.SUCCESS });
};

//add one user
exports.createUser = async (req, res) => {
  const { email, name, type, visions } = req.body;

  try {
    let verify = await this.verifyUser({ email });
    if (verify[0] > 0) {
      return res.send({ status: STATUS_CODE.EMAIL_USED, message: email });
    }

    let result = await this.insertUser(req.body);
    if (result[0].affectedRows) {
      return res.send({ status: STATUS_CODE.SUCCESS });
    }
  } catch (error) {
    return res.send({ status: ERROR, message: error });
  }

  return res.send({ status: ERROR });
};

//get all first year students, return a json object
exports.readUser = async (req, res) => {
  const name_sort = (!req.query.name_sort) ? ' name ' : ' name ' + req.query.name_sort;
  const name_search = (!req.query.name_search) ? '' : ' name = ' + req.query.name_search;
  const email_sort = (!req.query.email_sort) ? '' : ' email ' + req.query.email_sort;
  const email_search = (!req.query.email_search) ? '' : ' email = ' + req.query.email_search;
  const visions_sort = (!req.query.visions_sort) ? '' : ' visions ' + req.query.visions_sort;
  const visions_filter = (!req.query.visions_filter) ? '' : ' visions = ' + req.query.visions_filter;
  const status_filter = (!req.query.status_filter) ? '' : ' status = ' + req.query.status_filter;
  const type_filter = (!req.query.type_filter) ? '' : ' type = ' + req.query.type_filter;
  const row_start = (!req.query.row_start) ? 0 : req.query.row_start;
  const row_num = (!req.query.row_end) ? 10 : req.query.row_end;

  // check parameters
  const sort_list = [req.query.name_sort, req.query.email_sort, req.query.visions_sort];
  sort_list.forEach(sort => {
    if (sort && (sort !== SORT_ORDER.ASC) && (sort !== SORT_ORDER.DESC)){
      return res.send({ status: STATUS_CODE.UNKNOWN_SORT });
    }
  })

  if ((req.query.status_filter) && (req.query.status_filter !== REGISTRATION_STATUS.REGISTERED) && 
  (req.query.status_filter !== REGISTRATION_STATUS.UNREGISTERED)){
    return res.send({ status: STATUS_CODE.INCORRECT_STATUS });
  }

  if ((req.query.type_filter) && (req.query.type_filter !== TYPE.VUCEPTOR) && (req.query.type_filter !== TYPE.ADVISER)
  && (req.query.type_filter !== TYPE.BOARD)){
    return res.send({ status: STATUS_CODE.INCORRECT_TYPE });
  }

  // create where string
  const where = '';
  const where_list = [name_search, email_search, visions_filter, status_filter, type_filter];
  where_list.forEach(cond => {
    if(cond !== ''){
      if (where !== ''){
        where = where + ' AND ' + cond;
      } else {
        where = ' WHERE ' + cond;
      }
    }
  })

  const orderby = '';
  const orderby_list = [name_sort, email_sort, visions_sort];
  orderby_list.forEach(order => {
    if(order !== ''){
      if (orderby !== ''){
        orderby = orderby + ' AND ' + order;
      } else {
        orderby = ' ORDER BY ' + order;
      }
    }
  })
  
  const query = 'SELECT name, email, visions, type, status FROM users' + orderby + where +
  ' LIMIT ' + row_num + ' OFFSET ' + row_start;

  const viewusers = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  try {
    let result = await viewusers;
    res.send({ status: STATUS_CODE.SUCCESS, message: result[0]})
  } catch (error) {
    return res.send({ status: STATUS_CODE.ERROR, message: error });
  }
};

//delete one user
exports.deleteUser = async (req, res) => {

  try{
    let verify = await this.verifyUser( req.body.email );
    if(!verify[0]){
      return res.send({ status: STATUS_CODE.INCORRECT_USER_EMAIL });
    }

    let result = await this.removeUser( req.body.email );
    if (result[0].affectedRows){
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
    if(!verify[0]){
      return res.send({ status: STATUS_CODE.INCORRECT_USER_EMAIL });
    }

    let remove = await this.removeUser( old_email );
    // if (remove[0].affectedRows){
    //   console.log("User update in process...");
    // }

    let result = await this.insertUser({ email, name, type, visions });
    if (result[0].affectedRows) {
      return res.send({ status: STATUS_CODE.SUCCESS });
    }
  } catch (error){
    return res.send({ status: STATUS_CODE.ERROR, message: error });
  }

  return res.send({ status: STATUS_CODE.ERROR });
};