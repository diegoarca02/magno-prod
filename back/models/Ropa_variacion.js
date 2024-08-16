'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Ropa_variacionSchema = Schema({
    color: {type: String, required: true},
    hxd: {type: String, required: true},
    

    precio_venta: {type: Number, default: 0, required: true},
    sku: {type: String, required: true},
    cantidad: {type: Number, default: 0, required: true},

    hidden: {type: Boolean, default: false, required: true},

    cantidad_min: {type: Number, required: false},
    cantidad_max: {type: Number, required: false},

    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('ropa_variacion',Ropa_variacionSchema);