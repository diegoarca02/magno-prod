'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    tipo: {type: String, required: true}, //Tela Hoja de piedra
    titulo: {type: String, required: true},
    codigo: {type: String, required: true},
    portada: {type: String, required: true},
    categoria: {type: String, required: true},
    subcategoria: {type: String, required: true},
    descripcion: {type: String, required: false},
    cantidad_contenedor: {type: Number, required: false},
    estado: {type: String, default: true, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('producto',ProductoSchema);