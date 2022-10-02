const { query } = require('./model');
const connection = require('./model')


exports.insertUser = ({ email, name, type, visions }) => {
    const query = `INSERT INTO users 
    (email, name, type, status, visions)
    VALUES (?,?,?,'unregistered',?)`;
    return new Promise((resolve, reject) => {
        connection.query(query, [email, name, type, visions], (err, res) => {
            if(err) reject(err);
            else resolve(res[0]);
        })
    })
}


//get all users, return a json object
exports.viewallusers = async (req, res) => {
    let message = "view user failed";
    const query = 'SELECT * FROM users';
    connection.promise().query(query)
      .then(data => {
        message = "view user success";
        res.send({ status: SUCCESS })
      })
      .catch(error => res.send({status: SUCCESS, error: error }));
  };


//add one user
exports.adduser = async (req, res) => {
    const { email, name, type, visions } = req.body;
    let message = 'Error in creating user';
    const query = `INSERT INTO users 
    (email, name, type, status, visions)
    VALUES (?,?,?,'unregistered',?)`;
  
    connection.promise().query(query, [email, name, type, visions])
      .then(data => {
        if (data[0].affectedRows) {
          message = 'user created successfully';
          res.send({ message: message, data: data[0] });
        }
      })
      .catch(error => {
        res.send({ message: message, error: error });
      });
  };

  //delete one user
exports.deleteuser = async (req, res) => {
    const { email } = req.body.email;
    let message = 'Error in deleting user';
    const query = `DELETE FROM users 
    WHERE email = ?;`;
  
    connection.promise().query(query, email)
      .then(data => {
        if (data[0].affectedRows) {
          message = 'user deleted successfully';
          res.send({ message: message, data: data[0] });
        }
      })
      .catch(error => {
        res.send({ message: message, error: error });
      });
  
    return res;
  };

  //edit one user
exports.edituser = async (req, res) => {
    const { email, name, type, visions } = req.body;
    let message = 'Error in editing user';
    const query = `UPDATE users 
    SET name = ?, type = ?, visions = ?
    WHERE email = ?`;
  
    connection.promise().query(query, [name, type, visions, email])
      .then(data => {
        if (data[0].affectedRows) {
          message = 'user edited successfully';
          console.log(message);
          res.send({ message: message, data: data[0] });
        }
      })
      .catch(error => {
        res.send({ message: message, error: error });
      });
  };