'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Venta_envioSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    venta: {type: Schema.ObjectId, ref: 'venta', required: true},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    lugar_expedicion : {type: String, required: true},
    fecha_expedicion : {type: Date, required: true},
    fecha_entrega : {type: Date, required: false},
    destinatario : {type: String, required: true},
    monto : {type: Number, required: false},
    subtotal : {type: Number, required: false},
    unidades : {type: Number, required: true},
    cliente_ubicacion: {type: Schema.ObjectId, ref: 'cliente_ubicacion', required: true},
    paqueteria: {type: String, required: true},
    tracking: {type: String, required: false},
    firma: {type: String, required: false},
    file : {type: String, required: false},
    serie : {type: Number, required: true},
    file_entrega : {type: String, required: false},
    estado: {type: String,default: 'Procesado' , required: false},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('venta_envio',Venta_envioSchema);