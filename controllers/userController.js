const { STATUS_CODE, SORT_ORDER, TYPE } = require('../lib/constants');
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
  const query = 'INSERT INTO users (email, name, type, status, visions) VALUES (?,?,?,\'unregistered\',?)';

  return new Promise((resolve, reject) => {
    connection.query(query, [email, name, type, visions], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  })
}
// Shared function: verifyUser
exports.verifyUser = ( email ) => {
  const queryCheck = 'SELECT COUNT(email) AS NUM FROM users WHERE email = ?';

  return new Promise ((resolve, reject) => {
    connection.query(queryCheck, email, (err, res) => {
      if (err) reject(err);
      else resolve(res[0]);
    })
  });
}
// Shared function: removeUser
exports.removeUser = ( email ) => {
  const query = `DELETE FROM users WHERE email = ?`;

  return new Promise((resolve, reject) => {
    connection.query(query, email, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });
}
// Shared function: editUser
exports.editUser = ({ old_email, email, name, type, visions }) => {
  const query = `UPDATE users SET email = ?, name = ?, type = ?, visions = ? WHERE email = ?;`;
  // console.log({ email, name, type, visions, old_email,  });

  return new Promise((resolve, reject) => {
    connection.query(query, [email, name, type, visions, old_email], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  })
}


//reset the user table
exports.resetUsers = async (req, res) => {
  const query = 'DELETE FROM users;';

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

// return the max Visions group number
exports.visionsNums = async (req, res) => {
  const query = 'SELECT DISTINCT visions FROM mydb.users ORDER BY visions DESC';

  const returnMaxVisions = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  try {
    let maxVisions = await returnMaxVisions;
    return res.send({ status: STATUS_CODE.SUCCESS, result: { max: maxVisions[0].visions, list: maxVisions }});
  } catch (error){
    return res.send({ status: STATUS_CODE.ERROR, result: error });
  }

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
  const email_sort = (!req.query.email_sort) ? '' : ' email ' + req.query.email_sort;
  const visions_sort = (!req.query.visions_sort) ? '' : ' visions ' + req.query.visions_sort;
  const condition_order = (!req.query.condition_order) ? null : JSON.parse(req.query.condition_order);
  
  // pass in array for all search/filtering options
  const name_search = (!req.query.name_search) ? '' : JSON.parse(req.query.name_search);
  const email_search = (!req.query.email_search) ? '' : JSON.parse(req.query.email_search);
  const visions_filter = (!req.query.visions_filter) ? '' : JSON.parse(req.query.visions_filter);
  const status_filter = (!req.query.status_filter) ? '' : JSON.parse(req.query.status_filter);
  const type_filter = (!req.query.type_filter) ? '' : JSON.parse(req.query.type_filter);
  
  const row_start = (!req.query.row_start) ? 0 : req.query.row_start;
  const row_num = (!req.query.row_num) ? 50 : req.query.row_num;

  // check parameters: sort
  const sort_list = [req.query.name_sort, req.query.email_sort, req.query.visions_sort];
  for (var i = 0; i < sort_list.length; ++i){
    if (sort_list[i] && (sort_list[i] !== SORT_ORDER.ASC) && (sort_list[i] !== SORT_ORDER.DESC)){
      console.log("SORT ERROR\n");
      return res.send({ status: STATUS_CODE.UNKNOWN_SORT});
    }
  }

  // create where string
  var where = '';
  const where_list = [name_search, email_search, status_filter, type_filter, visions_filter];
  const prefix_list = ['name = ', 'email = ', 'status = ', 'type = ', 'visions = '];
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
      var cond = condition_order[i];
  
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
    return res.send({ status: STATUS_CODE.SUCCESS, result: {rows, pages}});
  } catch (error) {
    return res.send({ status: STATUS_CODE.ERROR, result: error });
  }
};

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
  return res.send({ status: STATUS_CODE.SUCCESS});
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
