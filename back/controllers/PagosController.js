var Pago = require('../models/Pago');
var Pago_completo = require('../models/Pago_completo');
var Cuenta = require('../models/Cuenta');
const Transacciones = require('../models/Transacciones');

const create_cuenta = async function(req,res){
    if(req.user){
        try {
            let data = req.body;

            let cuentas_ncuenta = await Cuenta.find({ncuenta:data.ncuenta});
            let cuentas_cinter = await Cuenta.find({cinter:data.cinter});

            if(cuentas_ncuenta.length == 0){
                if(cuentas_cinter.length == 0){
                    let cuenta = await Cuenta.create(data);
                    res.status(200).send({data:cuenta});
                }else{
                    res.status(200).send({data:undefined,message: 'La clave interbancaria ya existe.'});
                }
            }else{
                res.status(200).send({data:undefined,message: 'El número de cuenta ya existe.'});
            }
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_cuentas = async function(req,res){
    if(req.user){
        try {
            let cuentas = await Cuenta.find().sort({createdAt:-1});
            res.status(200).send({data:cuentas});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_cuentas_destacadas = async function(req,res){
    if(req.user){
        try {
            let cuentas = await Cuenta.find({destacado: true}).limit(2).sort({createdAt:-1});
            res.status(200).send({data:cuentas});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_cuenta = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let cuenta = await Cuenta.findOne({_id:id});
            res.status(200).send({data:cuenta});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const update_cuenta = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let data = req.body;

            let destacados = [];
            if(data.destacado){
                destacados = await Cuenta.find({destacado:true});
                console.log(destacados.length);
                if(destacados.length <= 2){
                    let cuenta = await Cuenta.findByIdAndUpdate({_id:id},{
                        titular: data.titular,
                        banco: data.banco,
                        pais: data.pais,
                        ncuenta: data.ncuenta,
                        cinter: data.cinter,
                        moneda: data.moneda,
                        swift: data.swift,
                        destacado: data.destacado
                    });
                    res.status(200).send({data:cuenta});
                }else{
                    res.status(200).send({data:undefined,message: 'Se supero el limite de cuentas destacadas'});
                }
            }else{
                let cuenta = await Cuenta.findByIdAndUpdate({_id:id},{
                    titular: data.titular,
                    banco: data.banco,
                    pais: data.pais,
                    ncuenta: data.ncuenta,
                    cinter: data.cinter,
                    moneda: data.moneda,
                    swift: data.swift,
                    destacado: data.destacado
                });
                res.status(200).send({data:cuenta});
            }

            
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_transacciones_venta = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let transacciones = await Transacciones.find({venta:id}).sort({createdAt:-1});
            res.status(200).send({data:transacciones});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

module.exports = {
    create_cuenta,
    get_cuentas,
    get_cuenta,
    update_cuenta,
    get_cuentas_destacadas,
    get_transacciones_venta
}
