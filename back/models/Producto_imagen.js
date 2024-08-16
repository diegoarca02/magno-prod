'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Producto_imagenSchema = Schema({
    imagen: {type: String, required: true},
    titulo: {type: String, required: false},
    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('producto_imagen',Producto_imagenSchema);

