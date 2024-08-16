'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Empresa_rsSchema = Schema({
    razon_social: {type: String, required: true},
    tipo_empresa: {type: String, required: true},
    limit_days: {type: Number,default:0, required: false},
    limit_credito: {type: Number,default:0, required: false},
    empresa: {type: Schema.ObjectId, ref: 'empresa', required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('empresa_rs',Empresa_rsSchema);