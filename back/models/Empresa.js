'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmpresaSchema = Schema({
    razon_social: {type: String, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    email: {type: String, required: false},
    saldo_favor: {type: Number, default:0, required: false},
    estado: {type: Boolean, default: true, required: true},
    updatedAt : {type: Date},
});

module.exports = mongoose.model('empresa',EmpresaSchema);