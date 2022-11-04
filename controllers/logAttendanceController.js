const connection = require('../models/connection');
const attendanceManager = require('../lib/attendanceHelpers');
const {STATUS_CODE,SORT_ORDER } = require('../lib/constants');

exports.readLogAttendance = async (req, res) => {
    // check req.queryeters: sort
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
    const name_search = (!req.query.name_search) ? '' : {type: 'string', data : JSON.parse(req.query.name_search)};
    const email_search = (!req.query.email_search) ? '' : {type: 'string', data : JSON.parse(req.query.email_search)};
    const event = (!req.query.event) ? '' : {type: 'string', data : JSON.parse(req.query.event)};
    //number of rows to calculate pages
    const row_start = (!req.query.row_start) ? 0 : req.query.row_start;
    const row_num = (!req.query.row_num) ? 50 : req.query.row_num;

    // create where string from search conditions
    var tempWhere = `WHERE date = CURDATE() AND `;
    const whereList = [name_search, email_search, event];
    const prefixList = ['name = ', 'email = ', 'title = '];

    for (var i = 0; i < whereList.length; ++i){
        const whereData = whereList[i];
        if (whereData !== ''){
            tempWhere += attendanceManager.concateCommand(whereData.type, prefixList[i], whereData.data) + ' AND ';
        }
    }
    //form the const where clause and get rid of "AND" in the end
    const where = (tempWhere.startsWith("AND ", tempWhere.length - 4)) ? tempWhere.substring(0, tempWhere.length - 4) : tempWhere;

    //form the query
    const query = `SELECT name, email, attendance FROM fy_attendance `
    + where + orderBy + ' LIMIT ' + row_num + ' OFFSET ' + row_start;
    const viewusers = new Promise((resolve, reject) => {
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