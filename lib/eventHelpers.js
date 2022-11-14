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