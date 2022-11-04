const express = require('express');
const routerLogAttendance = express.Router();
const LogAttendanceController = require('../controllers/logAttendanceController');

// Routes
routerLogAttendance.get('/readLogAttendance', LogAttendanceController.readLogAttendance);

module.exports = routerLogAttendance;