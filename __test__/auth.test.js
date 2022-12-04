const { STATUS_CODE } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");

describe('Testing for user authenticatioin module', () => {

    // routerAuth.post('/sendVerificationEmail', authController.sendVerificationEmail);
    test('responds to /sendVerificationEmail', async () => {
        const body =  {
                "email" :"vu1@gmail.com"            
        };
        const res = await request(app).post('/sendVerificationEmail').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerAuth.post('/signUp', authController.signUp);
    test('responds to /signUp', async () => {
        const body =  {
            "password" : "123456789",
            "email" : "vu1@vanderbilt.edu"
        };
        const res = await request(app).post('/signUp').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.USER_EXIST);
    });

    // routerAuth.post('/changePassword', authController.changePassword);
    test('responds to /changePassword', async () => {
        const body =  {
            "password" : "123456789",
            "email" : "vu1@vanderbilt.edu"
        };
        const res = await request(app).post('/changePassword').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerAuth.post('/login', authController.login);
    test('responds to /login', async () => {
        const body =  {
            "email" : "vu1@vanderbilt.edu",
            "password" : "123456789"
        };
        const res = await request(app).post('/login').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });
});