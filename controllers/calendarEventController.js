// const { dbConfig, connect, disconnect } = require('../models/connection');
// const {STATUS_CODE } = require('../lib/constants');

// const connection = dbConfig(); // need to implement disconnect

// exports.insertCalendarEvent =  async (req, res) => {
//     const {title, loggedBy, date, startTime, description, location, endTime} = req.body;
//     const query = 'INSERT INTO vuceptor_events (title, logged_by, date, start_time, description, location, end_time) VALUES (?,?,?,?,?,?,?)';

//     const addCalendarEvent = new Promise((resolve, reject) => {
//       connection.query(query, [title, loggedBy, date, startTime, description, location, endTime], (err, res) => {
//         if (err) reject(err);
//         else resolve(res);
//       })
//     });

//     try {
//         const addCalendarEventResult = await addCalendarEvent;
//         if (addCalendarEventResult.affectedRows){
//             return res.send({status: STATUS_CODE.SUCCESS});
//         }
//     } catch (e){
//         console.log(e);
//         return res.send({status: STATUS_CODE.ERROR});
//     }
// }