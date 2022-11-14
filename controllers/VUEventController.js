const connection = require('../models/connection');
const { STATUS_CODE } = require('../lib/constants');
const eventHelpers = require('../lib/eventHelpers');

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
    const {title, logged_by, date, start_time, description, location, end_time} = req.body;
    const query = 'INSERT INTO vuceptor_events (title, logged_by, date, start_time, description, location, end_time) VALUES (?,?,?,?,?,?,?)';

    try {
      let verify = await eventHelpers.verifyUser(logged_by);

      if (verify.NUM == 0) {
        return res.send({ status: STATUS_CODE.UNAUTHORIZED });
      }

      const addEvent = new Promise((resolve, reject) => {
        connection.query(query, [title, logged_by, date, start_time, description, location, end_time], (err, res) => {
          if (err) reject(err);
          else resolve(res);
        })
      });
      
      const addEventResult = await addEvent;
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