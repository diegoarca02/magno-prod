'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Venta_detalleSchema = Schema({
    tipo: {type: String, required: false},
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    venta: {type: Schema.ObjectId, ref: 'venta', required: true},

    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    empresa_rs: {type: Schema.ObjectId, ref: 'empresa_rs', required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    tipo_usuario: {type: String, required: true},
    priority: {type: Number, required: false},

    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    producto_variacion: {type: Schema.ObjectId, ref: 'producto_variacion', required: false},
    color: {type: Schema.ObjectId, ref: 'color', required: true},

    ingreso_detalle: {type: Schema.ObjectId, ref: 'ingreso_detalle', required: false},
    venta_envio: {type: Schema.ObjectId, ref: 'venta_envio', required: false},

    descuento: {type: Boolean, required: false},
    unidad: {type: String, required: true},//UNIDAD DE MEDIDA
    cantidad: {type: String, required: true},
    precio: {type: Number, required: true},
    tipo_detalle: {type: String, required: true}, //ALMACEN - EN CAMINO 

    fe_inicio: {type: String, required: false},
    fe_fin: {type: String, required: false},
    envio: {type: Boolean, default: false, required: false},

    day: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},

    estado: {type: String, default: 'Procesado', required: true},

    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('venta_detalle',Venta_detalleSchema);