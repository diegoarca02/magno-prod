'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pedido_envioSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    tipo_transporte: {type: String, required: false},
    empresa_transporte: {type: String, required: false},
    aduanero_transporte: {type: String, required: false},
    programacion_transporte: {type: Date, required: false},
    serie: {type: Number, required: true},
    costo_envio: {type: Number, required: false},
    tracking: {type: String, required: false},
    estado: {type: String, default: 'Enviado', required: true}, //
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('pedido_envio',Pedido_envioSchema);