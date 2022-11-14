const express = require('express');
const routerVUEvent = express.Router();
const VUEventController = require('../controllers/VUEventController');

routerVUEvent.get('/readVUEvent', VUEventController.readVUEvent);
routerVUEvent.get('/readVUEventDashboard', VUEventController.readVUEvent);
routerVUEvent.post('/createVUEvent', VUEventController.createVUEvent);
routerVUEvent.post('/updateVUEvent', VUEventController.updateVUEvent);
routerVUEvent.post('/deleteVUEvent', VUEventController.deleteVUEvent);
routerVUEvent.post('/resetVUEvent', VUEventController.resetVUEvent);
routerVUEvent.post('/VUEventLoadfromcsv', VUEventController.VUEventLoadfromcsv);

module.exports = routerVUEvent;