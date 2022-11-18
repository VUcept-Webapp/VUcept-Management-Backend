const express = require('express');
const routerfyEvent = express.Router();
const fyEventController = require('../controllers/fyEventController');

// Routes
routerfyEvent.get('/readfyEvent', fyEventController.readfyEvent);
routerfyEvent.post('/createfyEvent', fyEventController.createfyEvent);
routerfyEvent.post('/updatefyEvent', fyEventController.updatefyEvent);
routerfyEvent.post('/deletefyEvent', fyEventController.deletefyEvent);
routerfyEvent.post('/resetfyEvent', fyEventController.resetfyEvent);
routerfyEvent.post('/fyEventLoadfromcsv', fyEventController.fyEventLoadfromcsv);
routerfyEvent.post('/fyVisionsInfoLoadfromcsv', fyEventController.fyEventLoadfromcsv);

module.exports = routerfyEvent;