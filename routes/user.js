const express = require('express');
const routerUser = express.Router();
const userController = require('../controllers/userController');

// Routes
routerUser.post('/resetUsers', userController.resetUsers);
routerUser.post('/userLoadfromcsv', userController.userLoadfromcsv);
routerUser.post('/createUser', userController.createUser);
routerUser.post('/updateUser', userController.updateUser);
routerUser.post('/deleteUser', userController.deleteUser);
routerUser.get('/readUser', userController.readUser);
routerUser.get('/visionsNums', userController.visionsNums);

routerUser.get('/readUser', userController.readUser);

module.exports = routerUser;