'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Colaborador_permiso = Schema({
    colaborador: {type: Schema.ObjectId, ref:'colaborador'},
    permiso: {type: String, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('colaborador_permiso',Colaborador_permiso);