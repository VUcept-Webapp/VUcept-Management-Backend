const { STATUS_CODE, ascReturnResult, descReturnResult, emptyReturnResult } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");

describe('Routes for User Management Screen', () => {

  // routerUser.post('/userLoadfromcsv', userController.userLoadfromcsv);
  test('responds to /userLoadfromcsv', async () => {
    const body = { "file" : [{ "email": "test001@vanderbilt.edu",
    "name": "test001",
    "type": "vuceptor",
    "visions": 1 },
    { "email": "test002@vanderbilt.edu",
    "name": "test002",
    "type": "vuceptor",
    "visions": 2 },
    { "email": "test003@vanderbilt.edu",
    "name": "test003",
    "type": "vuceptor",
    "visions": 3 }]};

    const res = await request(app).post('/userLoadfromcsv').send(body);
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
  });

  test('responds to /userLoadfromcsv: with repeated user', async () => {
    const body = { "file" : [{ "email": 'test002@vanderbilt.edu',
    "name": 'test0012',
    "type": 'vuceptor',
    "visions": 12 },
    { "email": 'test003@vanderbilt.edu',
    "name": 'test0013',
    "type": 'vuceptor',
    "visions": 13 }]};
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
      "visions": 5 };
    const res = await request(app).post('/createUser').send(body);
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
  });

  test('responds to /createUser: with same email', async () => {
    const body = { 
      "email": 'test005@vanderbilt.edu',
      "name": 'test005',
      "type": 'vuceptor',
      "visions": 5 };
    const res = await request(app).post('/createUser').send(body);
    expect(res.body.status).toEqual(STATUS_CODE.EMAIL_USED);
  });

  // routerUser.get('/readUser', userController.readUser);
  test('responds to /readUser', async () => {
    const res = await request(app).get('/readUser');
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);

    const returnResult = { "rows": [
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
      },
      {
          "name": "test003",
          "email": "test003@vanderbilt.edu",
          "visions": 3,
          "type": "vuceptor",
          "status": "unregistered"
      },
      {
        "name": "test005",
        "email": "test005@vanderbilt.edu",
        "visions": 5,
        "type": "vuceptor",
        "status": "unregistered"
      }
    ],
    "pages": 1
    };
    expect(res.body.result).toEqual(returnResult);
  });

  test('responds to /readUser: name_sort', async () => {
    const queryParam = {"name_sort": "ASC", "condition_order": "[\"name_sort\"]"};
    const res = await request(app).get('/readUser').query(queryParam);
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    expect(res.body.result).toEqual(ascReturnResult);
  });

  test('responds to /readUser: email_sort', async () => {
    const queryParam = {"email_sort": "DESC", "condition_order": "[\"email_sort\"]"};
    const res = await request(app).get('/readUser').query(queryParam);
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    expect(res.body.result).toEqual(descReturnResult);
  });

  test('responds to /readUser: visions_sort', async () => {
    const queryParam = {"visions_sort": "ASC", "condition_order": "[\"visions_sort\"]"};
    const res = await request(app).get('/readUser').query(queryParam);
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    expect(res.body.result).toEqual(ascReturnResult);
  });

  test('responds to /readUser: name_sort + email_sort', async () => {
    const queryParam = {"name_sort": "ASC", "email_sort": "DESC", "condition_order": "[\"name_sort\", \"email_sort\"]"};
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
      "visions": 10 };
    const res = await request(app).post('/updateUser').send(body);
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
  });

  // routerUser.post('/deleteUser', userController.deleteUser);
  test('responds to /deleteUser', async () => {
    const body = { "email": "test002@vanderbilt.edu" };
    const res = await request(app).post('/deleteUser').send(body);
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
  });

  test('responds to /deleteUser: user does not exist', async () => {
    const body = { "email": 'test111@vanderbilt.edu'};
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