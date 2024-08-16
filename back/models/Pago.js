'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PagoSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: false},
    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    empresa_rs: {type: Schema.ObjectId, ref: 'empresa_rs', required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    tipo_usuario: {type: String, required: true},
    venta: {type: Schema.ObjectId, ref: 'venta', required: false},
    pago_completo: {type: Schema.ObjectId, ref: 'pago_completo', required: false},
    tipo: {type: String, required: false},

    id_transaccion: {type: String, required: false},
    tipo_pago: {type: String, required: false},
    metodo: {type: String, required: false},
    entidad: {type: String, required: false},
    monto: {type: Number, required: true},
   
    day: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},
    serie: {type: Number, required: true},
    automatico: {type: Boolean, required: true},

    last_pago: {type: Boolean, required: false},
    descuento: {type: Number, required: false},
    sat_uid: {type: String, required: false},
    sat_serie: {type: String, required: false},
    sat_folio: {type: String, required: false},
    sat_estado: {type: String, required: false},
    sat_cliente_facturacion: {type: Schema.ObjectId, ref: 'cliente_facturacion', required: false},

    estado: {type: String, required: false},

    aprobacion: {type: Date, required: false},
    exp : {type: Date, required : true}, 
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('pago',PagoSchema);