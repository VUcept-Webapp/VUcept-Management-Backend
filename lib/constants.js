const nodemailer = require("nodemailer");

const STATUS_CODE = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    EMAIL_USED: 'EMAIL_USED',
    INCORRECT_USER_NAME: 'INCORRECT_USER_NAME',
    INCORRECT_USER_EMAIL: 'INCORRECT_USER_EMAIL',
    INCORRECT_USER_VISIONS: 'INCORRECT_USER_VISIONS',
    INCORRECT_STATUS: 'INCORRECT_STATUS',
    INCORRECT_TYPE: 'INCORRECT_TYPE',
    ROW_OUT_OF_BOUNDS: 'ROW_OUT_OF_BOUNDS', // need this?
    INCORRECT_FY_NAME: 'INCORRECT_FY_NAME',
    INCORRECT_FY_EMAIL: 'INCORRECT_FY_EMAIL',
    INCORRECT_FY_VISIONS: 'INCORRECT_FY_VISIONS',
    UNKNOWN_SORT: 'UNKNOWN_SORT',
    USER_EXIST : 'USER_EXIST',
    //login and sign up 
    INVALID_EMAIL : 'INVALID_EMAIL',
    REQUEST_SIGN_UP : 'REQUEST_SIGN_UP',
    INVALID_PASSWORD : 'INVALID_PASSWORD',
    //vuceptor attendance
    INVALID_VU_EVENT: 'INVALID_VU_EVENT',
    INVALID_USER: 'INVALID_USER',
    REPEATED_RECORDS: 'REPEATED_RECORDS',
    NO_EXISTING_RECORDS: 'REPEATED_RECORDS',
    //export 
    EMPTY_DATA: 'EMPTY_DATA'
}

const SORT_ORDER = {
    ASC: 'ASC',
    DESC: 'DESC'
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

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_PASSWORD
    }
  });

module.exports = {
    transport,
    STATUS_CODE,
    SORT_ORDER,
    TYPE,
    REGISTRATION_STATUS
}