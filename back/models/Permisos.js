'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PermisosSchema = Schema({
    permiso: {type: String, required: true},
    modulo: {type: String, required: false},
    descripcion: {type: String, required: true},
    estado: {type: Boolean, default: true, required: true},
    rol: {type: Schema.ObjectId, ref: 'rol', required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('permisos',PermisosSchema);