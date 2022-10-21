const { STATUS_CODE, SORT_ORDER } = require('../lib/constants');
const connection = require('../models/connection');

// FIXME: how are user_id and student_id generated


// Shared functions: insertFy
exports.insertFy = ({ email, name, visions }) => {
  const query = 'INSERT INTO students (email, name, visions) VALUES (?,?,?)';

  return new Promise((resolve, reject) => {
    connection.query(query, [email, name, visions], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  })
};

// Shared function: verifyFy
exports.verifyFy = ( email ) => {
  const queryCheck = 'SELECT COUNT(email) AS NUM FROM students WHERE email = ?';

  return new Promise ((resolve, reject) => {
    connection.query(queryCheck, email, (err, res) => {
      if (err) reject(err);
      else resolve(res[0]);
    })
  });
};

// Shared function: removeFy
exports.removeFy = ( email ) => {
  const query = `DELETE FROM students WHERE email = ?`;

  return new Promise((resolve, reject) => {
    connection.query(query, email, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });
};

// Shared function: editFy
exports.editFy = ({ old_email, email, name, visions }) => {
  const query = `UPDATE students SET email = ?, name = ?, visions = ? WHERE email = ?;`;
  // console.log({ email, name, type, visions, old_email,  });

  return new Promise((resolve, reject) => {
    connection.query(query, [email, name, visions, old_email], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  })
};

//reset the Fy table
exports.resetFy = async (req, res) => {
  const query = 'DELETE FROM students;';

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

//load with csv file
exports.fyLoadfromcsv = async (req, res) => {
  const { file } = req.body;
  var duplicates = [];

  // Fetching the data from each row 
  // and inserting to the table "sample"
  for (var i = 0; i < file.length; i++) {
    var email = file[i]["email"],
      name = file[i]["name"],
      visions = file[i]["visions"];

    try {
      let verify = await this.verifyFy( email );
      if (verify.NUM > 0) {
        duplicates.push(email);
      } else{
        await this.insertFy({ email, name, visions });
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

//add one Fy
exports.createFy = async (req, res) => {
  const { email, name, visions } = req.body;

  try {
    let verify = await this.verifyFy( email );
    if (verify.NUM > 0) {
      return res.send({ status: STATUS_CODE.EMAIL_USED, result: email });
    }

    let result = await this.insertFy({ email, name, visions });
    
    if (result.affectedRows) {
      return res.send({ status: STATUS_CODE.SUCCESS });
    }
  } catch (error) {
    return res.send({ status: STATUS_CODE.ERROR, result: error });
  }

  return res.send({ status: STATUS_CODE.ERROR });
};

//edit one Fy
exports.updateFy = async (req, res) => {
  const { old_email, email, name, visions } = req.body;

  try{
    let result = await this.editFy({ old_email, email, name, visions });
    return res.send({ status: STATUS_CODE.SUCCESS });
  } catch (error){
    return res.send({ status: STATUS_CODE.ERROR, result: error });
  }

};

//delete one Fy
exports.deleteFy = async (req, res) => {
  try{
    const email = req.body.email;
   
    let verify = await this.verifyFy( email );

    if (verify.NUM == 0) {
      return res.send({ status: STATUS_CODE.INCORRECT_STUDENT_EMAIL, result: email });
    }

    let result = await this.removeFy( email );

    if (result.affectedRows){
      return res.send({ status: STATUS_CODE.SUCCESS });
    }
  } catch (error) {
    return res.send({ status: STATUS_CODE.ERROR, result: error });
  }
  return res.send({ status: STATUS_CODE.SUCCESS});
};

//get all first year students, return a json object
exports.readFy = async (req, res) => {
  const name_sort = (!req.query.name_sort) ? '' : ' students.name ' + req.query.name_sort;
  const email_sort = (!req.query.email_sort) ? '' : ' students.email ' + req.query.email_sort;
  const visions_sort = (!req.query.visions_sort) ? '' : ' students.visions ' + req.query.visions_sort;
  const condition_order = (!req.query.condition_order) ? null : JSON.parse(req.query.condition_order);
  
  // pass in array for all search/filtering options
  // if passed in not an array, ERROR will occur (TODO: need to catch the error)
  const name_search = (!req.query.name_search) ? '' : JSON.parse(req.query.name_search);
  const email_search = (!req.query.email_search) ? '' : JSON.parse(req.query.email_search);
  const visions_filter = (!req.query.visions_filter) ? '' : JSON.parse(req.query.visions_filter);
  const vuceptor_search = (!req.query.vuceptor_search) ? '' : JSON.parse(req.query.vuceptor_search);
  const vuceptor_filter = (!req.query.vuceptor_filter) ? '' : JSON.parse(req.query.vuceptor_filter);
  const row_start = (!req.query.row_start) ? 0 : req.query.row_start;
  const row_num = (!req.query.row_num) ? 50 : req.query.row_num;

  // check parameters: sort
  const sort_list = [req.query.name_sort, req.query.email_sort, req.query.visions_sort];
  for (var i = 0; i < sort_list.length; ++i){
    if (sort_list[i] && (sort_list[i] !== SORT_ORDER.ASC) && (sort_list[i] !== SORT_ORDER.DESC)){
      console.log("SORT ERROR\n");
      return res.send({ status: STATUS_CODE.UNKNOWN_SORT });
    }
  }

  // create where string
  var where = '';
  const where_list = [name_search, email_search, visions_filter, vuceptor_search, vuceptor_filter];
  const prefix_list = ['students.name = ', 'students.email = ', 'students.visions = ', 'users.name = ', 'users.name = '];
  for (let m = 0; m < where_list.length; m++){
    cond = where_list[m];
    prefix = prefix_list[m];

    if(cond !== ''){
      let tmp = '';

      if (where !== ''){
        // initialize
        if (m == (where_list.length - 1)){ // visions_filter
          tmp = prefix + cond[0];
        } else{
          tmp = prefix + '\'' + cond[0] + '\'';
        }

        if (m == (where_list.length - 1)){ // visions_filter
          for(let k = 1; k < cond.length; k++){
            tmp = tmp + ' OR ' + prefix + cond[k];
          }
        } else {
          for(let k = 1; k < cond.length; k++){
            tmp = tmp + ' OR ' + prefix + '\'' + cond[k] + '\'';
          }
        }

        where = where + ' AND (' + tmp + ')';
      } else {
        let tmp = '';

        // initialize
        if (m == (where_list.length - 1)){ // visions_filter
          tmp = prefix + cond[0];
        } else{
          tmp = prefix + '\'' + cond[0] + '\'';
        }

        if (m == (where_list.length - 1)){ // visions_filter
          for(let k = 1; k < cond.length; k++){
            tmp = tmp + ' OR ' + prefix + cond[k];
          }
        } else{
          for(let k = 1; k < cond.length; k++){
            tmp = tmp + ' OR ' + prefix + '\'' + cond[k] + '\'';
          }
        }

        where = ' WHERE (' + tmp + ')';
      }
    }
  }

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

  // create ORDER BY string
  orderby_list.forEach(order => {
    if(order !== ''){
      if (orderby !== ''){
        orderby = orderby + ' ,' + order;
      } else {
        orderby = ' ORDER BY' + order;
      }
    }
  })


  const query = 'SELECT students.name AS fy_name, students.email AS fy_email, students.visions, users.name AS vuceptor_name FROM students '
   + ' LEFT JOIN users ON users.visions = students.visions' 
   +  where + orderby
   + ' LIMIT ' + row_num + ' OFFSET ' + row_start;

  const viewFy = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  //calculate the number of pages
  const queryCount = "SELECT COUNT(*) AS count FROM students"
   + ' LEFT JOIN users ON users.visions = students.visions' 
   +  where + orderby
   + ' LIMIT ' + row_num + ' OFFSET ' + row_start;

  var pages = 0;
  await connection.promise().query(queryCount)
  .then(data => {
    pages = Math.ceil(data[0][0].count/row_num);
  })
  .catch(error => {
    console.log(error);
  });

  try {
    var rows = await viewFy;
    return res.send({ status: STATUS_CODE.SUCCESS, result: {rows, pages}});
  } catch (error) {
    return res.send({ status: STATUS_CODE.ERROR, result: error });
  }
};