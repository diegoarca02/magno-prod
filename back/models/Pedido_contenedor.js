'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pedido_contenedorSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    pedido_envio: {type: Schema.ObjectId, ref: 'pedido_envio', required: true},
    contenedor: {type: Number, required: false},
    porcentaje: {type: Number, required: false},
    detalles: [{ type: Object, require: false}],
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('pedido_contenedor',Pedido_contenedorSchema);