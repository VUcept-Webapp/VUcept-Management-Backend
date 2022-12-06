const { STATUS_CODE } = require('../lib/constants');
const { emptyReturnResult, fyOrigReturnResult, ascfyReturnResult } = require('../lib/test_constants');
const request = require('supertest');
const app = require("../index.js");

// Please ensure the entire database is empty
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