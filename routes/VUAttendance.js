const express = require('express');
const routerVUAttendance = express.Router();
const VUAttendanceController = require('../controllers/VUAttendanceController');

// Routes
routerVUAttendance.get('/readVUAttendance', VUAttendanceController.readVUAttendance);
routerVUAttendance.post('/insertVUAttendance', VUAttendanceController.insertVUAttendance);
routerVUAttendance.post('/editVUAttendance', VUAttendanceController.editVUAttendance);

module.exports = routerVUAttendance;