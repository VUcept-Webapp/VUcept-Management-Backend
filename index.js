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
const calendarEventRoute = require('./routes/calendarEvent');
app.use('/', calendarEventRoute);

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;