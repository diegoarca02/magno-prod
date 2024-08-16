
'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Message_wtppSchema = Schema({
    de_prefijo: {type: String},
    de_number: {type: String},
    cliente: {type: Schema.ObjectId, ref: 'cliente'},
    cliente_prefijo: {type: String},
    cliente_number: {type: String},
    msm: {type: String},
    createAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('message_wtpp',Message_wtppSchema);