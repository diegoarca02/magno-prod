'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProgramacionSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: true},
    tipo: {type: String, required: false},
    unidad: {type: String, required: true},

    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    empresa_rs: {type: Schema.ObjectId, ref: 'empresa_rs', required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    tipo_usuario: {type: String, required: true},

    serie: {type: Number, required: true},
    file: {type: String, required: false},
    
    tipo_pago: {type: String, required: false},
    metodo: {type: String, required: false},
    entidad: {type: String, required: false},
    tipo_envio: {type: String, required: false},
    metodo_envio: {type: String, required: false},
    venta: {type: Schema.ObjectId, ref: 'venta', required: false},

    firma: {type: String, required: true},
    estado: {type: String, required: true}, //Pendiente - Completado
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('programacion',ProgramacionSchema);