'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cliente_agenteSchema = Schema({
    tipo: {type: String, required: true},
    cliente: {type: Schema.ObjectId, ref:'cliente', required: true},
    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    empresa_rs: {type: Schema.ObjectId, ref: 'empresa_rs', required: false},
    
    colaborador: {type: Schema.ObjectId, ref:'colaborador', required: true},

    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('cliente_agente',Cliente_agenteSchema);