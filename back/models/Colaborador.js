'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ColaboradorSchema = Schema({
    nombres: {type: String, required: true},
    apellidos: {type: String, required: true},
    email: {type: String, required: true},
    fullnames: {type: String, required: true},
    password: {type: String, required: true},
    prefijo: {type: String, required: false},
    telefono: {type: String, required: false},
    ine: {type: String, required: false},
    nacimiento: {type: String, required: false},
    pais: {type: String, required: false},
    direccion: {type: String, required: false},
    rol: {type: String, required: true},
    avatar: {type: String, required: false},
    remuneracion: {type:Number, required:true, default: 0},
    almacenes: [{ type: Object, require: false}],
    avatar: {type: String, required: false},

    estado_clicks: {type: Number, default: 0, required: false},

    acceso_entrada: {type: String, required: false},
    acceso_salida: {type: String, required: false},
    codigo: {type: String, required: false},
    origen: {type: String, required: false},

    verificacion: {type: Boolean, default: false, required: true},
    estado: {type: Boolean, required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('colaborador',ColaboradorSchema);