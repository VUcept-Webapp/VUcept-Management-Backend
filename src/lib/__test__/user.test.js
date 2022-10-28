const { STATUS_CODE } = require('../../../lib/constants');
const request = require('supertest');
const app = require("../../../index.js");
const mysql = require('mysql2');

// fake database
const t_connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    port: process.env.RDS_PORT,
    database: process.env.RDS_DATABASE
});

t_connection.connect(
    function (err) {
        if (err) throw err; 
        console.log("Connected!");
});


describe('Routes for User Management Screen', () => {

  // routerUser.post('/resetUsers', userController.resetUsers);
  test('responds to /resetUsers', async () => {
    // const res = await request(app).post('/resetUsers');
    // expect(res.statusCode).toBe(200);
    // expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
  });

  // routerUser.post('/userLoadfromcsv', userController.userLoadfromcsv);
  // routerUser.post('/createUser', userController.createUser);
  test('responds to /createUser', async () => {
    const res = await request(app).post('/createUser');
    send({ 
      email: 'test001@vanderbilt.edu',
      name: 'test001',
      type: 'vuceptor',
      visions: 1 });
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
  });

  test('responds to /createUser with same email', async () => {
    const res = await request(app).post('/createUser');
    send({ 
      email: 'test001@vanderbilt.edu',
      name: 'test002',
      type: 'vuceptor',
      visions: 2 });
    expect(res.body.status).toEqual(STATUS_CODE.EMAIL_USED);
  });

  // routerUser.post('/updateUser', userController.updateUser);
  test('responds to /updateUser', async () => {
    const res = await request(app).post('/updateUser');
    send({ 
      old_email: 'test001@vanderbilt.edu',
      email: 'test002@vanderbilt.edu',
    name: 'test002',
    type: 'vuceptor',
    visions: 1 });
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
  });

  // routerUser.post('/deleteUser', userController.deleteUser);

  // routerUser.get('/readUser', userController.readUser);
  test('responds to /readUser', async () => {
    const res = await request(app).get('/readUser');
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
    expect(res.body.result).toEqual();
  });

  // routerUser.get('/visionsNums', userController.visionsNums);
  test('responds to /visionsNums', async () => {
    const res = await request(app).get('/visionsNums');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toEqual(STATUS_CODE.SUCCESS);
  });

  // afterAll(async () => {
  //   await connection.close();
  // });

});

