const express = require('express');
const routerVUEvent = express.Router();
const VUEventController = require('../controllers/VUEventController');

routerVUEvent.get('/readVUEvent', VUEventController.readVUEvent);
routerVUEvent.post('/createVUEvent', VUEventController.createVUEvent);
routerVUEvent.post('/updateVUEvent', VUEventController.updateVUEvent);
routerVUEvent.post('/deleteVUEvent', VUEventController.deleteVUEvent);

module.exports = routerVUEvent;