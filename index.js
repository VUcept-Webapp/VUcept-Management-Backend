const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const routes = require('./routes/user');
app.use('/', routes);

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;