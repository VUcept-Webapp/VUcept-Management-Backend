const express = require('express');
const routerUser = express.Router();
const userController = require('../controllers/userController');

// Routes
<<<<<<< HEAD
routerUser.post('/resetDatabase', userController.resetDatabase);
=======
routerUser.post('/sendVerificationEmail', userController.sendVerificationEmail);
routerUser.get('/login', userController.login);
routerUser.post('/signUp', userController.signUp);

routerUser.post('/resetUsers', userController.resetUsers);
>>>>>>> df8b96386090205217f852f18a57bd1d663e56cb
routerUser.post('/userLoadfromcsv', userController.loadfruserLoadfromcsvomcsv);
routerUser.post('/createUser', userController.createUser);
routerUser.post('/updateUser', userController.updateUser);
routerUser.post('/deleteUser', userController.deleteUser);

routerUser.get('/readUser', userController.readUser);
routerUser.get('/visionsNums', userController.visionsNums);

module.exports = routerUser;