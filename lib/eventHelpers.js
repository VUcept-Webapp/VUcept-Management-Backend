const connection = require('../models/connection');
const { TYPE } = require('../lib/constants');

exports.verifyUser = (email) => {
    const queryCheck = 'SELECT COUNT(email) AS NUM FROM users WHERE (email = ?) AND ((type = \'' + TYPE.BOARD + '\') OR (type = \'' + TYPE.ADVISER + '\'))';

    const promise = new Promise((resolve, reject) => {
        connection.query(queryCheck, email, (err, res) => {
            if (err) reject(err);
            else resolve(res[0]);
        })
    });

    return promise;
};

exports.verifyEvent = (event_id, table) => {
    const queryCheck = 'SELECT COUNT(event_id) AS NUM FROM ' + table + ' WHERE event_id = ?';

    const promise = new Promise((resolve, reject) => {
        connection.query(queryCheck, event_id, (err, res) => {
         if (err) reject(err);
         else resolve(res[0]);
        })
    });

    return promise;
};

exports.getEventId = (table) => {
    const queryId = 'SELECT MAX(event_id) as ID FROM ' + table;

    const promise = new Promise((resolve, reject) => {
        connection.query(queryId, (err, res) => {
         if (err) reject(err);
         else resolve(res[0]);
        })
    });

    return promise;
};

exports.getAllPersonId = (table) => {
    let queryId = 'SELECT user_id FROM ' + table + ' WHERE type = \'vuceptor\'';
    
    if (table != 'users'){
        queryId = 'SELECT student_id FROM ' + table;
    }

    const promise = new Promise((resolve, reject) => {
        connection.query(queryId, (err, res) => {
         if (err) reject(err);
         else resolve(res);
        })
    });

    return promise;
};

exports.insertEventAttendance = (id, getAllPerson, personId, table, personRowName) => {
    let vals = '';
    for (let i = 0; i < getAllPerson.length; i++){
        vals += '(' + getAllPerson[i][personId] + ', ' + id + ', \'Unlogged\'),';
    }

    let queryId = 'INSERT INTO ' + table + ' (' + personRowName + ', event_id, attendance) VALUES ' + vals;

    let queryFinal = queryId.substring(0, queryId.length - 1);

    const promise = new Promise((resolve, reject) => {
        connection.query(queryFinal, (err, res) => {
         if (err) reject(err);
         else resolve(res);
        })
    });

    return promise;
};