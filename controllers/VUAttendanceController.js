const {STATUS_CODE, TYPE } = require('../lib/constants');
const attendanceManager = require('../lib/attendanceHelpers');
const actualTableName = `vuceptor_attendance`;
const bigViewName = `vu_attendance`;

//global variable to cache current read data 
var currentRead;

exports.readVUAttendance = async (req, res) => {
    // if (req.user.type != TYPE.ADVISER) {
    //     return res.send({status : STATUS_CODE.FORBIDDEN})
    // }
    try {
        const readAttendance = await attendanceManager.readAttendance(req.query, bigViewName);
        //cache most recent read
        currentRead = readAttendance.result.rows;
        return res.send(readAttendance);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

exports.insertVUAttendance =  async (req, res) => {
    try {
        const insertAttendance = await attendanceManager.insertAttendance(req.body, actualTableName);
        return res.send(insertAttendance);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

exports.editVUAttendance =  async (req, res) => {
    try {
        const editAttendance = await attendanceManager.editAttendance(req.body, actualTableName);
        return res.send(editAttendance);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

exports.deleteVUAttendance =  async (req, res) => {
    try {
        const deleteAttendance = await attendanceManager.deleteAttendance(req.body, actualTableName);
        return res.send(deleteAttendance);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

exports.exportVUAttendance =  async (req, res) => {
    try {
        const data = await attendanceManager.exportAttendance(currentRead);
        return res.send(data);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

exports.getVUAttendanceVisionsList =  async (req, res) => {
    try {
        const data = await attendanceManager.getVisionsList(bigViewName);
        return res.send(data);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

exports.getVUAttendanceEventsList =  async (req, res) => {
    try {
        const data = await attendanceManager.getEventsList(bigViewName);
        return res.send(data);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}