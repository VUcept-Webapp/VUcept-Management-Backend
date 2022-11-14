const connection = require('../models/connection');
const { STATUS_CODE } = require('../lib/constants');
const eventHelpers = require('../lib/eventHelpers');

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