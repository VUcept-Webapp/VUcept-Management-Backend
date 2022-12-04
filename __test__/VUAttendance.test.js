const { STATUS_CODE } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");

describe('Testing for VU Attendance screen', () => {

    //routerVUAttendance.get('/readVUAttendance', VUAttendanceController.readVUAttendance);
    test('responds to /readVUAttendance', async () => {
        const res = await request(app).get('/readVUAttendance');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /readVUAttendance: visions_sort', async () => {
        const queryParam = {
            "visions_sort": "ASC",
            "condition_order": "[\"visions_sort\"]"
        };
        const res = await request(app).get('/readVUAttendance').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /readVUAttendance: email_search', async () => {
        const queryParam = {"email_search": "[\"vu2@gmail.com\"]"};
        const res = await request(app).get('/readVUAttendance').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerVUAttendance.post('/editVUAttendance', VUAttendanceController.editVUAttendance);
    test('responds to /editVUAttendance', async () => {
        const body =  {
            "email": "vu1@vanderbilt.edu",
            "eventId": 1,
            "attendance" : "Present"
        };
        const res = await request(app).post('/editVUAttendance').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerVUAttendance.post('/deleteVUAttendance', VUAttendanceController.deleteVUAttendance);
    test('responds to /deleteVUAttendance', async () => {
        const body = {
            "email": "vu1@vanderbilt.edu",
            "eventId": 1
        };
        const res = await request(app).post('/deleteVUAttendance').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerVUAttendance.post('/insertVUAttendance', VUAttendanceController.insertVUAttendance);
    test('responds to /insertVUAttendance', async () => {
        const body =  {
            "email": "vu1@vanderbilt.edu",
            "eventId": 1,
            "attendance" : "Present"
        };
        const res = await request(app).post('/insertVUAttendance').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerVUAttendance.get('/getVUAttendanceEventsList', VUAttendanceController.getVUAttendanceEventsList);
    test('responds to /getVUAttendanceEventsList', async () => {
        const res = await request(app).get('/getVUAttendanceEventsList');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });
});