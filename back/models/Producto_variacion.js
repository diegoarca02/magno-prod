'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Producto_variacionSchema = Schema({
    tipo: {type: String, required: true},
    variacion_name: {type: String, required: true},
    color_name: {type: String, required: true},
    hxd: {type: String, required: true},
    precio_venta: {type: Number, default: 0, required: true},
    sku: {type: String, required: true},
    color: {type: Schema.ObjectId, ref: 'color', required: true},
    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    hidden: {type: Boolean, default: false, required: true},
    delete: {type: Boolean, default: false, required: true},
    dimensiones: {type: String, required: false},

    //TELAS
    yrds_min: {type: Number, required: false},
    yrds_max: {type: Number, required: false},

    //ROPAS
    talla: {type: String, required: false},

    //VIGAS
    

    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('producto_variacion',Producto_variacionSchema);