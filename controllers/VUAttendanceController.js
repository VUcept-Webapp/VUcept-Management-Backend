const {STATUS_CODE, TYPE } = require('../lib/constants');
const attendanceManager = require('../lib/attendanceHelpers');
const actualTableName = `vuceptor_attendance`;
const bigViewName = `vu_attendance`;

//global variable to cache current read data 
var currentRead;

/**
 * The VUceptor attendance view conforming to different sorting and searching requests 
 * only the adviser and board member would be able to see this page
 * @param {} req 
 * @param {*} res 
 * @returns the VU attednace read data 
 */
exports.readVUAttendance = async (req, res) => {
    if (req.type != TYPE.ADVISER && req.type != TYPE.BOARD)  {
        console.log(req.type)
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
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

/**
 * insert a not-alreay-existing record into the database; 
 * only the adviser or VUceptor are able to perform this oparation 
 * @param {Object} req 
 * @param {Object} res 
 * @returns the status of the oepration 
 */
exports.insertVUAttendance =  async (req, res) => {
    if (req.type != TYPE.ADVISER && req.type != TYPE.VUCEPTOR) {
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    try {
        const insertAttendance = await attendanceManager.insertAttendance(req.body, actualTableName);
        return res.send(insertAttendance);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

/**
 * edit an existing VU attendance record; if it does not already exist, insert a new one
 * only the adviser or VUceptor are able to perform this oparation 
 * @param {Object} req 
 * @param {Object} res 
 * @returns the status of the oepration 
 */
exports.editVUAttendance =  async (req, res) => {
    if (req.type != TYPE.ADVISER && req.type != TYPE.VUCEPTOR) {
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    try {
        const editAttendance = await attendanceManager.editAttendance(req.body, actualTableName);
        return res.send(editAttendance);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

/**
 * delete a specific VUceptor attendance record 
 * @param {Object} req 
 * @param {Object} res 
 * @returns teh status of the operation 
 */
exports.deleteVUAttendance =  async (req, res) => {
    if (req.type != TYPE.ADVISER && req.type != TYPE.VUCEPTOR) {
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    try {
        const deleteAttendance = await attendanceManager.deleteAttendance(req.body, actualTableName);
        return res.send(deleteAttendance);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

/**
 * provides csv raw data of the last read VU atteandance view 
 * only the adviser or the board member will be able to perform the opration 
 * @param {Object} req 
 * @param {Object} res 
 * @returns the csv data of the last read VU attendance view
 */
exports.exportVUAttendance =  async (req, res) => {
    if (req.type != TYPE.ADVISER && req.type != TYPE.BOARD) {
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    try {
        const data = await attendanceManager.exportAttendance(currentRead);
        return res.send(data);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

/**
 * get the existing visions numbers in the system for the drop down on the read view 
 * only adviser and board members will be able to access read view and thus this API 
 * @param {Object} req 
 * @param {Object} res 
 * @returns the available visions numbers in the system
 */
exports.getVUAttendanceVisionsList =  async (req, res) => {
    if (req.type != TYPE.ADVISER && req.type != TYPE.BOARD) {
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    try {
        const data = await attendanceManager.getVisionsList(bigViewName);
        return res.send(data);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

/**
 * get the existing VUceptor events in the system for the drop down on the read view 
 * only adviser and board members will be able to access read view and thus this API 
 * @param {Object} req 
 * @param {Object} res 
 * @returns the available VUceptor events in the system
 */
exports.getVUAttendanceEventsList =  async (req, res) => {
    if (req.type != TYPE.ADVISER && req.type != TYPE.BOARD)  {
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    try {
        const data = await attendanceManager.getEventsList(bigViewName);
        return res.send(data);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}