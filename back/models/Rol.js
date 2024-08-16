'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RolSchema = Schema({
    rol: {type: String, required: true},
    estado: {type: Boolean, default: true, required: true},
    
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('rol',RolSchema);