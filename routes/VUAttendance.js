const express = require('express');
const routerVUAttendance = express.Router();
const VUAttendanceController = require('../controllers/VUAttendanceController');

// Routes
routerVUAttendance.get('/readVUAttendance', VUAttendanceController.readVUAttendance);
routerVUAttendance.get('/getVisionsList', VUAttendanceController.getVisionsList);
routerVUAttendance.get('/getEventsList', VUAttendanceController.getEventsList);
routerVUAttendance.get('/exportVUAttendance', VUAttendanceController.exportVUAttendance);
routerVUAttendance.post('/insertVUAttendance', VUAttendanceController.insertVUAttendance);
routerVUAttendance.post('/editVUAttendance', VUAttendanceController.editVUAttendance);
routerVUAttendance.post('/deleteVUAttendance', VUAttendanceController.deleteVUAttendance);

module.exports = routerVUAttendance;