const connection = require('../models/connection');
const {STATUS_CODE,SORT_ORDER} = require('../lib/constants');
const attendanceManager = require('../lib/attendanceHelpers');

exports.readLogAttendance = async (req, res) => {
    // check req.query parameters: sort
    const sort_list = [req.query.name_sort, req.query.email_sort];
    for (const sort of sort_list){
        if (sort && (sort !== SORT_ORDER.ASC) && (sort !== SORT_ORDER.DESC)){
            console.log("SORT ERROR\n");
            return res.send({ status: STATUS_CODE.UNKNOWN_SORT});
        }
    }
    //sort conditions
    const name_sort = (!req.query.name_sort) ? '' : ' name ' + req.query.name_sort;
    const email_sort = (!req.query.email_sort) ? '' : ' email ' + req.query.email_sort;
    //condition ordering
    const condition_order = (!req.query.condition_order) ? null : JSON.parse(req.query.condition_order);
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
            }
        }
    }
    //form the const order by clause and get rid of "," in the end
    const orderBy = (tempOrderBy === 'ORDER BY') ? '' : tempOrderBy.substring(0, tempOrderBy.length - 1);

    // pass in array for all search/filtering options
    const name_search = (!req.query.name_search) ? '' : ' name = \'' + JSON.parse(req.query.name_search) + `\' AND `;
    const email_search = (!req.query.email_search) ? '' : ' email = \'' +  JSON.parse(req.query.email_search)  + `\' AND `;
    const event = (!req.query.event) ? '' : ' title = \'' + JSON.parse(req.query.event) + `\' AND `;
    const visions = ' visions = ' + req.query.visions + ' ';
    //number of rows to calculate pages
    const row_start = (!req.query.row_start) ? 0 : req.query.row_start;
    const row_num = (!req.query.row_num) ? 50 : req.query.row_num;
    
    //form the const where clause where visions is required 
    const where = ` WHERE date = CURDATE() AND ` + name_search + email_search + event + visions;

    //form the query
    const query = `SELECT name, email, attendance FROM fy_attendance `
    + where + orderBy + ' LIMIT ' + row_num + ' OFFSET ' + row_start;
    const viewusers = new Promise((resolve, reject) => {
        console.log(query)
        connection.query(query,(err, res) => {
            if (err) reject(err);
            else resolve(res);
        })
    });
    
    //count number of pages 
    const queryCount = `SELECT COUNT(*) AS count FROM fy_attendance ` + where;
    const pages = new Promise((resolve, reject) => {
        connection.query(queryCount,(err, res) => {
            if (err) reject(err);
            else resolve(Math.ceil(res[0].count/row_num));
        })
    });

    try {
        const rows = await viewusers;
        const pageNum = await pages;
        return res.send({ status: STATUS_CODE.SUCCESS, result: {rows, pageNum}});
    } catch (error) {
        return res.send({ status: STATUS_CODE.ERROR, result: error });
    }
}

exports.submit = async (req, res) =>{
    const edits = req.body;
    for (const edit of edits){
        try {
            const editResult = await attendanceManager.editAttendance(edit, `student_attendance`);
            if (editResult.status !== STATUS_CODE.SUCCESS) return res.send(editResult);
        } catch (e){
            console.log(e);
            return res.send({status: STATUS_CODE.ERROR});
        }
    }
    return res.send({ status: STATUS_CODE.SUCCESS});
}

exports.getLogVisionsEvents = async (req, res) =>{
    const visions = req.query.visions;
    const query = `SELECT DISTINCT title from student_events WHERE visions = ?`;
    const getEvents = new Promise((resolve, reject) => {
      connection.query(query, [visions], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      })
    });
    try {
        const eventsResults = await getEvents;
        var eventsArray = [];
        for (const result of eventsResults){
            eventsArray.push(result.title);
        }
        return res.send({status: STATUS_CODE.SUCCESS, data: eventsArray});
    } catch (e){
        console.log(e);
        return res.send({status: STATUS_CODE.ERROR});
    }
}