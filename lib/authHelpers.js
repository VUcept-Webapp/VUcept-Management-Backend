require('dotenv').config();
const {STATUS_CODE} = require('./constants');
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) =>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.send({status: STATUS_CODE.NO_TOKEN});

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.send({status: STATUS_CODE.NOT_VALID_TOKEN});
    })
    
}