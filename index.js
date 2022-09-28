require('dotenv').config();

const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require('mysql2');


// Connection Pool
const connection = mysql.createConnection({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: "mydb",
    port: process.env.RDS_PORT
});

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// const routes = require('./routes/user.js');
// app.use('/viewallusers', routes);

//get all users, return a json object
app.get("/view-user", async (req, res) => {
  const query = 'SELECT * FROM users';
  connection.promise().query(query)
    .then(data => res.status(200).send(data[0]))
    .catch(error => res.status(400).send(error));
});

app.post("/post-user", async (req, res) =>{
  const { email, name, type, status, group, password } = req.body;
  let message = 'Error in creating user';

  const query = `INSERT INTO users
  VALUES (?,?,?,?,?,?)`;

  connection.promise().query(query, [email, name, type, status, group, password])
  .then(data => {
    if (data[0].affectedRows) {
      message = 'user created successfully';
      res.status(200).send({message: message, data: data[0]});
    }
  })
  .catch(error => {
    res.status(400).send({message: message, error: error});
  });
});
  

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;