const { STATUS_CODE } = require('../lib/constants');
const request = require('supertest');
const app = require("../index.js");

const createTestFy = () =>{
    const query = `INSERT INTO students (email, name, visions)
    VALUES ("fy1@vanderbilt.edu", "fy1", 1)`;
    return new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
        if (err) reject(err);
        else resolve(res);
        })
    });
}

const createTestFyEvents = () =>{
    const query = `INSERT INTO student_events_aggregate (title, is_common, date)
    VALUES ("visions week 1", 0, '2022-12-1')`;
    return new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
        if (err) reject(err);
        else resolve(res);
        })
    });
}
  
const createTestFyAttendance = () =>{
    const eventId = await findEventId('visions week 1');
    const studentId = await findStudentId('fy1@vanderbilt.edu');
    const query = `INSERT INTO student_attendance (student_id, event_id, attendance)
    VALUES (?, ?, 'Present')`;
    return new Promise((resolve, reject) => {
        connection.query(query, {eventId, studentId}, (err, res) => {
        if (err) reject(err);
        else resolve(res);
        })
    });
}

const findEventId = async (title) =>{
    const query = `SELECT event_id FROM student_events_aggregate WHERE title = ?`;
    return new Promise((resolve, reject) => {
        connection.query(query, title, (err, res) => {
        if (err) reject(err);
        else resolve(res);
        })
    });
}

const findStudentId = async (email) =>{
    const query = `SELECT student_id FROM students WHERE email = ?`;
    return new Promise((resolve, reject) => {
        connection.query(query, email, (err, res) => {
        if (err) reject(err);
        else resolve(res);
        })
    });
}

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