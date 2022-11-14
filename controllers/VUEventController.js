const connection = require('../models/connection');
const { STATUS_CODE } = require('../lib/constants');
const eventHelpers = require('../lib/eventHelpers');

// Shared functions: insertUser
exports.addVUEvent = ({title, logged_by, date, start_time, description, location, end_time}) => {
  const query = 'INSERT INTO vuceptor_events (title, logged_by, date, start_time, description, location, end_time) VALUES (?,?,?,?,?,?,?)';

  const promise = new Promise((resolve, reject) => {
    connection.query(query, [title, logged_by, date, start_time, description, location, end_time], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
};


exports.readVUEvent =  async (req, res) => {
  const title = (!req.query.title) ? '' : ' AND (title = \'' + req.query.title + '\')' ;

  //set time range, which will be passed in as array of size 2
  const timeRange = (!req.query.time_range) ? '' : JSON.parse(req.query.time_range);
  const dateClause =  timeRange  == '' ? '' : ' (date >= \'' + timeRange[0] + '\' AND date <= \'' + timeRange[1] + '\')';

  var query = 'SELECT * FROM vuceptor_events';
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

exports.createVUEvent =  async (req, res) => {
    const {title, logged_by, date, start_time, description, location, end_time, mandatory} = req.body;
    
    try {
      let verify = await eventHelpers.verifyUser(logged_by);

      if (verify.NUM == 0) {
        return res.send({ status: STATUS_CODE.UNAUTHORIZED });
      }

      let addEventResult = await this.addVUEvent({title, logged_by, date, start_time, description, location, end_time});

      if (mandatory == 'true'){
        let getId = await eventHelpers.getEventId('vuceptor_events');
        let getAllPerson = await eventHelpers.getAllPersonId('users');
  
        await eventHelpers.insertEventAttendance(getId.ID, getAllPerson, 'user_id', 'vuceptor_attendance', 'vuceptor_id');
      }

      if (addEventResult.affectedRows){
        return res.send({ status: STATUS_CODE.SUCCESS });
      }
    } catch (err){
        console.log(err);
        return res.send({ status: STATUS_CODE.ERROR });
    }
}

exports.updateVUEvent =  async (req, res) => {
  const {title, logged_by, date, start_time, description, location, end_time, event_id} = req.body;
  const query = 'UPDATE vuceptor_events SET title = ?, logged_by = ?, date = ?, start_time = ?, description = ?, location = ?, end_time = ? WHERE event_id = ?';

  try {
      let verify = await eventHelpers.verifyUser(logged_by);

      if (verify.NUM == 0) {
        return res.send({ status: STATUS_CODE.UNAUTHORIZED });
      }

      const updateEvent = new Promise((resolve, reject) => {
        connection.query(query, [title, logged_by, date, start_time, description, location, end_time, event_id], (err, res) => {
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

exports.deleteVUEvent =  async (req, res) => {
  const event_id = req.body.event_id;

  const query = 'DELETE FROM vuceptor_events WHERE event_id = ' + event_id;
  
  try {
    let verify = await eventHelpers.verifyEvent(event_id, 'vuceptor_events');

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

//reset the vuceptor events
exports.resetVUEvent = async (req, res) => {
  const query = 'DELETE FROM vuceptor_events;';

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
      logged_by = file[i]["logged_by"],
      date = file[i]["date"],
      start_time = file[i]["start_time"],
      description = file[i]["description"],
      location = file[i]["location"],
      end_time = file[i]["end_time"],
      mandatory = file[i]["mandatory"];

      try {
        let verify = await eventHelpers.verifyUser(logged_by);

        if (verify.NUM == 0) {
          return res.send({ status: STATUS_CODE.UNAUTHORIZED });
        }

        await this.addVUEvent({title, logged_by, date, start_time, description, location, end_time});
        
        if (mandatory == 'true'){
          let getId = await eventHelpers.getEventId('vuceptor_events');
          let getAllPerson = await eventHelpers.getAllPersonId('users');
    
          await eventHelpers.insertEventAttendance(getId.ID, getAllPerson, 'vuceptor_attendance', 'vuceptor_id');
        }
      } catch (error) {
          return res.send({status: STATUS_CODE.ERROR});
      }
  }

  return res.send({status: STATUS_CODE.SUCCESS});
}