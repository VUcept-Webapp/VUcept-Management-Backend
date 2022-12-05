const express = require('express');
const routerFy = express.Router();
const authController = require('../controllers/authController');
const fyController = require('../controllers/fyController');

// Routes
routerFy.post('/resetFy',  authController.authenticateToken, fyController.resetFy);
routerFy.post('/fyLoadfromcsv',  authController.authenticateToken, fyController.fyLoadfromcsv);
routerFy.post('/createFy',  authController.authenticateToken, fyController.createFy);
routerFy.post('/updateFy',  authController.authenticateToken, fyController.updateFy);
routerFy.post('/deleteFy',  authController.authenticateToken, fyController.deleteFy);
routerFy.get('/readFy',  authController.authenticateToken, fyController.readFy);
routerFy.get('/fyVisionsNums',  authController.authenticateToken, fyController.fyVisionsNums);
routerFy.get('/vuceptorList',  authController.authenticateToken, fyController.vuceptorList);

module.exports = routerFy;