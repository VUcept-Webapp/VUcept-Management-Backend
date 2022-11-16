const express = require('express');
const routerAuth = express.Router();
const authController = require('../controllers/authController');

// Routes
routerAuth.post('/sendVerificationEmail', authController.sendVerificationEmail);
routerAuth.get('/login', authController.login);
routerAuth.post('/signUp', authController.signUp);
routerAuth.post('/changePassword', authController.changePassword);

module.exports = routerAuth;