'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Programacion_detalleSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    producto_variacion: {type: Schema.ObjectId, ref: 'producto_variacion', required: false},
    color: {type: Schema.ObjectId, ref: 'color', required: true},
    tipo: {type: String, required: false},
    unidad: {type: String, required: false},
    
    pedido: {type: Schema.ObjectId, ref: 'pedido', required: false},
    venta: {type: Schema.ObjectId, ref: 'venta', required: false},
    programacion: {type: Schema.ObjectId, ref: 'programacion', required: false},
    tipo_detalle: {type:String,default:'Programación'},

    fe_inicio: {type: String, required: false},
    fe_fin: {type: String, required: false},

    cantidad_recibida: {type: Number, required: false},
    cantidad_pedido: {type: Number, required: false},
    cantidad: {type: Number, required: true},
    precio_unidad: {type: String, required: true},

    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    empresa_rs: {type: Schema.ObjectId, ref: 'empresa_rs', required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    tipo_usuario: {type: String, required: true},

    estado: {type: String, required: true}, //Pedido - Comprado
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('programacion_detalle',Programacion_detalleSchema);