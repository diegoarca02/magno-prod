var WtppController = require('../controllers/WtppController');
var express = require('express');
var auth = require('../middlewares/authenticate');
var app = express.Router();

app.get('/send_message_wtpp',WtppController.send_message_wtpp);

module.exports = app;