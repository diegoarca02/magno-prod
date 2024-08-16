'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pedido_detalle_fileSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    pedido: {type: Schema.ObjectId, ref: 'pedido', required: true},
    pedido_detalle: {type: Schema.ObjectId, ref: 'pedido_detalle', required: false},
    pedido_envio: {type: Schema.ObjectId, ref: 'pedido_envio', required: false},
    
    name: {type: String, required: true},
    archivo: {type: String, required: true},
    formato: {type: String, required: true},
    peso: {type: String, required: true},
    
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('pedido_detalle_file',Pedido_detalle_fileSchema);