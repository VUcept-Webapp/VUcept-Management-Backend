const { STATUS_CODE } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");

// Please ensure the entire database is empty
describe('Routes for VUceptor Events - Home Screen', () => {
    // routerVUEvent.post('/VUEventLoadfromcsv', VUEventController.VUEventLoadfromcsv);
    test('responds to /VUEventLoadfromcsv', async () => {
        const body = {
            "file": [
                {
                    "title": "vu1",
                    "date": "2022-12-11",
                    "description": "rrrr",
                    "start_time": "09:00",
                    "end_time": "10:00",
                    "location": "commons233",
                    "mandatory": 0
                },{
                    "title": "vu2",
                    "date": "2022-12-12",
                    "description": "tttt",
                    "start_time": "09:00",
                    "end_time": "11:00",
                    "location": "commons233",
                    "mandatory": 0
                }]
        };
        const res = await request(app).post('/VUEventLoadfromcsv').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /VUEventLoadfromcsv: with invalid time', async () => {
        const body = {
            "file": [{
                "title": "vu3",
                "date": "2022-11-12",
                "description": "aaaaa",
                "start_time": "09:00",
                "end_time": "01:00",
                "location": "commons233",
                "mandatory": 1
            }]
        };
        const res = await request(app).post('/VUEventLoadfromcsv').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.INVALID_START_END_TIMES);
    });

    // routerVUEvent.post('/createVUEvent', VUEventController.createVUEvent);
    test('responds to /createVUEvent', async () => {
        const body = {
                "title": "vu3",
                "date": "2022-11-12",
                "description": "aaaaa",
                "start_time": "09:00",
                "end_time": "11:00",
                "location": "commons233",
                "mandatory": 1
        };
        const res = await request(app).post('/createVUEvent').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /createVUEvent: invalid time', async () => {
        const body = {
                "title": "vu4",
                "date": "2022-11-12",
                "description": "aaaaa",
                "start_time": "09:00",
                "end_time": "01:00",
                "location": "commons233",
                "mandatory": 1
        };
        const res = await request(app).post('/createVUEvent').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.INVALID_START_END_TIMES);
    });

    // routerVUEvent.post('/updateVUEvent', VUEventController.updateVUEvent);
    test('responds to /updateVUEvent', async () => {
        const body = {
            "title": "vu4",
            "date": "2022-11-12",
            "description": "aaaaa",
            "start_time": "09:00",
            "end_time": "10:00",
            "location": "commons233",
            "mandatory": 0,
            "event_id": 1
        };
        const res = await request(app).post('/updateVUEvent').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /updateVUEvent: invalid time', async () => {
        const body = {
            "title": "vu4",
            "date": "2022-11-12",
            "description": "aaaaa",
            "start_time": "09:00",
            "end_time": "01:00",
            "location": "commons233",
            "mandatory": 0,
            "event_id": 1
        };
        const res = await request(app).post('/updateVUEvent').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.INVALID_START_END_TIMES);
    });

    // routerVUEvent.get('/readVUEvent', VUEventController.readVUEvent);
    test('responds to /readVUEvent', async () => {
        const queryParam = {
            "time_range": "[\"2011-10-10\", \"2022-12-31\"]"
        };
        const res = await request(app).get('/readVUEvent').query(queryParam).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerVUEvent.post('/deleteVUEvent', VUEventController.deleteVUEvent);
    test('responds to /deleteVUEvent', async () => {
        const body = {"event_id": -1};
        const res = await request(app).post('/deletefyEvent').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.INCORRECT_EVENT_ID);
    });

    // routerVUEvent.post('/resetVUEvent', VUEventController.resetVUEvent);
    test('responds to /resetVUEvent', async () => {
        const res = await request(app).post('/resetVUEvent').set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerVUEvent.get('/readVUEvent', VUEventController.readVUEvent);
    test('responds to /readVUEvent: check if user table is empty', async () => {
        const queryParam = {
            "time_range": "[\"2011-10-10\", \"2022-12-31\"]"
        };
        const res = await request(app).get('/readVUEvent').query(queryParam).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual([]);
    });
});