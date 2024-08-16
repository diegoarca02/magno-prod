'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClienteSchema = Schema({

    serie: {type: Number, required: true},
    nombres: {type: String, required: true},
    apellidos: {type: String, required: true},
    email: {type: String, required: false},
    fullnames: {type: String, required: true},
    password: {type: String, required: true},
    prefijo: {type: String, required: true},
    telefono: {type: String, required: true},
    rfc: {type: String, required: false},
    nacimiento: {type: String, required: false},
    credito_total: {type: Number,default:0, required: false},
    credito_usado: {type: Number,default:0, required: false},
    credito_disponible: {type: Number,default:0, required: false},
    umedida_cantidad: {type: String,default:'Mtr',required: false},

    tipo: {type: String,default:'Prospecto', required: true},
    estado: {type: Boolean, default: true, required: true},
   
    verificacion: {type: Boolean, default: false, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('cliente',ClienteSchema);