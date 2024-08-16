'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cliente_facturacionSchema = Schema({
    nombres: {type: String, required: true},
    apellidos: {type: String, required: true},
    email: {type: String, required: false},
    telefono: {type: String, required: true},
    uid: {type: String, required: false},
    rfc: {type: String, required: false},
    zip: {type: String, required: false},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('cliente_facturacion',Cliente_facturacionSchema);