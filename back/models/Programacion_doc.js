'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Programacion_docSchema = Schema({
    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    empresa_rs: {type: Schema.ObjectId, ref: 'empresa_rs', required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    tipo_usuario: {type: String, required: true},
    file: {type: String, required: true},
    total: {type: Number, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
});

module.exports = mongoose.model('programacion_doc',Programacion_docSchema);