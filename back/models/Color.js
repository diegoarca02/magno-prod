'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ColorSchema = Schema({
    color: {type: String, required: true},
    hxd: {type: String, required: true},
    password: {type: String, required: false},
    str_password: {type: String, required: false},
    primario: {type: Boolean, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
});

module.exports = mongoose.model('color',ColorSchema);