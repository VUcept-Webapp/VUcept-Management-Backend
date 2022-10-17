const express = require('express');
const routerCalendarEvent = express.Router();
const calendarEventController = require('../controllers/calendarEventController');

// Routes
// routerCalendarEvent.get('/readVUAttendance', calendarEventController.readCalendarEvent);
routerCalendarEvent.post('/insertCalendarEvent', calendarEventController.insertCalendarEvent);

module.exports = routerCalendarEvent;