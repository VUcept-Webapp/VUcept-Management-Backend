const express = require('express');
const routerUser = express.Router();
const userController = require('../controllers/userController');

// Routes

routerUser.post('/resetDatabase', userController.resetDatabase);
routerUser.post('/userLoadfromcsv', userController.loadfruserLoadfromcsvomcsv);
routerUser.post('/createUser', userController.createUser);
routerUser.get('/readUser', userController.readUser);
routerUser.post('/updateUser', userController.updateUser);
routerUser.post('/deleteUser', userController.deleteUser);

module.exports = routerUser;