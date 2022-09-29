const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require("../middleware/upload");

// Routes
router.get('/viewallusers', userController.viewallusers);
router.get('/viewallstudents', userController.viewallstudents);

router.post('/loadfromcsv', upload.single('file'), userController.loadfromcsv);
router.post('/adduser', userController.adduser);
router.post('/deleteuser', userController.deleteuser);
router.post('/edituser', userController.edituser);

module.exports = router;