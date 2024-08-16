'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pedido_detalleSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    pedido: {type: Schema.ObjectId, ref: 'pedido', required: false},
    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    producto_variacion: {type: Schema.ObjectId, ref: 'producto_variacion', required: false},
    color: {type: Schema.ObjectId, ref: 'color', required: false},
    tipo_pedido: {type: String, required: true}, //Pedido-Programacion
    
    cantidad: {type: Number, required: true}, //Pedido - Comprado
    unidad: {type: String, required: false}, //Pedido - Comprado
    precio: {type: Number, required: false},
    tipo: {type: String, required: true},

    programacion_detalle: {type: Schema.ObjectId, ref: 'programacion_detalle', required: false},
    proveedor: {type: Schema.ObjectId, ref: 'proveedor', required: false},
    venta: {type: Schema.ObjectId, ref: 'venta', required: false},
    colorText: {type: String, required: false},

    idx_contenedor: {type: Number, required: false},
    contenedor: {type: String, required: false},
    porcent: {type: Number, required: false},

    cupon: {type: Schema.ObjectId, ref: 'cupon', required: false},

    estado: {type: String, default: 'Pedido', required: true}, //Pedido - Comprado
    pedido_envio:{type: Schema.ObjectId, ref: 'pedido_envio', required: false},
    ingreso:{type: Schema.ObjectId, ref: 'ingreso', required: false},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('pedido_detalle',Pedido_detalleSchema);