const connection = require('../models/connection');
const { STATUS_CODE } = require('../lib/constants');
const eventHelpers = require('../lib/eventHelpers');

// Shared functions
exports.addEventAgg = ({title, date, description, is_common}) => {
  const query = 'INSERT INTO student_events_aggregate (title, date, description, is_common) VALUES (?,?,?,?)';

  const promise = new Promise((resolve, reject) => {
    connection.query(query, [title, date, description, is_common], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
}

exports.updateEventAgg = ({title, date, description, is_common, event_id}) => {
  const query = 'UPDATE student_events_aggregate SET title = ?, date = ?, description = ?, is_common = ? WHERE event_id = ?;';

  const promise = new Promise((resolve, reject) => {
    connection.query(query, [title, date, description, is_common, event_id], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
}

exports.deleteEventAgg = ({event_id}) => {
  var query = 'DELETE FROM student_events_aggregate WHERE event_id = ' + event_id;

  const promise = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
}

exports.addEventComm = (event_id, start_time, end_time, location) => {
  const query = 'INSERT INTO common_events (event_id, start_time, end_time, location) VALUES (?,?,?,?);';

  const promise = new Promise((resolve, reject) => {
    connection.query(query, [event_id, start_time, end_time, location], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
}

exports.updateEventComm = ({start_time, end_time, location, event_id}) => {
  const query = 'UPDATE common_events SET start_time = ?, end_time = ?, location = ? WHERE event_id = ?;'

  const promise = new Promise((resolve, reject) => {
    connection.query(query, [start_time, end_time, location, event_id], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
}

exports.deleteEventComm = ({event_id}) => {
  var query = 'DELETE FROM common_events WHERE event_id = ' + event_id;

  const promise = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
}

exports.addVisionsInfo = ({visions, day, start_time, end_time, location, offset}) => {
  var query = 'INSERT INTO visions_info (visions, day, start_time, end_time, location, offset) VALUES (' + visions + ',?,?,?,?,?)';

  const promise = new Promise((resolve, reject) => {
    connection.query(query, [day, start_time, end_time, location, offset], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
}

exports.updateVisionsInfo = ({visions, day, start_time, end_time, location, offset}) => {
  var query = 'UPDATE visions_info SET day = ?, start_time = ?, end_time = ?, location = ?, offset = ? WHERE visions = ' + visions;
  
  const promise = new Promise((resolve, reject) => {
    connection.query(query, [day, start_time, end_time, location, offset], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
}

exports.reset = (table) => {
  var query = 'DELETE FROM ' + table;

  const promise = new Promise((resolve, reject) => {
    connection.query(query, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
}

// require parameters time_range, visions
// can only return the monday for the event
exports.readfyEvent =  async (req, res) => {
  //set time range, which will be passed in as array of size 2
  const timeRange = (!req.query.time_range) ? '' : JSON.parse(req.query.time_range);
  const dateClause =  timeRange  == '' ? '' : ' WHERE (student_events_aggregate.date >= \'' + timeRange[0] + '\' AND student_events_aggregate.date <= \'' + timeRange[1] + '\')';

  var query = ' SELECT student_events_aggregate.event_id, student_events_aggregate.title, student_events_aggregate.description, student_events_aggregate.date, visions_info.start_time, visions_info.end_time, visions_info.location, visions_info.offset, 0 as is_common' + 
              ' FROM mydb.student_events_aggregate ' + 
              ' CROSS JOIN mydb.visions_info ' +
              dateClause + 
              ' AND visions_info.visions = ' + req.query.visions + 
              ' AND student_events_aggregate.is_common = 0' + 
              ' UNION ' +
              ' SELECT student_events_aggregate.event_id, student_events_aggregate.title, student_events_aggregate.description, student_events_aggregate.date, common_events.start_time, common_events.end_time, common_events.location, 0 as offset, 1 as is_common' +
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
    const {title, date, description, is_common, start_time, end_time, location, visions, day} = req.body;

    let offset = eventHelpers.findOffset(day);

    try {
      let addEventResult = '';

      if (start_time > end_time){
        return res.send({ status: STATUS_CODE.INVALID_START_END_TIMES });
      }

      if (is_common == 0){
        addEventResult = await this.addEventAgg({title, date, description, is_common});

        let verifyVisions = await eventHelpers.verifyVisions(visions);
        if (verifyVisions.NUM != 0) {
          await this.updateVisionsInfo({visions, day, start_time, end_time, location, offset});
        } else {
          await this.addVisionsInfo({visions, day, start_time, end_time, location, offset});
        }
      } else {
        await this.addEventAgg({title, date, description, is_common});
        let getId = await eventHelpers.getEventId('student_events_aggregate');
        addEventResult = await this.addEventComm(getId.ID, start_time, end_time, location);
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

  let offset = eventHelpers.findOffset(day);
  
  try {
      if (start_time > end_time){
        return res.send({ status: STATUS_CODE.INVALID_START_END_TIMES });
      }
    
      await this.updateEventAgg({title, date, description, is_common, event_id});

      if (is_common == 0){
        await this.updateVisionsInfo({visions, day, start_time, end_time, location, offset});
      } else {
        await this.updateEventComm({start_time, end_time, location, event_id});
      }

      return res.send({ status: STATUS_CODE.SUCCESS });
  } catch (err){
      return res.send({status: STATUS_CODE.ERROR});
  }
}

exports.deletefyEvent =  async (req, res) => {
  const event_id = req.body.event_id;

  try {
    let verify = await eventHelpers.verifyEvent(event_id, 'student_events_aggregate');

    if (verify.NUM == 0){
        return res.send({ status: STATUS_CODE.INCORRECT_EVENT_ID });
    }

    await this.deleteEventAgg({event_id});

    if (verify.COMMON == 1){
      await this.deleteEventComm({event_id});
    }
    
    return res.send({status: STATUS_CODE.SUCCESS});
  } catch (error) {
    return res.send({status: STATUS_CODE.ERROR});
  }
}

//reset the first year events
exports.resetfyEvent = async (req, res) => {
  try {
      await this.reset('student_events_aggregate');
      await this.reset('common_events');
      await this.reset('visions_info');
      return res.send({status: STATUS_CODE.SUCCESS});
  } catch (error) {
      return res.send({status: STATUS_CODE.ERROR});
  }
}

exports.fyVisionsEventLoadfromcsv = async (req, res) => {
    const {file} = req.body;

    // Fetching the data from each row
    // and inserting to the table
    for (var i = 0; i < file.length; i++) {
        var title = file[i]["title"],
        date = file[i]["date"],
        description = file[i]["description"],
        is_common = 0;

        try {
          await this.addEventAgg({title, date, description, is_common});
        } catch (error) {
          return res.send({status: STATUS_CODE.ERROR});
        }
    }

    return res.send({status: STATUS_CODE.SUCCESS});
}

exports.fyVisionsInfoLoadfromcsv = async (req, res) => {
  const {file} = req.body;
  var invalid_time = [];

  // Fetching the data from each row
  // and inserting to the table
  for (var i = 0; i < file.length; i++) {
      var visions = file[i]["visions"],
      day = file[i]["day"],
      start_time = file[i]["start_time"],
      end_time = file[i]["end_time"],
      location = file[i]["location"];

      var offset = eventHelpers.findOffset(day);

      try {
        if (start_time > end_time){
          invalid_time.push(visions);
        } else {
          await this.addVisionsInfo({visions, day, start_time, end_time, location, offset});
        }
      } catch (error) {
        return res.send({status: STATUS_CODE.ERROR});
      }
  }

  if (invalid_time.length == 0) {
    return res.send({status: STATUS_CODE.SUCCESS});
  } else {
    return res.send({status: STATUS_CODE.INVALID_START_END_TIMES, result: invalid_time});
  }
}