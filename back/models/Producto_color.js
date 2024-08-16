'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Producto_colorSchema = Schema({
    hxd: {type: String, required: true},
    precio_venta: {type: Number, default: 0, required: true},
    sku: {type: String, required: true},
    variante: {type: String, required: true},

    yrds_min: {type: Number, required: false},
    yrds_max: {type: Number, required: false},

    color: {type: Schema.ObjectId, ref: 'color', required: true},
    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    hidden: {type: Boolean, default: false, required: true},
    delete: {type: Boolean, default: false, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('producto_color',Producto_colorSchema);