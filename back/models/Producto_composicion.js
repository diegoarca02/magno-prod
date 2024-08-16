'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Producto_composicionSchema = Schema({
    composicion: {type: String, required: true},
    porcentaje: {type: Number, required: true},
    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('producto_composicion',Producto_composicionSchema);