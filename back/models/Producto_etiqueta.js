'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Producto_etiquetaSchema = Schema({
    etiqueta: {type: String, required: true},
    prioridad: {type: Number, required: true},
    color: {type: String, required: true},
    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('producto_etiqueta',Producto_etiquetaSchema);