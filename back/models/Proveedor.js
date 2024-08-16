'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProveedorSchema = Schema({
    razon_social: {type: String, required: true},
    email: {type: String, required: true},
    pais: {type: String, required: true},
    telefono: {type: String, required: true},
    prefijo: {type: String, required: true},
    encargado: {type: String, required: true},
    estado: {type: String, required: false},
    ciudad: {type: String, required: false},
    direccion: {type: String, required: false},
    createdAt : {type: Date, default: Date.now, required : true}, 
    verificacion: {type: Boolean, default: false, required: true},
    status: {type: Boolean, default: true, required: true},
    updatedAt : {type: Date},
});

module.exports = mongoose.model('proveedor',ProveedorSchema);