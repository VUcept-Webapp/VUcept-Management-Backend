const express = require('express');
const routerfyEvent = express.Router();
const authController = require('../controllers/authController');
const fyEventController = require('../controllers/fyEventController');

// Routes
routerfyEvent.get('/readfyEvent',  authController.authenticateToken, fyEventController.readfyEvent);
routerfyEvent.post('/createfyEvent',  authController.authenticateToken, fyEventController.createfyEvent);
routerfyEvent.post('/updatefyEvent',  authController.authenticateToken, fyEventController.updatefyEvent);
routerfyEvent.post('/deletefyEvent',  authController.authenticateToken, fyEventController.deletefyEvent);
routerfyEvent.post('/resetfyEvent',  authController.authenticateToken, fyEventController.resetfyEvent);
routerfyEvent.post('/fyVisionsEventLoadfromcsv',  authController.authenticateToken, fyEventController.fyVisionsEventLoadfromcsv);
routerfyEvent.post('/fyVisionsInfoLoadfromcsv',  authController.authenticateToken, fyEventController.fyVisionsInfoLoadfromcsv);
routerfyEvent.get('/visionsEntered',  authController.authenticateToken, fyEventController.visionsEntered);

module.exports = routerfyEvent;