const express = require('express');
const routerFyAttendance = express.Router();
const FyAttendanceController = require('../controllers/fyAttendanceController');

// Routes
routerFyAttendance.get('/readFyAttendance', FyAttendanceController.readFyAttendance);
routerFyAttendance.get('/getFyAttendanceVisionsList', FyAttendanceController.getFyAttendanceVisionsList);
routerFyAttendance.get('/getFyAttendanceEventsList', FyAttendanceController.getFyAttendanceEventsList);
routerFyAttendance.get('/exportFyAttendance', FyAttendanceController.exportFyAttendance);
routerFyAttendance.post('/insertFyAttendance', FyAttendanceController.insertFyAttendance);
routerFyAttendance.post('/editFyAttendance', FyAttendanceController.editFyAttendance);
routerFyAttendance.post('/deleteFyAttendance', FyAttendanceController.deleteFyAttendance);
routerFyAttendance.post('/sendWeeklyReport', FyAttendanceController.sendWeeklyReport);

module.exports = routerFyAttendance;