// const {STATUS_CODE } = require('../lib/constants');
// const attendanceManager = require('../lib/attendanceHelpers');
// const actualTableName = `student_attendance`;
// const bigViewName = `fy_attendance`;

// //global variable to cache current read data 
// var currentRead;

// exports.readFyAttendance = async (req, res) => {
//     try {
//         const readAttendance = await attendanceManager.readAttendance(req.query, bigViewName);
//         //cache most recent read
//         currentRead = readAttendance.result.rows;
//         return res.send(readAttendance);
//     } catch (e){
//         console.log(e);
//         return res.send({status: STATUS_CODE.ERROR});
//     }
// }

// exports.insertFyAttendance =  async (req, res) => {
//     try {
//         const insertAttendance = await attendanceManager.insertAttendance(req.body, actualTableName);
//         return res.send(insertAttendance);
//     } catch (e){
//         console.log(e);
//         return res.send({status: STATUS_CODE.ERROR});
//     }
// }

// exports.editFyAttendance =  async (req, res) => {
//     try {
//         const editAttendance = await attendanceManager.editAttendance(req.body, actualTableName);
//         return res.send(editAttendance);
//     } catch (e){
//         console.log(e);
//         return res.send({status: STATUS_CODE.ERROR});
//     }
// }

// exports.deleteFyAttendance =  async (req, res) => {
//     try {
//         const deleteAttendance = await attendanceManager.deleteAttendance(req.body, actualTableName);
//         return res.send(deleteAttendance);
//     } catch (e){
//         console.log(e);
//         return res.send({status: STATUS_CODE.ERROR});
//     }
// }

// exports.exportFyAttendance =  async (req, res) => {
//     try {
//         const data = await attendanceManager.exportAttendance(currentRead);
//         return res.send(data);
//     } catch (e){
//         console.log(e);
//         return res.send({status: STATUS_CODE.ERROR});
//     }
// }

// exports.getFyAttendanceVisionsList =  async (req, res) => {
//     try {
//         const data = await attendanceManager.getVisionsList(bigViewName);
//         return res.send(data);
//     } catch (e){
//         console.log(e);
//         return res.send({status: STATUS_CODE.ERROR});
//     }
// }

// exports.getFyAttendanceEventsList =  async (req, res) => {
//     try {
//         const data = await attendanceManager.getEventsList(bigViewName);
//         return res.send(data);
//     } catch (e){
//         console.log(e);
//         return res.send({status: STATUS_CODE.ERROR});
//     }
// }