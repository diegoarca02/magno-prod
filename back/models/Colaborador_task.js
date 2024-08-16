'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Colaborador_taskSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: false},
    descripcion: {type: String, required: true},
    date_realizar: {type: Date, required: true},
    date_marca: {type: Date, required: false},
    estado: {type: String, default: 'Pendiente'},
    pospuesto: {type: Boolean, default: false},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('colaborador_task',Colaborador_taskSchema);