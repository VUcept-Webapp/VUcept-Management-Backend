const {STATUS_CODE, TYPE} = require('../lib/constants');
const attendanceManager = require('../lib/attendanceHelpers');
const actualTableName = `student_attendance`;
const bigViewName = `fy_attendance`;

//global variable to cache current read data 
var currentRead;

/**
 * send weekly reports on what students are missing and 
 * what VUceptors are not logging attednace to the adviser 
 * @param {Object} req 
 * @param {Object} res 
 * @returns status of the operation 
 */
exports.sendAdviserWeeklyReport = async (req, res) =>{
    if (req.type != TYPE.ADVISER)  {
        console.log(req.type)
        return res.send({status : STATUS_CODE.FORBIDDEN})
    }
    try {
        const sendReport = await attendanceManager.sendAdviserWeeklyReport();
        return res.send(sendReport);
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}

/**
 * The first-year attendance view conforming to different sorting and searching requests 
 * only the adviser would be able to see this page
 * @param {} req 
 * @param {*} res 
 * @returns the first-year attednace read data 
 */
exports.readFyAttendance = async (req, res) => {
    if (req.type != TYPE.ADVISER)  {
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
exports.insertFyAttendance =  async (req, res) => {
    if (req.type != TYPE.ADVISER && req.type != TYPE.VUCEPTOR)  {
        console.log(req.type)
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
 * edit an existing first-year attendance record; if it does not already exist, insert a new one
 * only the adviser or VUceptor are able to perform this oparation 
 * @param {Object} req 
 * @param {Object} res 
 * @returns the status of the oepration 
 */
exports.editFyAttendance =  async (req, res) => {
    if (req.type != TYPE.ADVISER && req.type != TYPE.VUCEPTOR)  {
        console.log(req.type)
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
 * delete a specific First-year attendance record 
 * @param {Object} req 
 * @param {Object} res 
 * @returns teh status of the operation 
 */
exports.deleteFyAttendance =  async (req, res) => {
    if (req.type != TYPE.ADVISER && req.type != TYPE.VUCEPTOR)  {
        console.log(req.type)
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
 * provides csv raw data of the last read FY atteandance view 
 * only the adviser will be able to perform the opration 
 * @param {Object} req 
 * @param {Object} res 
 * @returns the csv data of the last read FY attendance view
 */
exports.exportFyAttendance =  async (req, res) => {
    if (req.type != TYPE.ADVISER)  {
        console.log(req.type)
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
 * only adviser will be able to access read view and thus this API 
 * @param {Object} req 
 * @param {Object} res 
 * @returns the available visions numbers in the system
 */
exports.getFyAttendanceVisionsList =  async (req, res) => {
    if (req.type != TYPE.ADVISER)  {
        console.log(req.type)
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
 * get the existing first-year events in the system for the drop down on the read view 
 * only adviser will be able to access read view and thus this API 
 * @param {Object} req 
 * @param {Object} res 
 * @returns the available first-year events in the system
 */
exports.getFyAttendanceEventsList =  async (req, res) => {
    if (req.type != TYPE.ADVISER )  {
        console.log(req.type)
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