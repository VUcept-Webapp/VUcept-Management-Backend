const connection = require('../models/connection');
const { STATUS_CODE } = require('../lib/constants');
const eventHelpers = require('../lib/eventHelpers');

// Shared functions: insertUser
exports.addEventAgg = ({title, date, description, is_common}) => {
  const query = 'INSERT INTO student_events_aggregate (title, date, description, is_common) VALUES (?,?,?,?)';

  const promise = new Promise((resolve, reject) => {
    connection.query(query, [title, date, description, is_common], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
};

exports.addEventComm = (event_id, start_time, end_time, location) => {
  const query = 'INSERT INTO common_events (event_id, start_time, end_time, location) VALUES (?,?,?,?);';

  const promise = new Promise((resolve, reject) => {
    connection.query(query, [event_id, start_time, end_time, location], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
};

// require parameters time_range, visions
// can only return the monday for the event
exports.readfyEvent =  async (req, res) => {
  //set time range, which will be passed in as array of size 2
  const timeRange = (!req.query.time_range) ? '' : JSON.parse(req.query.time_range);
  const dateClause =  timeRange  == '' ? '' : ' WHERE (student_events_aggregate.date >= \'' + timeRange[0] + '\' AND student_events_aggregate.date <= \'' + timeRange[1] + '\')';

  var query = ' SELECT student_events_aggregate.event_id, student_events_aggregate.title, student_events_aggregate.description, student_events_aggregate.date, visions_info.start_time, visions_info.end_time, visions_info.location, visions_info.day' + 
              ' FROM mydb.student_events_aggregate ' + 
              ' CROSS JOIN mydb.visions_info ' +
              dateClause + 
              ' AND visions_info.visions = ' + req.query.visions + 
              ' AND student_events_aggregate.is_common = 0' + 
              ' UNION ' +
              ' SELECT student_events_aggregate.event_id, student_events_aggregate.title, student_events_aggregate.description, student_events_aggregate.date, common_events.start_time, common_events.end_time, common_events.location, NULL as day ' +
              ' FROM mydb.student_events_aggregate ' +
              ' JOIN mydb.common_events ON common_events.event_id = student_events_aggregate.event_id ' +
              dateClause + 
              ' AND student_events_aggregate.is_common = 1';

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

exports.createfyEvent =  async (req, res) => {
    const {title, date, description, is_common, start_time, end_time, location} = req.body;

    try {
      if (is_common == 0){
        let addEventResult = await this.addEventAgg({title, date, description, is_common});
      } else {
        await this.addEventAgg({title, date, description, is_common});
        let getId = await eventHelpers.getEventId('student_events_aggregate');

        let addEventResult = await this.addEventComm(getId.ID, start_time, end_time, location);
      }
      
      if (addEventResult.affectedRows){
        return res.send({ status: STATUS_CODE.SUCCESS });
      }
    } catch (err){
        console.log(err);
        return res.send({ status: STATUS_CODE.ERROR });
    }
}

exports.updatefyEvent =  async (req, res) => {
  const {title, date, description, is_common, visions, start_time, location, end_time, day, event_id} = req.body;
  var queryAgg = '';
  var queryComm = '';

  if (is_common == 0){
    var queryAgg = 'UPDATE student_events_aggregate SET title = ?, date = ?, description = ?, is_common = ? WHERE event_id = ?;' + 
    'UPDATE visions_info SET start_time = ?, end_time = ?, location = ?, day = ? WHERE visions = ?';
  } else {
    var queryComm = 'UPDATE student_events_aggregate SET title = ?, date = ?, description = ?, is_common = ? WHERE event_id = ?;' + 
    'UPDATE common_events SET start_time = ?, end_time = ?, location = ? WHERE event_id = ?';
  }
  
  try {
      if (is_common == 0){
        var updateEvent = new Promise((resolve, reject) => {
          connection.query(queryAgg, [title, date, description, is_common, event_id, start_time, end_time, location, day, visions], (err, res) => {
            if (err) reject(err);
            else resolve(res);
          })
        });
      } else {
        var updateEvent = new Promise((resolve, reject) => {
          connection.query(queryComm, [title, date, description, is_common, event_id, start_time, end_time, location, event_id], (err, res) => {
            if (err) reject(err);
            else resolve(res);
          })
        });
      }

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
  const query = 'DELETE FROM student_events_aggregate; DELETE FROM common_events; DELETE FROM visions_info;';

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

exports.fyVisionsEventLoadfromcsv = async (req, res) => {
    const {file} = req.body;

    // Fetching the data from each row
    // and inserting to the table
    for (var i = 0; i < file.length; i++) {
        var title = file[i]["title"],
        date = file[i]["date"],
        description = file[i]["description"];

        try {
          await this.addVisionsEvent({title, date, description});
        } catch (error) {
          return res.send({status: STATUS_CODE.ERROR});
        }
    }

    return res.send({status: STATUS_CODE.SUCCESS});
}