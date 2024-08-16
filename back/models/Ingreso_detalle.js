'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ingreso_detalleSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    ingreso: {type: Schema.ObjectId, ref: 'ingreso', required: true},
    pedido_detalle: {type: Schema.ObjectId, ref: 'pedido_detalle', required: false},
    pedido_envio: {type: Schema.ObjectId, ref: 'pedido_envio', required: false},

    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    producto_variacion: {type: Schema.ObjectId, ref: 'producto_variacion', required: false},
    color: {type: Schema.ObjectId, ref: 'color', required: false},
    pedido_programacion: {type: Schema.ObjectId, ref: 'pedido_programacion', required: false},

    codigo: {type: String, required: true},
    unidad: {type: String, required: false},
    tipo: {type: String, required: false},
    cantidad: {type: Number, required: true},

    day: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},

    estado: {type: Boolean, default: true, required: true},
    eliminacion: {type: Boolean, default: false, required: true},
    venta_detalle: {type: Schema.ObjectId, ref: 'venta_detalle', required: false},

    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('ingreso_detalle',Ingreso_detalleSchema);