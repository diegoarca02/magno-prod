'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cupon_compradorSchema = Schema({
    venta: {type: Schema.ObjectId, ref: 'venta', required: false},
    cupon: {type: Schema.ObjectId, ref: 'cupon', required: false},
    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    empresa_rs: {type: Schema.ObjectId, ref: 'empresa_rs', required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    tipo_usuario: {type: String, required: true},

    estado: {type: Boolean, default: true, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('cupon_comprador',Cupon_compradorSchema);