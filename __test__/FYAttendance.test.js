const { STATUS_CODE } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");
const jwt = require('jsonwebtoken');

describe('Testing for Fy Attendance screen', () => {
    var eventId;
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
    test('responds to /resetFy', async () => {
        const res = await request(app).post('/resetFy').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });
    
     //set up for the auth testing: clear db 
    test('responds to /resetfyEvent', async () => {
        const res = await request(app).post('/resetfyEvent').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //set up for the auth testing: creating a user
    test('creating a first year', async () => {
        const body = {
            "name": 'fy1',
            "email": 'fy1@vanderbilt.edu',
            "visions": 1
        };
        const res = await request(app).post('/createFy').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //set up for the auth testing: creating an event
    test('creating a first year event', async () => {
        const body = {
            "title" : "fy event 1", 
            "date" : "2022-12-5", 
            "description" : "test event", 
            "is_common" : 0, 
            "start_time" : "17:00:00", 
            "end_time" : "18:00:00", 
            "location" : "commons", 
            "visions" : 1, 
            "day" : "Friday"
        };
        const res = await request(app).post('/createfyEvent').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //set up for the auth testing: remembering the event id
    test('remembering the event id', async () => {
        const queryParam = {
            "time_range": "[\"2011-10-10\", \"2022-12-31\"]",
            "visions": 1
        };
        const res = await request(app).get('/readfyEvent').query(queryParam).set("Authorization", "Bearer " + adviserAccessToken);
        eventId = res.body.result[0].event_id;
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerFyAttendance.post('/editFyAttendance', FyAttendanceController.editFyAttendance);
    test('responds to /editFyAttendance', async () => {
        console.log(eventId)
        const body =  {
            "email": "Fy1@vanderbilt.edu",
            "eventId" : eventId,
            "attendance" : "Present"
        };
        const res = await request(app).post('/editFyAttendance').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerFyAttendance.post('/deleteFyAttendance', FyAttendanceController.deleteFyAttendance);
    test('responds to /deleteFyAttendance', async () => {
        const body = {
            "email": "Fy1@vanderbilt.edu",
            "eventId" : eventId,
        };
        const res = await request(app).post('/deleteFyAttendance').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerFyAttendance.post('/insertFyAttendance', FyAttendanceController.insertFyAttendance);
    test('responds to /insertFyAttendance', async () => {
        const body =  {
            "email": "Fy1@vanderbilt.edu",
            "eventId" : eventId,
            "attendance" : "Present"
        };
        const res = await request(app).post('/insertFyAttendance').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //routerFyAttendance.get('/readFyAttendance', FyAttendanceController.readFyAttendance);
    test('responds to /readFyAttendance', async () => {
        const res = await request(app).get('/readFyAttendance').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //cleaning up after testing
    test('responds to /resetFy', async () => {
        const res = await request(app).post('/resetFy').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //cleaning up after testing
    test('responds to /resetfyEvent', async () => {
        const res = await request(app).post('/resetfyEvent').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });
});