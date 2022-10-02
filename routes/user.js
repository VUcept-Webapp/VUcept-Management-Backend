const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
// router.get('/viewallusers', userController.viewallusers);
// router.get('/viewallstudents', userController.viewallstudents);
// router.post('/loadfromcsv', upload.single('file'), userController.loadfromcsv);
router.post('/adduser', userController.addUser);
// router.post('/deleteuser', userController.deleteuser);
// router.post('/edituser', userController.edituser);

module.exports = router;