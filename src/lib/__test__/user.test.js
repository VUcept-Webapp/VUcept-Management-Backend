const { STATUS_CODE } = require('../../../lib/constants');
const request = require('supertest');
const app = require("../../../index.js");
const connection = require('../../../models/connection');

describe('Routes for User Management Screen', () => {

  test('responds to /readUser', async () => {
    const res = await request(app).get('/readUser');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
  });

  test('responds to /addUser', async () => {
    const res = await request(app).post('/addUser');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
  });

  // afterAll(async () => {
  //   await connection.close();
  // });

});

