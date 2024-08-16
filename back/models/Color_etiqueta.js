'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Color_etiquetaSchema = Schema({
    etiqueta: {type: String, required: true},
    prioridad: {type: Number, required: true},
    hxd: {type: String, required: true},
    color: {type: Schema.ObjectId, ref: 'color', required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('color_etiqueta',Color_etiquetaSchema);