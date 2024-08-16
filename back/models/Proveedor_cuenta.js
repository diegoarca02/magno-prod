'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Proveedor_cuentaSchema = Schema({
    banco: {type: String, required: true},
    swift: {type: String, required: true},

    titular: {type: String, required: true},
    numero: {type: String, required: true},
    direccion: {type: String, required: true},
    
    proveedor: {type: String,default:'proveedor', required: true},
    
    estado: {type: Boolean, default: true, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('proveedor_cuenta',Proveedor_cuentaSchema);