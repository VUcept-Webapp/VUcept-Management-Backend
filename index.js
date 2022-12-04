const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

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
const VUAttendanceRoute = require('./routes/VUAttendance');
app.use('/', VUAttendanceRoute);
const fyRoute = require('./routes/fy');
app.use('/', fyRoute);
const fyAttendanceRoute = require('./routes/fyAttendance');
app.use('/', fyAttendanceRoute);
const logAttendanceRoute = require('./routes/logAttendance');
app.use('/', logAttendanceRoute);
const VUEventRoute = require('./routes/VUEvent');
app.use('/', VUEventRoute);
const fyEventRoute = require('./routes/fyEvent');
app.use('/', fyEventRoute);

//comment out port for tests so that they can choose free ports to run on;
//in production, it should be 8080
app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;