const connection = require('../models/connection');
const { STATUS_CODE } = require('../lib/constants');
const eventHelpers = require('../lib/eventHelpers');

// Shared functions: insertUser
exports.addVUEvent = ({title, date, start_time, description, location, end_time, mandatory}) => {
  const query = 'INSERT INTO vuceptor_events (title, date, start_time, description, location, end_time, mandatory) VALUES (?,?,?,?,?,?,?)';

  const promise = new Promise((resolve, reject) => {
    connection.query(query, [title, date, start_time, description, location, end_time, mandatory], (err, res) => {
      if (err) reject(err);
      else resolve(res);
    })
  });

  return promise;
}

exports.readVUEvent =  async (req, res) => {
  //set time range, which will be passed in as array of size 2
  const timeRange = (!req.query.time_range) ? '' : JSON.parse(req.query.time_range);
  const dateClause =  timeRange  == '' ? '' : ' (date >= \'' + timeRange[0] + '\' AND date <= \'' + timeRange[1] + '\')';

  var query = 'SELECT * FROM vuceptor_events WHERE ' + dateClause;

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
    const {title, date, start_time, description, location, end_time, mandatory} = req.body;
    
    try {
      await this.addVUEvent({title, date, start_time, description, location, end_time, mandatory});

      if (mandatory == 1){ // mandatory is true
        let getId = await eventHelpers.getEventId('vuceptor_events');
        let getAllPerson = await eventHelpers.getAllPersonId('users');

        if (getAllPerson.length != 0){
          await eventHelpers.insertEventAttendance(getId.ID, getAllPerson, 'user_id', 'vuceptor_attendance', 'vuceptor_id');
        }
      }

      return res.send({ status: STATUS_CODE.SUCCESS });
    } catch (err){
        return res.send({ status: STATUS_CODE.ERROR });
    }
}

exports.updateVUEvent =  async (req, res) => {
  const {title, date, start_time, description, location, end_time, mandatory, event_id} = req.body;
  const query = 'UPDATE vuceptor_events SET title = ?, date = ?, start_time = ?, description = ?, location = ?, end_time = ?, mandatory = ? WHERE event_id = ?';

  try {
      const updateEvent = new Promise((resolve, reject) => {
        connection.query(query, [title, date, start_time, description, location, end_time, mandatory, event_id], (err, res) => {
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

    await deleteEvent;
    return res.send({status: STATUS_CODE.SUCCESS});
  } catch (error) {
    console.log(error);
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
}

exports.VUEventLoadfromcsv = async (req, res) => {
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
      mandatory = file[i]["mandatory"];

      try {
        await this.addVUEvent({title, date, start_time, description, location, end_time, mandatory});
        
        if (mandatory == 1){
          let getId = await eventHelpers.getEventId('vuceptor_events');
          let getAllPerson = await eventHelpers.getAllPersonId('users');
    
          await eventHelpers.insertEventAttendance(getId.ID, getAllPerson, 'user_id', 'vuceptor_attendance', 'vuceptor_id');
        }
      } catch (error) {
          return res.send({status: STATUS_CODE.ERROR});
      }
  }

  return res.send({status: STATUS_CODE.SUCCESS});
}