const express = require('express');
const routerFy = express.Router();
const fyController = require('../controllers/fyController');

// Routes
routerFy.post('/fyLoadfromcsv', fyController.fyLoadfromcsv);
routerFy.post('/createFirstyear', fyController.createFirstyear);
routerFy.get('/readFirstyear', fyController.readFirstyear);
routerFy.post('/updateFirstyear', fyController.updateFirstyear);
routerFy.post('/deleteFirstyear', fyController.deleteFirstyear);

module.exports = routerFy;