const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require('node-cron');
const attendanceManager = require('./lib/attendanceHelpers');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// enable sharing of API calls
app.use(cors());

// enable parsing for POST methods
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('GET request to homepage')
})
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

//send weekly reports 
attendanceManager.scheduleWeeklyReports();

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;