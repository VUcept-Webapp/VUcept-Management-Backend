const express = require('express');
const routerLogAttendance = express.Router();
const authController = require('../controllers/authController');
const LogAttendanceController = require('../controllers/logAttendanceController');

// Routes
routerLogAttendance.get('/getLogVisionsEvents',  authController.authenticateToken, LogAttendanceController.getLogVisionsEvents);
routerLogAttendance.get('/readLogAttendance', authController.authenticateToken, LogAttendanceController.readLogAttendance);
routerLogAttendance.post('/submitAttendance', authController.authenticateToken, LogAttendanceController.submit);

module.exports = routerLogAttendance;