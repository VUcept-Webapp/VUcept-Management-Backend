const connection = require('../models/connection');
const {STATUS_CODE } = require('../lib/constants');

exports.readVUAttendance = async (req, res) => {
    const query = `SELECT * FROM vu_attendance;`;
    const viewusers = new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        })
      });
    //count number of pages 
    // const queryCount = `SELECT COUNT(*) AS count FROM vu_attendance`;
    // var pages = 0;
    // await connection.promise().query(queryCount)
    // .then(data => {
    //     pages = Math.ceil(data[0][0].count/row_num);
    // })
    // .catch(error => {
    //     console.log(error);
    // });
    try {
        const rows = await viewusers;
        // const pages = countPages(vu_attendance);
        return res.send({ status: STATUS_CODE.SUCCESS, result: rows});
    } catch (error) {
        return res.send({ status: STATUS_CODE.ERROR, result: error });
    }
}

exports.insertVUAttendance =  async (req, res) => {
    const {VUId, eventID, attendance} = req.body;
    //check for event
    const checkEventResult = await checkEvent(eventID);
    if (checkEventResult) return res.send(checkEventResult);
    //check for vuceptor
    const checkVUCeptorResult = await checkVUCeptor(VUId);
    if (checkVUCeptorResult) return res.send(checkVUCeptorResult);
    //check for existing records 
    const checkExistingRecordResult = await checkExistingVUAttendance(eventID, VUId);
    if (checkExistingRecordResult) return res.send(checkExistingRecordResult);

    //insert vuceptor attendance record
    const query = 'INSERT INTO vuceptor_attendance (vuceptor_id, event_id, attendance) VALUES (?,?,?)';
    const addVUAttendance = new Promise((resolve, reject) => {
      connection.query(query, [VUId, eventID, attendance], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      })
    });
    try {
        const addVUAttendanceResult = await addVUAttendance;
        if (addVUAttendanceResult.affectedRows){
            return res.send({status: STATUS_CODE.SUCCESS});
        }
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

const checkEvent = async (eventID) => {
    const query = 'SELECT COUNT(*) AS count FROM vuceptor_events WHERE event_id = ?';
    const performCheckEvent = new Promise((resolve, reject) => {
        connection.query(query, [eventID], (err, res) => {
          if (err) reject(err);
          else resolve(res[0]);
        })
    });
    try {
        const checkEventResult = await performCheckEvent;
        if (checkEventResult.count === 0) {
            return {status: STATUS_CODE.INVALID_VU_EVENT};
        }
    } catch (e){
        console.log(e);
        return {status : STATUS_CODE.ERROR};
    }
}

const checkVUCeptor = async (userID) => {
    const query = 'SELECT COUNT(*) AS count FROM users WHERE user_id = ?';
    const performCheckEvent = new Promise((resolve, reject) => {
        connection.query(query, [userID], (err, res) => {
          if (err) reject(err);
          else resolve(res[0]);
        })
    });
    try {
        const checkVUCeptorResult = await performCheckEvent;
        if (checkVUCeptorResult.count === 0) {
            return {status: STATUS_CODE.INVALID_USER};
        }
    } catch (e){
        console.log(e);
        return {status : STATUS_CODE.ERROR};
    }
}

const checkExistingVUAttendance= async (eventID, userID) => {
    const query = 'SELECT COUNT(*) AS count FROM vuceptor_attendance WHERE vuceptor_id = ? AND event_id = ?';
    const performCheckExistingRecord= new Promise((resolve, reject) => {
        connection.query(query, [userID, eventID], (err, res) => {
          if (err) reject(err);
          else resolve(res[0]);
        })
    });

    try {
        const checkExistingRecordResult = await performCheckExistingRecord;
        if (checkExistingRecordResult.count !== 0) {
            return {status: STATUS_CODE.REPEATED_RECORDS};
        }
    } catch (e){
        console.log(e);
        return {status : STATUS_CODE.ERROR};
    }
}
