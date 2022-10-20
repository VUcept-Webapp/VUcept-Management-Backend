const connection = require('../models/connection');
const {STATUS_CODE,SORT_ORDER } = require('../lib/constants');

const concateCommand = (type, conditions) =>{
    var cmd = '';
    if (type === 'string') {
        for (const condition of conditions){
            cmd +=  '\'' + condition  + '\'' + ' OR ';
       }
    } else if (type === 'int'){
        for (const condition of conditions){
           cmd += condition  + ' OR ';
       }
    }
    return cmd.substring(0, cmd.length - 4);
}

exports.readVUAttendance = async (req, res) => {
    // check parameters: sort
    const sort_list = [req.query.name_sort, req.query.email_sort, req.query.visions_sort, req.query.events_sort, req.query.status_sort];
    for (const sort of sort_list){
        if (sort && (sort !== SORT_ORDER.ASC) && (sort !== SORT_ORDER.DESC)){
        console.log("SORT ERROR\n");
        return res.send({ status: STATUS_CODE.UNKNOWN_SORT});
        }
    }
    //sort conditions
    const name_sort = (!req.query.name_sort) ? '' : ' name ' + req.query.name_sort;
    const email_sort = (!req.query.email_sort) ? '' : ' email ' + req.query.email_sort;
    const visions_sort = (!req.query.visions_sort) ? '' : ' visions ' + req.query.visions_sort;
    const events_sort = (!req.query.events_sort) ? '' : ' event ' + req.query.events_sort;
    const status_sort = (!req.query.status_sort) ? '' : ' status ' + req.query.status_sort;
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
    const name_search = (!req.query.name_search) ? '' : {type: 'string', data : JSON.parse(req.query.name_search)};
    const email_search = (!req.query.email_search) ? '' : {type: 'string', data : JSON.parse(req.query.email_search)};
    const visions_filter = (!req.query.visions_filter) ? '' : {type: 'int', data : JSON.parse(req.query.visions_filter)};
    const events_filter = (!req.query.events_filter) ? '' : {type: 'string', data : JSON.parse(req.query.events_filter)};
    const status_filter = (!req.query.status_filter) ? '' : {type: 'string', data : JSON.parse(req.query.status_filter)};
    //number of rows to calculate pages
    const row_start = (!req.query.row_start) ? 0 : req.query.row_start;
    const row_num = (!req.query.row_num) ? 50 : req.query.row_num;

    // create where string from search and filter conditions
    var tempWhere = 'WHERE ';
    const whereList = [name_search, email_search, status_filter, visions_filter, events_filter];
    const prefixList = ['name = ', 'email = ', 'status = ', 'visions = ', 'event = '];

    for (var i = 0; i < whereList.length; ++i){
        const whereData = whereList[i];
        if (whereData !== ''){
            const whereClause = prefixList[i] + concateCommand(whereData.type, whereData.data);
            tempWhere += whereClause + ' AND ';
        }
    }
    //form the const where clause and get rid of "AND" in the end
    const where = (tempWhere === 'WHERE ') ? '' : tempWhere.substring(0, tempWhere.length - 4);

    //form the query
    const query = `SELECT * FROM vu_attendance ` + where + orderBy + ' LIMIT ' + row_num + ' OFFSET ' + row_start;
    const viewusers = new Promise((resolve, reject) => {
        connection.query(query, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        })
      });
    //count number of pages 
    const queryCount = `SELECT COUNT(*) AS count FROM vu_attendance`;
    var pages = 0;
    await connection.promise().query(queryCount)
    .then(data => {
        pages = Math.ceil(data[0][0].count/row_num);
    })
    .catch(error => {
        console.log(error);
    });

    try {
        const rows = await viewusers;
        // const pages = countPages(vu_attendance);
        return res.send({ status: STATUS_CODE.SUCCESS, result: {rows, pages}});
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

//check if an event exists in the database
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

//check if a user exists in the database
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

//check if there will be repeated attendance record
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
