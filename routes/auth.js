const express = require('express');
const routerAuth = express.Router();
const authController = require('../controllers/authController');

// Routes
routerAuth.post('/sendVerificationEmail', authController.sendVerificationEmail);
routerAuth.post('/login', authController.login);
routerAuth.post('/signUp', authController.signUp);
routerAuth.post('/signOut', authController.signOut);
routerAuth.post('/changePassword', authController.changePassword);

module.exports = routerAuth;