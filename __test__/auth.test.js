const { STATUS_CODE } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");
const jwt = require('jsonwebtoken');

describe('Testing for user authenticatioin module', () => {

    const generateAccessToken = (user) => {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: '30m'
        });
    }
    const adviserAccessToken = generateAccessToken({
        name: "user",  
        email: "user@vanderblit.edu",  
        visions: 0, 
        type: "adviser"
    });

    //set up for the auth testing: clear db 
    test('responds to /resetUsers', async () => {
        const res = await request(app).post('/resetUsers').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //set up for the auth testing: creating a user
    test('creating a user', async () => {
        const body = {
            "name": 'user',
            "email": 'user@vanderblit.edu',
            "visions": 1,
            "type" : "vuceptor"
        };
        const res = await request(app).post('/createUser').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerAuth.post('/sendVerificationEmail', authController.sendVerificationEmail);
    test('responds to /sendVerificationEmail', async () => {
        const body =  {
                "email" :"user@vanderblit.edu"            
        };
        const res = await request(app).post('/sendVerificationEmail').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerAuth.post('/signUp', authController.signUp);
    test('responds to /signUp', async () => {
        const body =  {
            "password" : "123456789",
            "email" : "user@vanderblit.edu"
        };
        const res = await request(app).post('/signUp').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerAuth.post('/changePassword', authController.changePassword);
    test('responds to /changePassword', async () => {
        const body =  {
            "password" : "123456789",
            "email" : "user@vanderblit.edu"
        };
        const res = await request(app).post('/changePassword').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerAuth.post('/login', authController.login);
    test('responds to /login', async () => {
        const body =  {
            "email" : "user@vanderblit.edu",
            "password" : "123456789"
        };
        const res = await request(app).post('/login').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //cleaning up after testing
    test('responds to /resetUsers', async () => {
        const res = await request(app).post('/resetUsers').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });
});