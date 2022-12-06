const express = require('express');
const routerUser = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// Routes
routerUser.post('/resetUsers', authController.authenticateToken,  userController.resetUsers);
routerUser.post('/userLoadfromcsv',  authController.authenticateToken, userController.userLoadfromcsv);
routerUser.post('/createUser',  authController.authenticateToken, userController.createUser);
routerUser.post('/updateUser', authController.authenticateToken,  userController.updateUser);
routerUser.post('/deleteUser',  authController.authenticateToken, userController.deleteUser);
routerUser.get('/readUser', authController.authenticateToken,  userController.readUser);
routerUser.get('/visionsNums',  authController.authenticateToken, userController.visionsNums);

routerUser.get('/readUser', userController.readUser);

module.exports = routerUser;