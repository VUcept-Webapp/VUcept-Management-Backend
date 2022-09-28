const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
router.get('/viewallusers', userController.viewallusers);
// router.post('/adduser', userController.create);
// router.post('/edituser/:id', userController.update);
// router.get('/viewuser/:id', userController.viewbyid);

module.exports = router;