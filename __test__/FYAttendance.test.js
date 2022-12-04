const { STATUS_CODE } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");

describe('Testing for Fy Attendance screen', () => {

    //routerFyAttendance.get('/readFyAttendance', FyAttendanceController.readFyAttendance);
    test('responds to /readFyAttendance', async () => {
        const res = await request(app).get('/readFyAttendance');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /readFyAttendance: visions_sort', async () => {
        const queryParam = {
            "visions_sort": "ASC",
            "condition_order": "[\"visions_sort\"]"
        };
        const res = await request(app).get('/readFyAttendance').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /readFyAttendance: email_search', async () => {
        const queryParam = {"email_search": "[\"Fy2@gmail.com\"]"};
        const res = await request(app).get('/readFyAttendance').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerFyAttendance.post('/editFyAttendance', FyAttendanceController.editFyAttendance);
    test('responds to /editFyAttendance', async () => {
        const body =  {
            "email": "Fy1@vanderbilt.edu",
            "eventId": 1,
            "attendance" : "Present"
        };
        const res = await request(app).post('/editFyAttendance').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerFyAttendance.post('/deleteFyAttendance', FyAttendanceController.deleteFyAttendance);
    test('responds to /deleteFyAttendance', async () => {
        const body = {
            "email": "Fy1@vanderbilt.edu",
            "eventId": 1
        };
        const res = await request(app).post('/deleteFyAttendance').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerFyAttendance.post('/insertFyAttendance', FyAttendanceController.insertFyAttendance);
    test('responds to /insertFyAttendance', async () => {
        const body =  {
            "email": "Fy1@vanderbilt.edu",
            "eventId": 1,
            "attendance" : "Present"
        };
        const res = await request(app).post('/insertFyAttendance').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerFyAttendance.get('/getFyAttendanceEventsList', FyAttendanceController.getFyAttendanceEventsList);
    test('responds to /getFyAttendanceEventsList', async () => {
        const res = await request(app).get('/getFyAttendanceEventsList');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });
});