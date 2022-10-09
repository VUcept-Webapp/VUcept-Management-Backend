const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

global.__basedir = __dirname + "/..";

// enable sharing of API calls
app.use(cors());

// enable parsing for POST methods
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routes for the APIs
const userRoute = require('./routes/user');
app.use('/', userRoute);
const authRoute = require('./routes/auth');
app.use('/', authRoute);

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;