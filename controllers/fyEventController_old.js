const connection = require('../models/connection');
const { STATUS_CODE } = require('../lib/constants');
const eventHelpers = require('../lib/eventHelpers');
const sharedHelpers = require('../lib/sharedHelpers');

// Shared functions: insertUser
exports.addfyEvent = ({title, date, start_time, description, location, end_time, week, visions}) => {
  const query = 'INSERT INTO student_events (title, date, start_time, description, location, end_time, week, visions) VALUES (?,?,?,?,?,?,?,?)';

  const promise = new Promise((resolve, reject) => {
    connection.query(query, [title, date, start_time, description, location, end_time, week, visions], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
};

exports.readfyEvent =  async (req, res) => {
  const title = (!req.query.title) ? '' : ' AND (title = \'' + req.query.title + '\')' ;

  //set time range, which will be passed in as array of size 2
  const timeRange = (!req.query.time_range) ? '' : JSON.parse(req.query.time_range);
  const dateClause =  timeRange  == '' ? '' : ' (date >= \'' + timeRange[0] + '\' AND date <= \'' + timeRange[1] + '\')';

  var query = 'SELECT * FROM student_events';
  if ((dateClause != '') || (title != '')){
    query = query + ' WHERE ' + dateClause + title;
  }

  const readEvent = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  try {
      const events = await readEvent;
      return res.send({ status: STATUS_CODE.SUCCESS, result: events });
  } catch (err){
      return res.send({status: STATUS_CODE.ERROR});
  }
}

exports.readfyEventDashboard =  async (req, res) => {
  const title_sort = (!req.query.name_sort) ? '' : ' name ' + req.query.name_sort;
  const date_sort = (!req.query.email_sort) ? '' : ' email ' + req.query.email_sort;
  const week_sort = (!req.query.visions_sort) ? '' : ' visions ' + req.query.visions_sort;
  const condition_order = (!req.query.condition_order) ? null : JSON.parse(req.query.condition_order);

  // pass in array for all search/filtering options
  const title_search = (!req.query.name_search) ? '' : {type: 'string', data: JSON.parse(req.query.name_search)};
  const location_search = (!req.query.name_search) ? '' : {type: 'string', data: JSON.parse(req.query.name_search)};
  const visions_search = (!req.query.name_search) ? '' : {type: 'int', data: JSON.parse(req.query.name_search)};
  const date_filter = (!req.query.email_search) ? '' : {type: 'string', data: JSON.parse(req.query.email_search)};
  const start_time_filter = (!req.query.visions_filter) ? '' : {type: 'string', data: JSON.parse(req.query.visions_filter)};
  const end_time_filter = (!req.query.status_filter) ? '' : {type: 'string', data: JSON.parse(req.query.status_filter)};
  const location_filter = (!req.query.type_filter) ? '' : {type: 'string', data: JSON.parse(req.query.type_filter)};
  const week_filter = (!req.query.type_filter) ? '' : {type: 'int', data: JSON.parse(req.query.type_filter)};
  const visions_filter = (!req.query.type_filter) ? '' : {type: 'int', data: JSON.parse(req.query.type_filter)};

  const row_start = (!req.query.row_start) ? 0 : req.query.row_start;
  const row_num = (!req.query.row_num) ? 50 : req.query.row_num;

  // check parameters: sort
  const sort_list = [req.query.title_sort, req.query.date_sort, req.query.week_sort];
  for (var i = 0; i < sort_list.length; ++i) {
      if (sort_list[i] && (sort_list[i] !== SORT_ORDER.ASC) && (sort_list[i] !== SORT_ORDER.DESC)) {
          console.log("SORT ERROR\n");
          return res.send({status: STATUS_CODE.UNKNOWN_SORT});
      }
  }

  // create where string
  var tempWhere = ' WHERE ';
  const where_list = [title_search, location_search, visions_search, date_filter, start_time_filter, end_time_filter, location_filter, week_filter, visions_filter];
  const prefix_list = ['title = ', 'location = ', 'visions = ', 'date = ', 'start_time = ', 'end_time = ', 'location = ', 'week = ', 'visions = '];
  for (let i = 0; i < where_list.length; i++) {
      const where_data = where_list[i];
      if (where_data !== '') {
          tempWhere += sharedHelpers.concateCommand(where_data.type, prefix_list[i], where_data.data) + ' AND ';
      }
  }
  var where = '';
  if (tempWhere !== ' WHERE ') {
      where = tempWhere.startsWith(' AND ', tempWhere.length - 5) ? tempWhere.substring(0, tempWhere.length - 4) : tempWhere;
  }

  // create orderBy string
  // ORDER BY A, B will first order database by A, if A is the same then order by B
  // if condition_order is given, it will only contain sorting conditions within condition_order
  var tempOrderBy = ' ORDER BY ';
  if (condition_order) {
      for (const condition of condition_order) {
          switch (condition) {
              case "title_sort":
                  tempOrderBy += title_sort + ',';
                  break;
              case "date_sort":
                  tempOrderBy += date_sort + ',';
                  break;
              case "week_sort":
                  tempOrderBy += week_sort + ',';
                  break;
          }
      }
  }

  const orderBy = (tempOrderBy === ' ORDER BY ') ? '' : tempOrderBy.substring(0, tempOrderBy.length - 1);

  const query = 'SELECT * FROM student_events ' + where + orderBy +
  ' LIMIT ' + row_num + ' OFFSET ' + row_start;

  const viewVUEvents = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  //calculate the number of pages
  const queryCount = "SELECT COUNT(*) AS count FROM student_events" + where;
  const pageCount = new Promise((resolve, reject) => {
    connection.query(queryCount, (err, res) => {
      if (err) reject(err);
      else resolve(Math.ceil(res[0].count / row_num));
    })
  });

  try {
      var rows = await viewVUEvents;
      var pages = await pageCount;
      return res.send({status: STATUS_CODE.SUCCESS, result: {rows, pages}});
  } catch (err){
      return res.send({status: STATUS_CODE.ERROR});
  }
}

exports.createfyEvent =  async (req, res) => {
    const {title, date, start_time, description, location, end_time, week, visions} = req.body;

    try {
      let addEventResult = await this.addfyEvent({title, date, start_time, description, location, end_time, week, visions});

      let getId = await eventHelpers.getEventId('student_events');
      let getAllPerson = await eventHelpers.getAllPersonId('students');
  
      await eventHelpers.insertEventAttendance(getId.ID, getAllPerson, 'student_id', 'student_attendance', 'student_id');

      if (addEventResult.affectedRows){
        return res.send({ status: STATUS_CODE.SUCCESS });
      }
    } catch (err){
        console.log(err);
        return res.send({ status: STATUS_CODE.ERROR });
    }
}

exports.updatefyEvent =  async (req, res) => {
  const {title, date, start_time, description, location, end_time, week, visions, event_id} = req.body;
  const query = 'UPDATE student_events SET title = ?, date = ?, start_time = ?, description = ?, location = ?, end_time = ?, week = ?, visions = ? WHERE event_id = ?';

  try {
      const updateEvent = new Promise((resolve, reject) => {
        connection.query(query, [title, date, start_time, description, location, end_time, week, visions, event_id], (err, res) => {
          if (err) reject(err);
          else resolve(res);
        })
      });

      await updateEvent;
      return res.send({ status: STATUS_CODE.SUCCESS });
  } catch (err){
      return res.send({status: STATUS_CODE.ERROR});
  }
}

exports.deletefyEvent =  async (req, res) => {
  const event_id = req.body.event_id;

  const query = 'DELETE FROM student_events WHERE event_id = ' + event_id;
  

  try {
    let verify = await eventHelpers.verifyEvent(event_id, 'student_events');

    if (verify.NUM == 0) {
        return res.send({ status: STATUS_CODE.INCORRECT_EVENT_ID });
    }

    const deleteEvent = new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      })
    });

    let result = await deleteEvent;
    if (result.affectedRows) {
        return res.send({status: STATUS_CODE.SUCCESS});
    }
  } catch (error) {
    return res.send({status: STATUS_CODE.ERROR});
  }
}

//reset the first year events
exports.resetfyEvent = async (req, res) => {
  const query = 'DELETE FROM student_events;';

  const reset = new Promise((resolve, reject) => {
      connection.query(query, (err, res) => {
          if (err) reject(err);
          else resolve(res);
      })
  });

  try {
      await reset;
      return res.send({status: STATUS_CODE.SUCCESS});
  } catch (error) {
      return res.send({status: STATUS_CODE.ERROR});
  }
};

exports.fyEventLoadfromcsv = async (req, res) => {
    const {file} = req.body;

    // Fetching the data from each row
    // and inserting to the table
    for (var i = 0; i < file.length; i++) {
        var title = file[i]["title"],
        date = file[i]["date"],
        start_time = file[i]["start_time"],
        description = file[i]["description"],
        location = file[i]["location"],
        end_time = file[i]["end_time"],
        week = file[i]["week"],
        visions = file[i]["visions"];

        try {
          await this.addfyEvent({title, date, start_time, description, location, end_time, week, visions});
          
          let getId = await eventHelpers.getEventId('student_events');
          let getAllPerson = await eventHelpers.getAllPersonId('students');
          await eventHelpers.insertEventAttendance(getId.ID, getAllPerson, 'student_id', 'student_attendance', 'student_id');
        } catch (error) {
            return res.send({status: STATUS_CODE.ERROR});
        }
    }

    return res.send({status: STATUS_CODE.SUCCESS});
}