const express = require('express');
const routerUser = express.Router();
const userController = require('../controllers/userController');

// Routes
<<<<<<< HEAD
routerUser.post('/sendVerificationEmail', userController.sendVerificationEmail);
routerUser.get('/login', userController.login);
routerUser.post('/signUp', userController.signUp);
=======
routerUser.post('/resetDatabase', userController.resetDatabase);

>>>>>>> 87cdc588164a6f4e6a2fd0888bc5050f946c3213
routerUser.post('/userLoadfromcsv', userController.loadfruserLoadfromcsvomcsv);
routerUser.post('/createUser', userController.createUser);
routerUser.get('/readUser', userController.readUser);
routerUser.post('/updateUser', userController.updateUser);
routerUser.post('/deleteUser', userController.deleteUser);

module.exports = routerUser;