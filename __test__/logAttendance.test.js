const { STATUS_CODE } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");

describe('Testing for log Attendance screen', () => {

    //routerLogAttendance.get('/readLogAttendance', LogAttendanceController.readLogAttendance);
    test('responds to /readLogAttendance: visions and event_id', async () => {
        const queryParam = {
            "visions": 1,
            "event_id": 1
        };
        const res = await request(app).get('/readLogAttendance').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /readLogAttendance: email_search', async () => {
        const queryParam = {
            "visions": 1,
            "event_id": 1,
            "email_search": "[\"fy1@vanderbilt.edu\"]"
        };
        const res = await request(app).get('/readLogAttendance').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //routerLogAttendance.get('/getLogVisionsEvents', LogAttendanceController.getLogVisionsEvents);
    test('responds to /getLogVisionsEvents', async () => {
        const res = await request(app).get('/getLogVisionsEvents');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    //routerLogAttendance.post('/submitAttendance', LogAttendanceController.submit);
    test('responds to /submitAttendance', async () => {
        const body =  {
            "edits" : [
            {"email": "fy1@vanderbilt.edu", "eventId": 1, "attendance": "Present"},
            {"email": "fy2@vanderbilt.edu", "eventId": 2, "attendance": "Absent"},
            ]
        };
        const res = await request(app).post('/submitAttendance').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });
});