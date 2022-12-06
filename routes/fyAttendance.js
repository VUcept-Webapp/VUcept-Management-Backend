const express = require('express');
const routerFyAttendance = express.Router();
const authController = require('../controllers/authController');
const FyAttendanceController = require('../controllers/fyAttendanceController');

// Routes
routerFyAttendance.get('/readFyAttendance', authController.authenticateToken, FyAttendanceController.readFyAttendance);
routerFyAttendance.get('/getFyAttendanceVisionsList', authController.authenticateToken, FyAttendanceController.getFyAttendanceVisionsList);
routerFyAttendance.get('/getFyAttendanceEventsList', authController.authenticateToken, FyAttendanceController.getFyAttendanceEventsList);
routerFyAttendance.get('/exportFyAttendance', authController.authenticateToken, FyAttendanceController.exportFyAttendance);
routerFyAttendance.post('/insertFyAttendance', authController.authenticateToken, FyAttendanceController.insertFyAttendance);
routerFyAttendance.post('/editFyAttendance', authController.authenticateToken, FyAttendanceController.editFyAttendance);
routerFyAttendance.post('/deleteFyAttendance', authController.authenticateToken, FyAttendanceController.deleteFyAttendance);
routerFyAttendance.post('/sendAdviserWeeklyReport', authController.authenticateToken, FyAttendanceController.sendAdviserWeeklyReport);

module.exports = routerFyAttendance;