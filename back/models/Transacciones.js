'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransaccionSchema = Schema({
    tipo_usuario: {type: String, required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    serie: {type: Number, required: true},
    monto: {type: Number, required: true},
    venta: {type: Schema.ObjectId, ref: 'venta', required: false},
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: false},

    day: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},
    descripcion: {type: String, required: false},
    tipo: {type: String, required: false},

    estado: {type: Boolean, required: false},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('transaccion',TransaccionSchema);