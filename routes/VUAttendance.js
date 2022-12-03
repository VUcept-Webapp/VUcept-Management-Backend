const express = require('express');
const authController = require('../controllers/authController');
const routerVUAttendance = express.Router();
const VUAttendanceController = require('../controllers/VUAttendanceController');

// Routes
// routerVUAttendance.get('/readVUAttendance', authController.authenticateToken, VUAttendanceController.readVUAttendance);
routerVUAttendance.get('/readVUAttendance', VUAttendanceController.readVUAttendance);
routerVUAttendance.get('/getVUAttendanceVisionsList', VUAttendanceController.getVUAttendanceVisionsList);
routerVUAttendance.get('/getVUAttendanceEventsList', VUAttendanceController.getVUAttendanceEventsList);
routerVUAttendance.get('/exportVUAttendance', VUAttendanceController.exportVUAttendance);
routerVUAttendance.post('/insertVUAttendance', VUAttendanceController.insertVUAttendance);
routerVUAttendance.post('/editVUAttendance', VUAttendanceController.editVUAttendance);
routerVUAttendance.post('/deleteVUAttendance', VUAttendanceController.deleteVUAttendance);

module.exports = routerVUAttendance;