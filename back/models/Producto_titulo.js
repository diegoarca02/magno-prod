'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Producto_tituloSchema = Schema({
    titulo: {type: String, required: true},
    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('producto_titulo',Producto_tituloSchema);