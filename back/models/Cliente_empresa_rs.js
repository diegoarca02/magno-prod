'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Cliente_empresa_rsSchema = Schema({
    empresa: {type: Schema.ObjectId, ref: 'empresa', required: true},
    empresa_rs: {type: Schema.ObjectId, ref: 'empresa_rs', required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: true},
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('Cliente_empresa_rs',Cliente_empresa_rsSchema);