'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Solicitud_creditoSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    venta: {type: Schema.ObjectId, ref: 'venta', required: false},
    tipo: {type: String, required: true},

    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    empresa_rs: {type: Schema.ObjectId, ref: 'empresa_rs', required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    tipo_usuario: {type: String, required: true},

    serie: {type: Number, required: true},
    monto: {type: Number, required: true},
    estado: {type: String, required: true},

    aprobaciones: {type: Number, default: 0, required: true},

    day: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},

    createdAt_resolucion : {type: Date, required : false}, 
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('solicitud_credito',Solicitud_creditoSchema);