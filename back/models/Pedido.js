'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PedidoSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    moneda: {type: String, required: true},
    tipo_pago: {type: String, required: false},
    codigo_envio: {type: String, required: false},
    tipo_pedido: {type: String, required: true}, //Pedido-Programacion
    fecha_pedido: {type: Date, required: true},
    condicion_pago: {type: String, required: false},
    tipo: {type: String, required: true},
    unidad: {type: String, required: true},

    monto_envio: {type: Number, required: false},
    monto_resultante: {type: Number, required: true}, //monto colocado

    day: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},

    serie: {type: Number, required: true},

    estado: {type: String, default: 'Pedido', required: true}, //Pedido - Comprado
    
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('pedido',PedidoSchema);