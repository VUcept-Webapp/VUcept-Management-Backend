const express = require('express');
const routerFy = express.Router();
const fyController = require('../controllers/fyController');

// Routes
routerFy.post('/resetFy', fyController.resetFy);
routerFy.post('/fyLoadfromcsv', fyController.fyLoadfromcsv);
routerFy.post('/createFy', fyController.createFy);
routerFy.post('/updateFy', fyController.updateFy);
routerFy.post('/deleteFy', fyController.deleteFy);

routerFy.get('/readFy', fyController.readFy);
routerFy.get('/fyVisionsNums', fyController.fyVisionsNums);
routerFy.get('/vuceptorList', fyController.vuceptorList);

module.exports = routerFy;