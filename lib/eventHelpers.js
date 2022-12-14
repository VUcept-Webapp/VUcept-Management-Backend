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
    let queryCheck = 'SELECT COUNT(event_id) AS NUM, is_common AS COMMON FROM ' + table + ' WHERE event_id = ?';
    
    if (table == 'vuceptor_events'){
        queryCheck = 'SELECT COUNT(event_id) AS NUM FROM ' + table + ' WHERE event_id = ?';
    }

    const promise = new Promise((resolve, reject) => {
        connection.query(queryCheck, event_id, (err, res) => {
         if (err) reject(err);
         else resolve(res[0]);
        })
    });

    return promise;
};

exports.verifyVisions = (visions) => {
    const queryCheck = 'SELECT COUNT(visions) AS NUM FROM visions_info WHERE visions = ?';

    const promise = new Promise((resolve, reject) => {
        connection.query(queryCheck, visions, (err, res) => {
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

exports.findOffset = (day) => {
    var offset = 0;
    switch (day) {
        case null:
          offset = 0;
          break;
        case "Monday":
          offset = 0;
          break;
        case "Tuesday":
          offset = 1;
          break;
        case "Wednesday":
          offset = 2;
          break;
        case "Thursday":
          offset = 3;
          break;
        case "Friday":
          offset = 4;
          break;
        case "Saturday":
          offset = 5;
          break;
        case "Sunday":
          offset = 6;
      }

    return offset;
}

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

exports.insertEventAttendance = (id, getAllPerson, personRowName, table, attendanceRowName) => {
    let vals = '';
    
    for (let i = 0; i < getAllPerson.length; i++){
        vals += '(' + getAllPerson[i][personRowName] + ', ' + id + ', \'Absent\'),';
    }
    
    let queryId = 'INSERT INTO ' + table + ' (' + attendanceRowName + ', event_id, attendance) VALUES ' + vals;
    
    let queryFinal = queryId.substring(0, queryId.length - 1);    

    const promise = new Promise((resolve, reject) => {
        connection.query(queryFinal, (err, res) => {
         if (err) reject(err);
         else resolve(res);
        })
    });

    return promise;
};