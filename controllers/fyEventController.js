const connection = require('../models/connection');
const { STATUS_CODE } = require('../lib/constants');
const eventHelpers = require('../lib/eventHelpers');

exports.readfyEvent =  async (req, res) => {
  const title_sort = (!req.query.title_sort) ? '' : ' title ' + req.query.title_sort;
  const week_sort = (!req.query.week_sort) ? '' : ' week ' + req.query.week_sort;
  const condition_order = (!req.query.condition_order) ? null : JSON.parse(req.query.condition_order);

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
    const query = 'INSERT INTO student_events (title, date, start_time, description, location, end_time, week, visions) VALUES (?,?,?,?,?,?,?,?)';

    try {
      const addEvent = new Promise((resolve, reject) => {
        connection.query(query, [title, date, start_time, description, location, end_time, week, visions], (err, res) => {
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

//load with csv file
exports.fyEventLoadfromcsv = async (req, res) => {
  const {file} = req.body;
  var duplicates = [];

  // Fetching the data from each row
  // and inserting to the table "sample"
  for (var i = 0; i < file.length; i++) {
      var email = file[i]["email"],
          name = file[i]["name"],
          type = file[i]["type"],
          visions = file[i]["visions"];

      try {
          let verify = await this.verifyUser(email);
          if (verify.NUM > 0) {
              duplicates.push(email);
          } else {
              await this.insertUser({email, name, type, visions});
          }
      } catch (error) {
          return res.send({status: STATUS_CODE.ERROR});
      }
  }

  if (duplicates.length == 0) {
      return res.send({status: STATUS_CODE.SUCCESS});
  } else {
      return res.send({status: STATUS_CODE.EMAIL_USED, result: duplicates});
  }
};