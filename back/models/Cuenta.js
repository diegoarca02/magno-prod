'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CuentaSchema = Schema({
    titular: {type: String, required: true},
    banco: {type: String, required: true},
    pais: {type: String, required: true},
    ncuenta: {type: String, required: true},
    cinter: {type: String, required: true},
    moneda: {type: String, required: true},
    destacado: {type: Boolean, default: false,required: true},
    swift: {type: String, required: true},
    estado: {type: Boolean, default: true, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
});

module.exports = mongoose.model('cuenta',CuentaSchema);