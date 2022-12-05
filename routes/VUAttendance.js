const express = require('express');
const routerVUAttendance = express.Router();
const authController = require('../controllers/authController');
const VUAttendanceController = require('../controllers/VUAttendanceController');

// Routes
routerVUAttendance.get('/readVUAttendance', authController.authenticateToken, VUAttendanceController.readVUAttendance);
routerVUAttendance.get('/getVUAttendanceVisionsList', authController.authenticateToken, VUAttendanceController.getVUAttendanceVisionsList);
routerVUAttendance.get('/getVUAttendanceEventsList', authController.authenticateToken, VUAttendanceController.getVUAttendanceEventsList);
routerVUAttendance.get('/exportVUAttendance', authController.authenticateToken, VUAttendanceController.exportVUAttendance);
routerVUAttendance.post('/insertVUAttendance', authController.authenticateToken, VUAttendanceController.insertVUAttendance);
routerVUAttendance.post('/editVUAttendance', authController.authenticateToken, VUAttendanceController.editVUAttendance);
routerVUAttendance.post('/deleteVUAttendance', authController.authenticateToken, VUAttendanceController.deleteVUAttendance);

module.exports = routerVUAttendance;