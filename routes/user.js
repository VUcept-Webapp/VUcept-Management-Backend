const express = require('express');
const routerUser = express.Router();
const userController = require('../controllers/userController');

// Routes
routerUser.post('/sendVerificationEmail', userController.sendVerificationEmail);
routerUser.get('/login', userController.login);
routerUser.post('/signUp', userController.signUp);

routerUser.post('/resetUsers', userController.resetUsers);
routerUser.post('/userLoadfromcsv', userController.loadfruserLoadfromcsvomcsv);
routerUser.post('/createUser', userController.createUser);
routerUser.post('/updateUser', userController.updateUser);
routerUser.post('/deleteUser', userController.deleteUser);

routerUser.get('/readUser', userController.readUser);
routerUser.get('/visionsNums', userController.visionsNums);

module.exports = routerUser;