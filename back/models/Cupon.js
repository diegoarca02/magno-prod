'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CuponSchema = Schema({
    tipo: {type: String, required: true}, //Tela Hoja de piedra
    codigo: {type: String, required: true},
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: false},
    producto: {type: Schema.ObjectId, ref: 'producto', required: false},
    colores: [{ type: Object, require: false}],
    variaciones: [{ type: Object, require: false}],

    vencimiento: {type: String, required: false},
    tipo_pago: {type: String, required: true},

    descuento_credito: {type: Boolean, required: true},

    estado: {type: Boolean, default: true, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('cupon',CuponSchema);