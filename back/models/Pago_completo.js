
'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Pago_completoSchema = Schema({
    colaborador: {type: Schema.ObjectId, ref: 'colaborador', required: false},
    empresa: {type: Schema.ObjectId, ref: 'empresa', required: false},
    empresa_rs: {type: Schema.ObjectId, ref: 'empresa_rs', required: false},
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: false},
    venta: {type: Schema.ObjectId, ref: 'venta', required: false},//VENTA DONDE SE CREO EL PAGO
    programacion: {type: Schema.ObjectId, ref: 'programacion', required: false},
    tipo_usuario: {type: String, required: true},

    tipo: {type: String, required: true},
    id_transaccion: {type: String, required: false},
    tipo_pago: {type: String, required: false},
    metodo: {type: String, required: false},
    entidad: {type: String, required: false},
    comprobante: {type: String, required: false},
    monto: {type: Number, required: true},
   
    day: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},

    tipo_de_comprobante: {type: String, required: false},
    sat_receptor: {type: String, required: false},
    sat_metodo : {type: String, required: false},
    sat_uid: {type: String, required: false},
    sat_serie: {type: String, required: false},
    sat_folio: {type: String, required: false},
    sat_estado: {type: String, required: false},
    sat_cliente_facturacion: {type: Schema.ObjectId, ref: 'cliente_facturacion', required: false},

    sat_timbrado_uid : {type: String, required: false},
    sat_timbrado_FechaTimbrado : {type: String, required: false},
    sat_timbrado_SelloSAT : {type: String, required: false},
    sat_timbrado_SelloCFD : {type: String, required: false},
    sat_timbrado_NoCertificadoSAT : {type: String, required: false},

    estado: {type: String, default: 'Pendiente', required: false},

    aprobacion: {type: Date, required: false},
    exp : {type: Date, required : true}, 
    createdAt : {type: Date, default: Date.now, required : true}, 
    updatedAt : {type: Date},
});

module.exports = mongoose.model('pago_completo',Pago_completoSchema);