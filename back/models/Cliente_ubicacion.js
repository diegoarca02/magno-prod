'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cliente_ubicacionSchema = Schema({
    prefijo: {type: String, required: true},
    telefono: {type: String, required: true},
    encargado: {type: String, required: false},
    tipo: {type: String, required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    status: {type: Boolean, default: true,required: true},

    text_es: {type: String, required: true},
    place_name_es: {type: String, required: true},
    id_mapbox: {type: String, required: true},
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
    country: {type: String, required: false},
    region: {type: String, required: false},
    place: {type: String, required: false},
    locality: {type: String, required: false},
    postcode: {type: String, required: false},

    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('cliente_ubicacion',Cliente_ubicacionSchema);