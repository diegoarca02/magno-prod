'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VentaSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: false},
    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    empresa_rs: {type: Schema.ObjectId, ref: 'empresa_rs', required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    tipo_usuario: {type: String, required: true},
    ingreso: {type: Schema.ObjectId, ref: 'ingreso', required: false},
    tipo: {type: String, required: true},
    cupon: {type: Schema.ObjectId, ref: 'cupon', required: false},

    cliente_ubicacion: {type: Schema.ObjectId, ref: 'cliente_ubicacion', required: false},
    
    limit_days: {type: Number, required: false},
    firma_usuario: {type: String, required: false},
    firma_colaborador: {type: String, required: false},

    firma: {type: String, required: true},
    tipo_pago: {type: String, required: true},
    tipo_envio: {type: String, required: false},
    metodo_envio: {type: String, required: true},
    file: {type: String, required: false},
    tracking: {type: String, required: false},

    cantidad_total: {type: String, required: false}, //UNIDAD DE MEDIDA
    monto_pagado: {type: Number,default:0, required: true},
    monto_total: {type: Number, required: true},
    monto_ventas: {type: Number, required: true},
    monto_camino: {type: Number, required: true},
    monto_programaciones: {type: Number, required: true},
    descuento: {type: Number,default:0, required: false},

    img_entrega: {type: String, required: false},
    doc_envio: {type: String, required: false},
    doc_format_envio: {type: String, required: false},
    unidad: {type: String, required: false}, //UNIDAD DE MEDIDA
    

    day: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},

    serie: {type: Number, required: true},
    estado: {type: String, required: true},
    pago: {type: String, default: 'Pendiente', required: true}, //Pagado

    conf_entrega: {type: Schema.ObjectId, ref: 'colaborador', required: false},
    fecha_pago: {type: Date, required: false},

    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('venta',VentaSchema);