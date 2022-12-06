const { STATUS_CODE } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");

// Please ensure the entire database is empty
describe('Routes for Fy Events - Home Screen', () => {
    // routerfyEvent.post('/fyVisionsInfoLoadfromcsv', fyEventController.fyVisionsInfoLoadfromcsv);
    test('responds to /fyVisionsInfoLoadfromcsv', async () => {
        const body = {
            "file": [
                {
                    "visions": 1,
                    "day": "Monday",
                    "start_time": "12:00",
                    "end_time": "13:00",
                    "location": "commons1"
                },{
                    "visions": 2,
                    "day": "Tuesday",
                    "start_time": "09:00",
                    "end_time": "15:00",
                    "location": "commons2"
                }]
        };

        const res = await request(app).post('/fyVisionsInfoLoadfromcsv').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /fyVisionsInfoLoadfromcsv: with invalid time', async () => {
        const body = {
            "file": [{
                "visions": 3,
                "day": "Tuesday",
                "start_time": "09:00",
                "end_time": "08:00",
                "location": "commons2"
            }]
        };
        const res = await request(app).post('/fyVisionsInfoLoadfromcsv').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.INVALID_START_END_TIMES);
    });

    test('responds to /fyVisionsInfoLoadfromcsv: with invalid visions', async () => {
        const body = {
            "file": [{
                "visions": 2,
                "day": "Tuesday",
                "start_time": "09:00",
                "end_time": "10:00",
                "location": "commons2"
            }]
        };
        const res = await request(app).post('/fyVisionsInfoLoadfromcsv').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.VISIONS_EXIST);
    });

    // routerfyEvent.post('/fyVisionsEventLoadfromcsv', fyEventController.fyVisionsEventLoadfromcsv);
    test('responds to /fyVisionsEventLoadfromcsv', async () => {
        const body = {
            "file": [
                {
                "title": "title_t1",
                "date": "2022-11-11",
                "description": "tmp1"
                },
                {
                "title": "title_t2",
                "date": "2022-11-12",
                "description": "tmp2"
                }]
        };
        const res = await request(app).post('/fyVisionsEventLoadfromcsv').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerfyEvent.post('/createfyEvent', fyEventController.createfyEvent);
    test('responds to /createfyEvent', async () => {
        const body = {
            "title": "common_event1",
            "date": "2022-12-11",
            "description": "tttt",
            "is_common": 1,
            "visions": null,
            "day": "Tuesday",
            "start_time": "09:00",
            "end_time": "10:00",
            "location": "commons233"
        };
        const res = await request(app).post('/createfyEvent').send.set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerfyEvent.post('/updatefyEvent', fyEventController.updatefyEvent);
    test('responds to /updatefyEvent', async () => {
        const body = {
            "title": "common_event1",
            "date": "2022-12-11",
            "description": "ssss",
            "is_common": 1,
            "visions": null,
            "day": "Tuesday",
            "start_time": "09:00",
            "end_time": "10:00",
            "location": "commons233",
            "event_id": 9
        };
        const res = await request(app).post('/updatefyEvent').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerfyEvent.get('/readfyEvent', fyEventController.readfyEvent);
    test('responds to /readfyEvent', async () => {
        const queryParam = {
            "time_range": "[\"2011-10-10\", \"2022-12-31\"]",
            "visions": 1
        };
        const res = await request(app).get('/readfyEvent').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerfyEvent.post('/deletefyEvent', fyEventController.deletefyEvent);
    test('responds to /deletefyEvent', async () => {
        const body = {"event_id": -1};
        const res = await request(app).post('/deletefyEvent').send(body).set("Authorization", "Bearer " + adviserAccessToken);
        expect(res.body.status).toEqual(STATUS_CODE.INCORRECT_EVENT_ID);
    });

    // routerfyEvent.get('/visionsEntered', fyEventController.visionsEntered);
    test('responds to /visionsEntered', async () => {
        const res = await request(app).get('/visionsEntered');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        const returnResult = {
            "list": [
                {
                    "visions": 1
                },
                {
                    "visions": 2
                }
            ]
        };
        expect(res.body.result).toEqual(returnResult);
    });

    // routerfyEvent.post('/resetfyEvent', fyEventController.resetfyEvent);
    test('responds to /resetfyEvent', async () => {
        const res = await request(app).post('/resetfyEvent');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerfyEvent.get('/readfyEvent', fyEventController.readfyEvent);
    test('responds to /readfyEvent: check if user table is empty', async () => {
        const queryParam = {
            "time_range": "[\"2011-10-10\", \"2022-12-31\"]",
            "visions": 1
        };
        const res = await request(app).get('/readfyEvent').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual([]);
    });
});