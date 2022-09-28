const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
router.get('/viewallusers', userController.viewallusers);
router.post('/adduser', userController.adduser);

module.exports = router;