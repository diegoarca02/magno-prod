'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Venta_doc_envioSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    venta: {type: Schema.ObjectId, ref: 'venta', required: true},

    lugar_expedicion : {type: String, required: true},
    fecha_expedicion : {type: Date, required: true},
    destinatario : {type: String, required: true},
    monto : {type: Number, required: true},
    rollos : {type: Number, required: true},

    cliente_ubicacion: {type: Schema.ObjectId, ref: 'cliente_ubicacion', required: true},

    paqueteria: {type: String, required: true},

    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('venta_doc_envio',Venta_doc_envioSchema);