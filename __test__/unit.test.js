const { STATUS_CODE } = require('../lib/constants');
const { ascReturnResult, descReturnResult, emptyReturnResult, origReturnResult, fyOrigReturnResult, ascfyReturnResult } = require('../lib/test_constants');
const request = require('supertest');
const app = require("../index.js");

describe('Routes for User Management Screen', () => {

    // routerUser.post('/userLoadfromcsv', userController.userLoadfromcsv);
    test('responds to /userLoadfromcsv', async () => {
        const body = {
            "file": [
                {
                    "email": "test001@vanderbilt.edu",
                    "name": "test001",
                    "type": "vuceptor",
                    "visions": 1
                },
                {
                    "email": "test002@vanderbilt.edu",
                    "name": "test002",
                    "type": "vuceptor",
                    "visions": 2
                },
                {
                    "email": "test003@vanderbilt.edu",
                    "name": "test003",
                    "type": "vuceptor",
                    "visions": 3
                }]
        };

        const res = await request(app).post('/userLoadfromcsv').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /userLoadfromcsv: with repeated user', async () => {
        const body = {
            "file": [
                {
                "email": 'test002@vanderbilt.edu',
                "name": 'test0012',
                "type": 'vuceptor',
                "visions": 12
                },
                {
                    "email": 'test003@vanderbilt.edu',
                    "name": 'test0013',
                    "type": 'vuceptor',
                    "visions": 13
                }]
        };
        const res = await request(app).post('/userLoadfromcsv').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.EMAIL_USED);
        expect(res.body.result).toEqual(['test002@vanderbilt.edu', 'test003@vanderbilt.edu']);
    });

    // routerUser.post('/createUser', userController.createUser);
    test('responds to /createUser', async () => {
        const body = {
            "email": 'test005@vanderbilt.edu',
            "name": 'test005',
            "type": 'vuceptor',
            "visions": 5
        };
        const res = await request(app).post('/createUser').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerUser.post('/createUser', userController.createUser);
    test('responds to /createUser: with same email', async () => {
        const body = {
            "email": 'test005@vanderbilt.edu',
            "name": 'test005',
            "type": 'vuceptor',
            "visions": 5
        };
        const res = await request(app).post('/createUser').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.EMAIL_USED);
    });

    // routerUser.get('/readUser', userController.readUser);
    test('responds to /readUser', async () => {
        const res = await request(app).get('/readUser');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(origReturnResult);
    });

    test('responds to /readUser: name_sort', async () => {
        const queryParam = {
            "name_sort": "ASC",
            "condition_order": "[\"name_sort\"]"
        };
        const res = await request(app).get('/readUser').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(ascReturnResult);
    });

    test('responds to /readUser: email_sort', async () => {
        const queryParam = {
            "email_sort": "DESC",
            "condition_order": "[\"email_sort\"]"
        };
        const res = await request(app).get('/readUser').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(descReturnResult);
    });

    test('responds to /readUser: visions_sort', async () => {
        const queryParam = {
            "visions_sort": "ASC",
            "condition_order": "[\"visions_sort\"]"
        };
        const res = await request(app).get('/readUser').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(ascReturnResult);
    });

    test('responds to /readUser: name_sort + email_sort', async () => {
        const queryParam = {
            "name_sort": "ASC",
            "email_sort": "DESC",
            "condition_order": "[\"name_sort\", \"email_sort\"]"
        };
        const res = await request(app).get('/readUser').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(ascReturnResult);
    });

    test('responds to /readUser: name_search', async () => {
        const queryParam = {"name_search": "[\"test001\"]"};
        const res = await request(app).get('/readUser').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        const returnResult = {
            "rows": [
                {
                    "name": "test001",
                    "email": "test001@vanderbilt.edu",
                    "visions": 1,
                    "type": "vuceptor",
                    "status": "unregistered"
                }
            ],
            "pages": 1
        };
        expect(res.body.result).toEqual(returnResult);
    });

    test('responds to /readUser: email_search', async () => {
        const queryParam = {"email_search": "[\"test111@gmail.com\"]"};
        const res = await request(app).get('/readUser').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(emptyReturnResult);
    });

    test('responds to /readUser: visions_filter', async () => {
        const queryParam = {"visions_filter": "[1, 2]"};
        const res = await request(app).get('/readUser').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        const returnResult = {
            "rows": [
                {
                    "name": "test001",
                    "email": "test001@vanderbilt.edu",
                    "visions": 1,
                    "type": "vuceptor",
                    "status": "unregistered"
                },
                {
                    "name": "test002",
                    "email": "test002@vanderbilt.edu",
                    "visions": 2,
                    "type": "vuceptor",
                    "status": "unregistered"
                }
            ],
            "pages": 1
        };
        expect(res.body.result).toEqual(returnResult);
    });

    test('responds to /readUser: type_filter', async () => {
        const queryParam = {"type_filter": "[\"adviser\"]"};
        const res = await request(app).get('/readUser').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(emptyReturnResult);
    });

    // routerUser.post('/updateUser', userController.updateUser);
    test('responds to /updateUser', async () => {
        const body = {
            "old_email": 'test001@vanderbilt.edu',
            "email": 'test010@vanderbilt.edu',
            "name": 'test010',
            "type": 'vuceptor',
            "visions": 10
        };
        const res = await request(app).post('/updateUser').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerUser.post('/deleteUser', userController.deleteUser);
    test('responds to /deleteUser', async () => {
        const body = {"email": "test002@vanderbilt.edu"};
        const res = await request(app).post('/deleteUser').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /deleteUser: user does not exist', async () => {
        const body = {"email": 'test111@vanderbilt.edu'};
        const res = await request(app).post('/deleteUser').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.INCORRECT_USER_EMAIL);
        expect(res.body.result).toEqual('test111@vanderbilt.edu');
    });

    // routerUser.get('/visionsNums', userController.visionsNums);
    test('responds to /visionsNums', async () => {
        const res = await request(app).get('/visionsNums');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);

        const returnResult = {
            "list": [
                {
                    "visions": 3
                },
                {
                    "visions": 5
                },
                {
                    "visions": 10
                }
            ]
        };
        expect(res.body.result).toEqual(returnResult);
    });

    // routerUser.post('/resetUsers', userController.resetUsers);
    test('responds to /resetUsers', async () => {
        const res = await request(app).post('/resetUsers');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerUser.get('/readUser', userController.readUser);
    test('responds to /readUser: check if user table is empty', async () => {
        const res = await request(app).get('/readUser');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(emptyReturnResult);
    });
});

describe('Routes for Visions Assignment Screen', () => {

    // routerFy.post('/fyLoadfromcsv', fyController.fyLoadfromcsv);
    test('responds to /fyLoadfromcsv', async () => {
        const body = {
            "file": [
                {
                    "email": "test001@vanderbilt.edu",
                    "name": "test001",
                    "visions": 1
                },
                {
                    "email": "test002@vanderbilt.edu",
                    "name": "test002",
                    "visions": 2
                }]
        };

        const res = await request(app).post('/fyLoadfromcsv').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /fyLoadfromcsv: with repeated user', async () => {
        const body = {
            "file": [
                {
                "email": "test002@vanderbilt.edu",
                "name": "test0012",
                "visions": 20
                }]
        };
        const res = await request(app).post('/fyLoadfromcsv').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.EMAIL_USED);
        expect(res.body.result).toEqual(['test002@vanderbilt.edu']);
    });

    // routerFy.post('/createFy', fyController.createFy);
    test('responds to /createFy', async () => {
        const body = {
            "email": "test005@vanderbilt.edu",
            "name": "test005",
            "visions": 5
        };
        const res = await request(app).post('/createFy').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /createFy: with same email', async () => {
        const body = {
            "email": 'test005@vanderbilt.edu',
            "name": 'test050',
            "visions": 15
        };
        const res = await request(app).post('/createFy').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.EMAIL_USED);
    });

    // routerFy.get('/readFy', fyController.readFy);
    test('responds to /readFy', async () => {
        const res = await request(app).get('/readFy');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(fyOrigReturnResult);
    });

    test('responds to /readFy: name_sort', async () => {
        const queryParam = {
            "name_sort": "ASC",
            "condition_order": "[\"name_sort\"]"
        };
        const res = await request(app).get('/readFy').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(ascfyReturnResult);
    });

    test('responds to /readFy: visions_sort', async () => {
        const queryParam = {
            "visions_sort": "ASC",
            "condition_order": "[\"visions_sort\"]"
        };
        const res = await request(app).get('/readFy').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(ascfyReturnResult);
    });

    test('responds to /readFy: name_sort + email_sort', async () => {
        const queryParam = {
            "name_sort": "ASC",
            "email_sort": "DESC",
            "condition_order": "[\"name_sort\", \"email_sort\"]"
        };
        const res = await request(app).get('/readFy').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(ascfyReturnResult);
    });

    test('responds to /readFy: name_search', async () => {
        const queryParam = {"name_search": "[\"test001\"]"};
        const res = await request(app).get('/readFy').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        const returnResult = {
            "rows": [
                {
                    "fy_name": "test001",
                    "fy_email": "test001@vanderbilt.edu",
                    "visions": 1,
                    "vuceptor_name": null
                }
            ],
            "pages": 1
        };
        expect(res.body.result).toEqual(returnResult);
    });

    test('responds to /readFy: email_search', async () => {
        const queryParam = {"email_search": "[\"test111@gmail.com\"]"};
        const res = await request(app).get('/readFy').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(emptyReturnResult);
    });

    test('responds to /readFy: visions_filter', async () => {
        const queryParam = {"visions_filter": "[1, 2]"};
        const res = await request(app).get('/readFy').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        const returnResult = {
            "rows": [
                {
                    "fy_name": "test001",
                    "fy_email": "test001@vanderbilt.edu",
                    "visions": 1,
                    "vuceptor_name": null
                },
                {
                    "fy_name": "test002",
                    "fy_email": "test002@vanderbilt.edu",
                    "visions": 2,
                    "vuceptor_name": null
                }
            ],
            "pages": 1
        };
        expect(res.body.result).toEqual(returnResult);
    });

    // routerFy.post('/updateFy', fyController.updateFy);
    test('responds to /updateFy', async () => {
        const body = {
            "old_email": "test001@vanderbilt.edu",
            "email": "test010@vanderbilt.edu",
            "name": "test010",
            "visions": 10
        };
        const res = await request(app).post('/updateFy').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerFy.post('/deleteFy', fyController.deleteFy);
    test('responds to /deleteFy', async () => {
        const body = {"email": "test002@vanderbilt.edu"};
        const res = await request(app).post('/deleteFy').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    test('responds to /deleteFy: user does not exist', async () => {
        const body = {"email": 'test111@vanderbilt.edu'};
        const res = await request(app).post('/deleteFy').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.INCORRECT_STUDENT_EMAIL);
        expect(res.body.result).toEqual('test111@vanderbilt.edu');
    });

    // routerFy.get('/fyVisionsNums', fyController.fyVisionsNums);
    test('responds to /fyVisionsNums', async () => {
        const res = await request(app).get('/fyVisionsNums');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        const returnResult = {
            "list": [
                {
                    "visions": 5
                },
                {
                    "visions": 10
                }
            ]
        };
        expect(res.body.result).toEqual(returnResult);
    });

    // routerFy.post('/resetFy', fyController.resetFy);
    test('responds to /resetFy', async () => {
        const res = await request(app).post('/resetFy');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerFy.get('/readFy', fyController.readFy);
    test('responds to /readFy: check if user table is empty', async () => {
        const res = await request(app).get('/readFy');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual(emptyReturnResult);
    });
});

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

        const res = await request(app).post('/fyVisionsInfoLoadfromcsv').send(body);
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
        const res = await request(app).post('/fyVisionsInfoLoadfromcsv').send(body);
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
        const res = await request(app).post('/fyVisionsInfoLoadfromcsv').send(body);
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
        const res = await request(app).post('/fyVisionsEventLoadfromcsv').send(body);
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
        const res = await request(app).post('/createfyEvent').send(body);
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
        const res = await request(app).post('/updatefyEvent').send(body);
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
        const res = await request(app).post('/deletefyEvent').send(body);
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
        const res = await request(app).post('/VUEventLoadfromcsv').send(body);
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
        const res = await request(app).post('/VUEventLoadfromcsv').send(body);
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
        const res = await request(app).post('/createVUEvent').send(body);
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
        const res = await request(app).post('/createVUEvent').send(body);
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
        const res = await request(app).post('/updateVUEvent').send(body);
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
        const res = await request(app).post('/updateVUEvent').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.INVALID_START_END_TIMES);
    });

    // routerVUEvent.get('/readVUEvent', VUEventController.readVUEvent);
    test('responds to /readVUEvent', async () => {
        const queryParam = {
            "time_range": "[\"2011-10-10\", \"2022-12-31\"]"
        };
        const res = await request(app).get('/readVUEvent').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerVUEvent.post('/deleteVUEvent', VUEventController.deleteVUEvent);
    test('responds to /deleteVUEvent', async () => {
        const body = {"event_id": -1};
        const res = await request(app).post('/deletefyEvent').send(body);
        expect(res.body.status).toEqual(STATUS_CODE.INCORRECT_EVENT_ID);
    });

    // routerVUEvent.post('/resetVUEvent', VUEventController.resetVUEvent);
    test('responds to /resetVUEvent', async () => {
        const res = await request(app).post('/resetVUEvent');
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    });

    // routerVUEvent.get('/readVUEvent', VUEventController.readVUEvent);
    test('responds to /readVUEvent: check if user table is empty', async () => {
        const queryParam = {
            "time_range": "[\"2011-10-10\", \"2022-12-31\"]"
        };
        const res = await request(app).get('/readVUEvent').query(queryParam);
        expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
        expect(res.body.result).toEqual([]);
    });
});