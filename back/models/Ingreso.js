'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IngresoSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    almacen: {type: String, required: true},

    pedido_envio: {type: Schema.ObjectId, ref: 'pedido_envio', required: false},
    venta: {type: Schema.ObjectId, ref: 'venta', required: false},
    estado_venta: {type: Boolean, required: false},
    cupon: {type: Schema.ObjectId, ref: 'cupon', required: false},

    unidades: {type: Number, required: false},
    cantidad: {type: Number, required: true},

    serie: {type: Number, required: false},
    unidad: {type: String, required: false},
    tipo: {type: String, required: false},

    day: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},

    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('ingreso',IngresoSchema);