const { STATUS_CODE } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");
const jwt = require('jsonwebtoken');

describe('Testing for log Attendance screen', () => {
    var eventId;
    const generateAccessToken = (user) => {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: '30m'
        });
    }
    const vuceptorAccessToken = generateAccessToken({
        name: "user",  
        email: "user@vanderblit.edu",  
        visions: 0, 
        type: "vuceptor"
    });

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

    //set up for the auth testing: creating a student 
    test('creating a first year', async () => {
        const body = {
            "name": 'fy',
            "email": 'fy@vanderbilt.edu',
            "visions": 1
        };
        const res = await request(app).post('/createFy').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //set up for the auth testing: creating an event
    test('creating a first year event', async () => {
        const body = {
            "title" : "fy event", 
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

    //routerLogAttendance.get('/readLogAttendance', LogAttendanceController.readLogAttendance);
    test('responds to /readLogAttendance: visions and event_id', async () => {
        const queryParam = {
            "visions": 1,
            "event_id" : eventId,
        };
        const res = await request(app).get('/readLogAttendance').query(queryParam).set("Authorization", "Bearer " + vuceptorAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /readLogAttendance: email_search', async () => {
        const queryParam = {
            "visions": 1,
            "event_id": eventId,
            "email_search": "[\"fy@vanderbilt.edu\"]"
        };
        const res = await request(app).get('/readLogAttendance').query(queryParam).set("Authorization", "Bearer " + vuceptorAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //routerLogAttendance.get('/getLogVisionsEvents', LogAttendanceController.getLogVisionsEvents);
    test('responds to /getLogVisionsEvents', async () => {
        const res = await request(app).get('/getLogVisionsEvents').set("Authorization", "Bearer " + vuceptorAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //routerLogAttendance.post('/submitAttendance', LogAttendanceController.submit);
    test('responds to /submitAttendance', async () => {
        const body =  {
            "edits" : [
            {"email": "fy@vanderbilt.edu", "eventId": eventId, "attendance": "Present"}
            ]
        };
        const res = await request(app).post('/submitAttendance').set("Authorization", "Bearer " + vuceptorAccessToken).send(body);
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