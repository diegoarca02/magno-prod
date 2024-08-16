'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cliente_cliente_facturacionSchema = Schema({
    tipo_usuario: {type: String, required: true},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    cliente_facturacion: {type: Schema.ObjectId, ref: 'cliente_facturacion', required: false},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('cliente_cliente_facturacion',Cliente_cliente_facturacionSchema);