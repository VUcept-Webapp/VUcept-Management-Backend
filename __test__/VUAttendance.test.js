const { STATUS_CODE } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");
const jwt = require('jsonwebtoken');

describe('Testing for VU Attendance screen', () => {
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
    test('responds to /resetUsers', async () => {
        const res = await request(app).post('/resetUsers').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });
    
    //set up for the auth testing: clear db 
    test('responds to /resetVUEvent', async () => {
        const res = await request(app).post('/resetVUEvent').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //set up for the auth testing: creating a user
    test('creating a VUceptor', async () => {
        const body = {
            "name": 'VU1',
            "email": 'VU1@vanderbilt.edu',
            "visions": 1,
            "type" : "vuceptor"
        };
        const res = await request(app).post('/createUser').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //set up for the auth testing: creating an event
    test('creating a VUceptor event', async () => {
        const body = {
            "title" : "VU event 1", 
            "date" : "2022-12-5", 
            "start_time" : "17:00:00", 
            "description" : "test event", 
            "location" : "commons", 
            "end_time" : "18:00:00", 
            "mandatory" : 1
        };
        const res = await request(app).post('/createVUEvent').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //set up for the auth testing: remembering the event id
    test('remembering the event id', async () => {
        const queryParam = {
            "time_range": "[\"2011-10-10\", \"2022-12-31\"]",
            "visions": 1
        };
        const res = await request(app).get('/readVUEvent').query(queryParam).set("Authorization", "Bearer " + adviserAccessToken);
        eventId = res.body.result[0].event_id;
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerVUAttendance.post('/editVUAttendance', VUAttendanceController.editVUAttendance);
    test('responds to /editVUAttendance', async () => {
        console.log(eventId)
        const body =  {
            "email": "VU1@vanderbilt.edu",
            "eventId" : eventId,
            "attendance" : "Present"
        };
        const res = await request(app).post('/editVUAttendance').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerVUAttendance.post('/deleteVUAttendance', VUAttendanceController.deleteVUAttendance);
    test('responds to /deleteVUAttendance', async () => {
        const body = {
            "email": "VU1@vanderbilt.edu",
            "eventId" : eventId,
        };
        const res = await request(app).post('/deleteVUAttendance').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerVUAttendance.post('/insertVUAttendance', VUAttendanceController.insertVUAttendance);
    test('responds to /insertVUAttendance', async () => {
        const body =  {
            "email": "VU1@vanderbilt.edu",
            "eventId" : eventId,
            "attendance" : "Present"
        };
        const res = await request(app).post('/insertVUAttendance').set("Authorization", "Bearer " + adviserAccessToken).send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //routerVUAttendance.get('/readVUAttendance', VUAttendanceController.readVUAttendance);
    test('responds to /readVUAttendance', async () => {
        const res = await request(app).get('/readVUAttendance').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //cleaning up after testing
    test('responds to /resetUsers', async () => {
        const res = await request(app).post('/resetUsers').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });
    
    //cleaning up after testing
    test('responds to /resetVUEvent', async () => {
        const res = await request(app).post('/resetVUEvent').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });
});