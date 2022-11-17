const connection = require('../models/connection');
const {STATUS_CODE,SORT_ORDER, ATTENDANCE, transport } = require('./constants');
const sendEmail = require('./mailHelpers');
const dataExporter = require('json2csv').Parser;
const tableify = require('html-tableify');
const cron = require('node-cron');

/**
 * for weekly reports' purpose, get all vuceptors that didn't log attendance in the past week 
 * @returns status code 
 */
const getVUCeptorThatUnlogFY = async () =>{
    const query = 
    `SELECT name, email, visions
    FROM users
    WHERE visions in (SELECT visions FROM mydb.fy_attendance
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 15 DAY) AND date <= CURDATE() 
    AND attendance = ?)`;

    const checkUnlogged = new Promise((resolve, reject) => {
        connection.query(query, [ATTENDANCE.NON_LOGGED],(err, res) => {
          if (err) reject(err);
          else resolve(res);
        })
    });

    try {
        const info = await checkUnlogged;
        return ({ status: STATUS_CODE.SUCCESS, result: info});
    } catch (e) {
        console.log(e);
        return ({ status: STATUS_CODE.ERROR});
    }
}

/**
 * for weekly reports' purpose, find the advisor's email to send the report to 
 * @returns status code
 */
const getAdvisorEmail = async() =>{
    const query = `SELECT email
    FROM users
    WHERE type = 'advisor'`;

    const searchEmail = new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
          if (err) reject(err);
          //only get the first advisor returned 
          else resolve(res[0]);
        })
    });

    try {
        const email = await searchEmail;
        return ({ status: STATUS_CODE.SUCCESS, result: email});
    } catch (e) {
        console.log(e);
        return ({ status: STATUS_CODE.ERROR});
    }
}

/**
 * send weekly reports to adviser 
 * @returns 
 */
const sendWeeklyReport = async () =>{
    try {
        const data = await getVUCeptorThatUnlogFY();
        const email = await getAdvisorEmail();
        if (data.status === STATUS_CODE.SUCCESS && email.status === STATUS_CODE.SUCCESS){
            const html = `<p> Below are the VUceptors who have yet logged their visions attendance in more than three days: </p>` 
            + tableify (data.result);
            const mailOptions = {
                from: process.env.MAIL_EMAIL,
                to: email.result.email,
                subject: 'VUcept Management Weekly Report',
                html: html
              };
            try {
                sendEmail.sendEmail(mailOptions);
                return ({status: STATUS_CODE.SUCCESS});
            } catch (e){
                console.log(e);
                return ({ status: STATUS_CODE.ERROR});
            }
        } else{
            return ({ status: STATUS_CODE.ERROR});
        }
    } catch (e) {
        console.log(e);
        return ({ status: STATUS_CODE.ERROR});
    }
  }

exports.scheduleWeeklyReports = async ()=>{
    //schedule for every friday 8am
    cron.schedule('0 8 * * 5', async function () {
        console.log('Running Cron Process');
        await sendWeeklyReport();
    });
}

//used for creating conditions in where clause 
exports.concateCommand = (type, prefix, conditions) =>{
    var cmd = '';
    if (type === 'string') {
        for (const condition of conditions){
            cmd +=  prefix + '\'' + condition  + '\'' + ' OR ';
       }
    } else if (type === 'int'){
        for (const condition of conditions){
           cmd += prefix + condition  + ' OR ';
       }
    }
    return '(' + cmd.substring(0, cmd.length - 3) + ')';
}

//read attendance based on time range, number of absences, sorting, and filtering 
exports.readAttendance = async (param, table) =>{
    //result of attendance should be before current time 
    const endTimeClause = ` CONCAT(date, " ", end_time) < CONVERT_TZ(NOW(),\'GMT\',\'US/Central\') AND `;
    //set time range, which will be passed in as array of size 2
    const timeRange = (!param.time_range) ? '' : JSON.parse(param.time_range);
    const dateClause =  timeRange  == '' ? '' : ' date >= \'' + timeRange[0] + '\' AND date <= \'' + timeRange[1] + '\' AND ';
    var tempWhere = ' WHERE ' + endTimeClause + dateClause 
    //check if number of absences are entered
    const numAbsence = (!param.num_absence) ? '' : param.num_absence;
    const absenceClause =  numAbsence == '' ? '' : 
    ` attendance = 'Absent' AND
        email in (
            SELECT email FROM ` + table + tempWhere + `
            attendance = 'Absent'
            GROUP BY email 
            HAVING count(*) >= ` + numAbsence + `) AND `;
    //create where clause based on time range and num absence 
    tempWhere += absenceClause;

    // check parameters: sort
    const sort_list = [param.name_sort, param.email_sort, param.visions_sort, param.events_sort, param.status_sort];
    for (const sort of sort_list){
        if (sort && (sort !== SORT_ORDER.ASC) && (sort !== SORT_ORDER.DESC)){
            console.log("SORT ERROR\n");
            return ({ status: STATUS_CODE.UNKNOWN_SORT});
        }
    }
    //sort conditions
    const name_sort = (!param.name_sort) ? '' : ' name ' + param.name_sort;
    const email_sort = (!param.email_sort) ? '' : ' email ' + param.email_sort;
    const visions_sort = (!param.visions_sort) ? '' : ' visions ' + param.visions_sort;
    const events_sort = (!param.events_sort) ? '' : ' title ' + param.events_sort;
    const status_sort = (!param.status_sort) ? '' : ' attendance ' + param.status_sort;
    //condition ordering
    const condition_order = (!param.condition_order) ? null : JSON.parse(param.condition_order);

    //create order by clause form sort conditions
    var tempOrderBy = 'ORDER BY';
    if (condition_order){
        for (const condition of condition_order){
            switch (condition) {
                case "name_sort":
                    tempOrderBy += name_sort + ',';
                    break;
                case "email_sort":
                    tempOrderBy += email_sort + ',';
                    break;
                case "visions_sort":
                    tempOrderBy += visions_sort + ',';
                    break;
                case "events_sort":
                    tempOrderBy += events_sort + ',';
                    break;
                case "status_sort":
                    tempOrderBy += status_sort + ',';
                    break;
            }
        }
    }
    //form the const order by clause and get rid of "," in the end
    const orderBy = (tempOrderBy === 'ORDER BY') ? '' : tempOrderBy.substring(0, tempOrderBy.length - 1);

    // pass in array for all search/filtering options
    const name_search = (!param.name_search) ? '' : {type: 'string', data : JSON.parse(param.name_search)};
    const email_search = (!param.email_search) ? '' : {type: 'string', data : JSON.parse(param.email_search)};
    const visions_filter = (!param.visions_filter) ? '' : {type: 'int', data : JSON.parse(param.visions_filter)};
    const events_filter = (!param.events_filter) ? '' : {type: 'string', data : JSON.parse(param.events_filter)};
    const status_filter = (!param.status_filter) ? '' : {type: 'string', data : JSON.parse(param.status_filter)};
    //number of rows to calculate pages
    const row_start = (!param.row_start) ? 0 : param.row_start;
    const row_num = (!param.row_num) ? 50 : param.row_num;

    // create where string from search and filter conditions
    const whereList = [name_search, email_search, status_filter, visions_filter, events_filter];
    const prefixList = ['name = ', 'email = ', 'attendance = ', 'visions = ', 'title = '];

    for (var i = 0; i < whereList.length; ++i){
        const whereData = whereList[i];
        if (whereData !== ''){
            tempWhere += concateCommand(whereData.type, prefixList[i], whereData.data) + ' AND ';
        }
    }
    //form the const where clause and get rid of "AND" in the end
    const where = (tempWhere.startsWith("AND ", tempWhere.length - 4)) ? tempWhere.substring(0, tempWhere.length - 4) : tempWhere;

    //form the query
    const query = `SELECT name, email, visions, title AS event, attendance AS status FROM ` + table
    + where + orderBy + ' LIMIT ' + row_num + ' OFFSET ' + row_start;
    const viewusers = new Promise((resolve, reject) => {
        connection.query(query,(err, res) => {
            if (err) reject(err);
            else resolve(res);
        })
    });
    
    //count number of pages 
    const queryCount = `SELECT COUNT(*) AS count FROM ` + table + where;
    const pages = new Promise((resolve, reject) => {
        connection.query(queryCount,(err, res) => {
            if (err) reject(err);
            else resolve(Math.ceil(res[0].count/row_num));
        })
    });

    try {
        const rows = await viewusers;
        const pageNum = await pages;
        return ({ status: STATUS_CODE.SUCCESS, result: {rows, pageNum}});
    } catch (error) {
        return ({ status: STATUS_CODE.ERROR, result: error });
    }
}

//check if there will be repeated attendance record
const checkExistingAttendance = async (userID, eventID, table) => {
    const personType = table === `vuceptor_attendance` ? `vuceptor_id` : `student_id`;
    const query = `SELECT COUNT(*) AS count FROM ` + table + ` WHERE ` + personType + ` = ? AND event_id = ?`;
    const performCheckExistingRecord= new Promise((resolve, reject) => {
        connection.query(query, [userID, eventID], (err, res) => {
          if (err) reject(err);
          else resolve(res[0]);
        })
    });

    try {
        const checkExistingRecordResult = await performCheckExistingRecord;
        if (checkExistingRecordResult.count === 0) {
            return {status: STATUS_CODE.NO_EXISTING_RECORDS};
        } else {
            return {status: STATUS_CODE.REPEATED_RECORDS};
        }
    } catch (e){
        console.log(e);
        return {status : STATUS_CODE.ERROR};
    }
}

/**
 * find a specific attendance record for a vuceptor at a particular event
 */
exports.getOneVUAttendance = async (param, table) =>{
    const {email, eventId} = param;
    // console.log(param)
    //check for id and event separately
    const checkPersonAndEventResult = await checkPersonAndEvent(email, eventId, table);
    if (checkPersonAndEventResult.status !== STATUS_CODE.SUCCESS) return (checkPersonAndEventResult);
    const personId = checkPersonAndEventResult.findPersonID.id;
    const personRowName = checkPersonAndEventResult.personRowName;
    //check validity of record
    const checkExistingResult = await checkExistingAttendance(personId, eventId, table);
    if (checkExistingResult.status !== STATUS_CODE.REPEATED_RECORDS) return (checkExistingResult);
    const query = `SELECT attendance from ` + table + ` WHERE ` + personRowName + ` = ? and event_id = ?`;

    const performFindAttendance = new Promise((resolve, reject) => {
        connection.query(query, [personId, eventId], (err, res) => {
          if (err) reject(err);
          else resolve(res[0]);
        })
    });

    try {
        const attendance = await performFindAttendance;
        if (attendance) {
            return {status: STATUS_CODE.SUCCESS, attendance: attendance.attendance};
        } else {
            return {status: STATUS_CODE.NO_EXISTING_RECORDS}
        }
    } catch (e){
        console.log(e);
        return {status : STATUS_CODE.ERROR};
    }

}

//find both student's and vuceptor's database id by their email 
const findPersonIDByEmail = async (email, table) =>{
    const personType = table === `users` ? ` user_id ` : ` student_id `;
    const query = 'SELECT ' + personType + ' FROM ' + table + ' WHERE email = ?';
    const performFindID = new Promise((resolve, reject) => {
        connection.query(query, email, (err, res) => {
          if (err) reject(err);
          else resolve(res[0]);
        })
    });

    try {
        const idResult = await performFindID;
        //distinction between vu attendance and student attendance
        if (table === 'users'){
            if (idResult) {
                return {status: STATUS_CODE.SUCCESS, id: idResult.user_id};
            } else {
                return {status: STATUS_CODE.INVALID_USER}
            }
        } else {
            if (idResult) {
                return {status: STATUS_CODE.SUCCESS, id: idResult.student_id};
            } else {
                return {status: STATUS_CODE.INVALID_STUDENT}
            }
        }
    } catch (e){
        console.log(e);
        return {status : STATUS_CODE.ERROR};
    }
}

/** 
 * find both student's and vuceptor's database event id by event titles 
*/
const validateEventID = async (eventId, table) =>{
    const query = 'SELECT event_id FROM ' + table + ' WHERE event_id = ' + eventId;
    const performFindID = new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
          if (err) reject(err);
          else resolve(res[0]);
        })
    });

    try {
        const eventId = await performFindID;
        if (eventId) {
            return {status: STATUS_CODE.SUCCESS, id: eventId.event_id};
        } else {
            return {status: STATUS_CODE.INVALID_EVENT}
        }
    } catch (e){
        console.log(e);
        return {status : STATUS_CODE.ERROR};
    }
}

/**
 * use findPersonId and validateEventId to validate the record
 * @param {string} email 
 * @param {number} eventId 
 * @param {string} table 
 * @returns 
 */
const checkPersonAndEvent = async (email, eventId, table) => {
    //find vuceptor id
    const personTable = table === `vuceptor_attendance` ? `users` : `students`;
    const personRowName = table === `vuceptor_attendance` ? `vuceptor_id` : `student_id`;
    const findPersonID = await findPersonIDByEmail(email, personTable);
    if (findPersonID.status != STATUS_CODE.SUCCESS) return (findPersonID);
    //find event id 
    const eventTable = table === `vuceptor_attendance` ? `vuceptor_events` : `student_events`;
    const findEventID = await validateEventID(eventId, eventTable);
    if (findEventID.status != STATUS_CODE.SUCCESS) return (findEventID);

    return ({status: STATUS_CODE.SUCCESS, findPersonID: findPersonID, personRowName : personRowName});
}
/**
 * insert an attendance record to VUceptor's attendance or student's attendance
 * @param {Object} param 
 * @param {string} table 
 * @returns status code
 */
exports.insertAttendance = async (param, table) =>{
    const {email, eventId, attendance} = param;
    //check for id and event separately
    const checkPersonAndEventResult = await checkPersonAndEvent(email, eventId, table);
    if (checkPersonAndEventResult.status !== STATUS_CODE.SUCCESS) return (checkPersonAndEventResult);
    const personId = checkPersonAndEventResult.findPersonID.id;
    const personRowName = checkPersonAndEventResult.personRowName;
    //check for insertion validity: id, event
    const checkRepeatResult = await checkExistingAttendance(personId, eventId, table);
    if (checkRepeatResult.status !== STATUS_CODE.NO_EXISTING_RECORDS) return (checkRepeatResult);

    //insert vuceptor attendance record
    const query = 'INSERT INTO ' + table + ' (' + personRowName + ', event_id, attendance) VALUES (?,?,?)';
    const addAttendance = new Promise((resolve, reject) => {
      connection.query(query, [personId, eventId, attendance], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      })
    });
    try {
        const addAttendanceResult = await addAttendance;
        if (addAttendanceResult.affectedRows){
            return ({status: STATUS_CODE.SUCCESS});
        }
    } catch (e){
        console.log(e);
        return ({status: STATUS_CODE.ERROR});
    }
}
/**
 * edit a particular attendance record using email, eventId, and incoming attendance
 * @param {Object} param 
 * @param {string} table 
 * @returns 
 */

exports.editAttendance = async (param, table) => {
    const {email, eventId, attendance} = param;
    //check for id and event separately
    const checkPersonAndEventResult = await checkPersonAndEvent(email, eventId, table);
    if (checkPersonAndEventResult.status !== STATUS_CODE.SUCCESS) return (checkPersonAndEventResult);
    const personId = checkPersonAndEventResult.findPersonID.id;
    const personRowName = checkPersonAndEventResult.personRowName;
    //check validity of record
    const checkExistingResult = await checkExistingAttendance(personId, eventId, table);
    if (checkExistingResult.status !== STATUS_CODE.REPEATED_RECORDS) return (checkExistingResult);
    //update vuceptor attendance record
    const query = `UPDATE ` + table + ` SET attendance = ? WHERE ` + personRowName + ` = ? AND event_id = ?;`;
    const editAttendance = new Promise((resolve, reject) => {
      connection.query(query, [attendance, personId, eventId], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      })
    });
    try {
        const editAttendanceResult = await editAttendance;
        if (editAttendanceResult.affectedRows){
            return ({status: STATUS_CODE.SUCCESS});
        }
    } catch (e){
        console.log(e);
        return ({status: STATUS_CODE.ERROR});
    }
}

/**
 * delete an exiting record using email and eventId to locate a record
 * @param {Object} param 
 * @param {string} table 
 * @returns 
 */
exports.deleteAttendance = async (param, table) =>{
    const {email, eventId} = param;
    //check for id and event separately
    const checkPersonAndEventResult = await checkPersonAndEvent(email, eventId, table);
    if (checkPersonAndEventResult.status !== STATUS_CODE.SUCCESS) return (checkPersonAndEventResult);
    const personId = checkPersonAndEventResult.findPersonID.id;
    const personRowName = checkPersonAndEventResult.personRowName;
    //check validity of record
    const checkExistingResult = await checkExistingAttendance(personId, eventId, table);
    if (checkExistingResult.status !== STATUS_CODE.REPEATED_RECORDS) return (checkExistingResult);
    //update vuceptor attendance record
    const query = `DELETE FROM ` + table + ` WHERE ` + personRowName + ` = ? AND event_id = ?;`;
    const deleteAttendance = new Promise((resolve, reject) => {
      connection.query(query, [personId, eventId], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      })
    });
    try {
        const deleteAttendanceResult = await deleteAttendance;
        if (deleteAttendanceResult.affectedRows){
            return ({status: STATUS_CODE.SUCCESS});
        }
    } catch (e){
        console.log(e);
        return ({status: STATUS_CODE.ERROR});
    }
}

/**
 * use the cached value to export csv file
 * @param {Object} currentRead 
 * @returns the csv data of the current read view
 */
exports.exportAttendance = async (currentRead) =>{
    if (currentRead){
        //convert JSON to CSV Data
        var fileHeader = ['Name', 'Email', 'Visions', 'Event', 'Status'];
        var jsonData = new dataExporter({fileHeader});
        var csvData = jsonData.parse(currentRead);
        return ({status: STATUS_CODE.SUCCESS, data: csvData});
    } else {
        return ({status: STATUS_CODE.EMPTY_DATA});
    }
}

/**
 * get all possible visions list from students' or users' table 
 * @param {string} table 
 * @returns an integer array with possible visions 
 */
exports.getVisionsList = async (table) =>{
    const query = `SELECT DISTINCT visions from ` + table;
    const getVisions = new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      })
    });
    try {
        const visionsResults = await getVisions;
        var visionsArray = [];
        for (const result of visionsResults){
            visionsArray.push(result.visions);
        }
        return ({status: STATUS_CODE.SUCCESS, data: visionsArray});
    } catch (e){
        console.log(e);
        return ({status: STATUS_CODE.ERROR});
    }
}

/**
 * get all possible events for the attendance dropdown before current time
 * @param {string} table 
 * @returns 
 */
exports.getEventsList = async (table) =>{
    console.log(table)
    const where = ` WHERE CONCAT(date, " ", end_time) < CONVERT_TZ(NOW(),\'GMT\',\'US/Central\') `;
    const query = `SELECT DISTINCT title , event_id from ` + table + where;;
    const getEvents = new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      })
    });
    try {
        const eventsResults = await getEvents;
        return ({status: STATUS_CODE.SUCCESS, data: eventsResults});
    } catch (e){
        console.log(e);
        return ({status: STATUS_CODE.ERROR});
    }
}