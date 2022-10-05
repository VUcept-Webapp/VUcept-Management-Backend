const nodemailer = require("nodemailer");

const STATUS_CODE = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR'
}

const SORT_ORDER = {
    ASCENDING : 1,
    DESCENDING: 2,
    NO_SORT : 3
}

const TYPE = {
    VUCEPTOR: 'vuceptor',
    ADVISER : 'adviser',
    BOARD: 'board'
}

const REGISTRATION_STATUS = {
    REGISTERED: 'registered',
    UNREGISTERED : 'unregistered'
}

const LOG_IN_STATUS = {
    SUCCESS : "SUCESSS",
    REQUEST_SIGN_UP : 'REQUEST_SIGN_UP',
    INVALID_PASSWORD : 'INVALID_PASSWORD',
    INVALID_EMAIL : 'INVALID_EMAIL',
    INVALID_CODE : 'INVALID_CODE'
}

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_PASSWORD
    }
  });


module.exports = {
    STATUS_CODE, LOG_IN_STATUS, transport
}