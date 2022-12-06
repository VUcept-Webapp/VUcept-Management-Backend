const express = require('express');
const routerVUEvent = express.Router();
const authController = require('../controllers/authController');
const VUEventController = require('../controllers/VUEventController');

routerVUEvent.get('/readVUEvent',  authController.authenticateToken, VUEventController.readVUEvent);
routerVUEvent.post('/createVUEvent',  authController.authenticateToken, VUEventController.createVUEvent);
routerVUEvent.post('/updateVUEvent',  authController.authenticateToken, VUEventController.updateVUEvent);
routerVUEvent.post('/deleteVUEvent',  authController.authenticateToken, VUEventController.deleteVUEvent);
routerVUEvent.post('/resetVUEvent',  authController.authenticateToken, VUEventController.resetVUEvent);
routerVUEvent.post('/VUEventLoadfromcsv', authController.authenticateToken, VUEventController.VUEventLoadfromcsv);

module.exports = routerVUEvent;