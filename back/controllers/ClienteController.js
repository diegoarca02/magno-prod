var Cliente = require('../models/Cliente');
var Cliente_agente = require('../models/Cliente_agente');
var Venta = require('../models/Venta');
var Pago = require('../models/Pago');
var Cliente_ubicacion = require('../models/Cliente_ubicacion');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');
var mongoose = require('mongoose');

var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var jwtsimple = require('jwt-simple');

const Empresa = require('../models/Empresa');
const Empresa_rs = require('../models/Empresa_rs');
const Cliente_empresa_rs = require('../models/Cliente_empresa_rs');
const Colaborador = require('../models/Colaborador');
const Proveedor = require('../models/Proveedor');
const Ingreso = require('../models/Ingreso');
const Solicitud_credito = require('../models/Solicitud_credito');
const Venta_detalle = require('../models/Venta_detalle');
const Pago_completo = require('../models/Pago_completo');

const Cupon_comprador = require('../models/Cupon_comprador');
const Programacion = require('../models/Programacion');
const Programacion_detalle = require('../models/Programacion_detalle');
const Transaccion = require('../models/Transacciones');

const fetch = require('node-fetch');
const https = require('https');
var fs = require('fs');
var GLOBAL = require('../GLOBAL');
const Cliente_facturacion = require('../models/Cliente_facturacion');
const Cliente_cliente_facturacion = require('../models/Cliente_cliente_facturacion');
const Venta_envio = require('../models/Venta_envio');
const Transacciones = require('../models/Transacciones');
const moment = require('moment'); 

const create_cliente = async function(req,res){
    if(req.user){
        let data = req.body;

        var clientes = await Cliente.find({email:data.email});

        if(clientes.length == 0){
            bcrypt.hash('magno',null,null, async function(err,hash){
                if(err){
                    res.status(200).send({data:undefined,message:'No se puedo generar la contraseña.'});
                }else{
                    //Sin empresa
                     //ULTIMA SERIE
                    let last_cliente = await Cliente.find().sort({serie:-1});
                    let new_serie = 0;
                    if(last_cliente.length>=1)new_serie = last_cliente[0].serie + 1; 
                    else new_serie = 1;

                    data.password = hash;
                    data.fullnames = data.nombres + ' ' + data.apellidos;
                    data.serie = new_serie;

                    let cliente = await Cliente.create(data);

                    let cliente_agente = await Cliente_agente.create({
                        tipo: 'Cliente',
                        cliente: cliente._id,
                        colaborador: req.user.sub
                    });

                    console.log(cliente_agente);

                    if(data.ubicacion){
                        data.ubicacion.cliente = cliente._id;
                        await Cliente_ubicacion.create(data.ubicacion);
                    }
                    /* send_email_verificacition(cliente._id,'Cliente'); */
                    send_email_bienvenida(
                        cliente.nombres.trim().split(' ')[0] + ' '+cliente.apellidos.trim().split(' ')[0],
                        cliente.email
                    );
                    res.status(200).send({data:cliente});
                }
            });
        }else{
            res.status(200).send({data:undefined,message:'Correo electrónico no disponible.'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const create_cliente_facturacion = async function(req,res){
    if(req.user){
        let data = req.body;

        var clientes = await Cliente_facturacion.find({email:data.email});

        if(clientes.length == 0){
            const response = await fetch(GLOBAL.GLOBAL.url_fact+'v1/clients/create', {
                method: 'post',
                body: JSON.stringify({
                    "nombre": data.nombres,
                    "apellidos": data.apellidos,
                    "email": data.email,
                    "telefono": data.telefono,
                    "rfc": data.rfc,
                    "codpos": data.zip,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'F-PLUGIN':GLOBAL.GLOBAL.plugin_fact,
                    'F-Api-Key':GLOBAL.GLOBAL.api_fact,
                    'F-Secret-Key':GLOBAL.GLOBAL.secret_dact
                }
            });
            const response_fact = await response.json();
            console.log(response_fact);
            if(response_fact.status == 'error'){
                res.status(200).send({data:undefined,message: 'Ocurrió un error en la facturación'});
            }else{
                data.uid = response_fact.Data.UID;
                let cliente = await Cliente_facturacion.create(data);
                if(data.tipo_usuario == 'Cliente natural'){
                    await Cliente_cliente_facturacion.create({
                        cliente_facturacion: cliente._id,
                        cliente: data.cliente,
                        tipo_usuario: data.tipo_usuario
                    });
                }else{
                    await Cliente_cliente_facturacion.create({
                        cliente_facturacion: cliente._id,
                        empresa: data.empresa,
                        tipo_usuario: data.tipo_usuario
                    });
                }
                res.status(200).send({data:cliente});
            }
        }else{
            res.status(200).send({data:undefined,message:'Correo electrónico no disponible.'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const add_cliente_facturacion = async function(req,res){
    if(req.user){
        let data = req.body;
        let cuenta = {};
        if(data.tipo_usuario == 'Cliente natural'){
            cuenta = await Cliente_cliente_facturacion.create({
                cliente_facturacion: data.cliente_facturacion,
                cliente: data.cliente,
                tipo_usuario: data.tipo_usuario,
            });
        }else{
            cuenta = await Cliente_cliente_facturacion.create({
                cliente_facturacion: data.cliente_facturacion,
                empresa: data.empresa,
                tipo_usuario: data.tipo_usuario,
            });
        }
        res.status(200).send({data:cuenta});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const delete_cliente_facturacion = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let cuenta = await Cliente_cliente_facturacion.findByIdAndRemove({_id:id});
        res.status(200).send({data:cuenta});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_clientes_admin = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];

        send_email_solicitud_credito("64da7a2c03cd3c55e615bf6a");
        if(req.user.rol == 'Administrador'){
            if(filtro == 'Todos'){
                let clientes = await Cliente.find().sort({createdAt:-1});

                var arr_clientes = [];
                for(var item of clientes){
                    let agentes = await Cliente_agente.find({cliente:item._id}).populate('colaborador');
                    arr_clientes.push({
                        cliente: item,
                        agentes: agentes
                    });
                }

                res.status(200).send({data:arr_clientes});
            }else{
                var arr_clientes = [];
                let clientes = await Cliente.find({
                    $or: [
                        {nombres: new RegExp(filtro,'i')},
                        {apellidos: new RegExp(filtro,'i')},
                        {telefono: new RegExp(filtro,'i')},
                        {email: new RegExp(filtro,'i')},
                        {fullnames: new RegExp(filtro,'i')},
                    ]
                }).sort({nombres:1});

                for(var item of clientes){
                    let agentes = await Cliente_agente.find({cliente:item._id}).populate('colaborador');
                    arr_clientes.push({
                        cliente: item,
                        agentes: agentes
                    });
                }

                res.status(200).send({data:arr_clientes});
            }
        }else{
            let clientes = [];
            let data = [];

            let clientes_propios = await Cliente_agente.find({colaborador:req.user.sub});

            if(filtro == 'Todos'){
                clientes = await Cliente.find().sort({createdAt:-1});
            }else{
                clientes = await Cliente.find({
                    $or: [
                        {nombres: new RegExp(filtro,'i')},
                        {apellidos: new RegExp(filtro,'i')},
                        {telefono: new RegExp(filtro,'i')},
                        {email: new RegExp(filtro,'i')},
                        {fullnames: new RegExp(filtro,'i')},
                    ]
                }).sort({nombres:1});
            }

            for(var item of clientes){
                let exist = clientes_propios.filter(subitem=> subitem.cliente.toString() == item._id.toString());
                let agentes = await Cliente_agente.find({cliente:item._id}).populate('colaborador');
                if(exist.length >= 1) data.push({
                    cliente: item,
                    agentes: agentes
                });
            }

            res.status(200).send({data:data});
        }
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_clientes_latest = async function(req,res){
    if(req.user){
        var arr_clientes = [];
        let clientes = await Cliente.find().sort({createdAt:-1}).limit(10);
        for(var item of clientes){
            arr_clientes.push({
                cliente: item,
                agentes: []
            });
        }
        res.status(200).send({data:arr_clientes});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_cliente_admin = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let cliente = await Cliente.findById({_id:id});
            if(cliente){
                let clientes_colaboradores = await Cliente_agente.find({cliente:id}).populate('colaborador');
                let cuentas = await Cliente_cliente_facturacion.find({cliente:id}).populate('cliente_facturacion');

                let ventas = await Venta.find({
                    cliente:cliente._id,
                    pago: 'Pendiente',
                    $or : [
                        {estado: {$ne: 'Pendiente'}},
                        {estado: {$ne: 'Cancelado'}},
                    ]
                });
                let deuda = 0;

                for(var item of ventas){
                    deuda = deuda + (item.monto_ventas - item.monto_pagado)
                }
             
                res.status(200).send({
                    data:cliente,
                    colaboradores: clientes_colaboradores,
                    deuda: deuda,
                    cuentas: cuentas
                });
            }else{
                res.status(200).send({data:undefined});
            }
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_clientes_facturacion_cliente = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let clientes_facturacion = await Cliente_cliente_facturacion.find({cliente:id}).populate('cliente_facturacion');
         
            res.status(200).send({data:clientes_facturacion});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
    
}

const get_clientes_facturacion_empresa = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let clientes_facturacion = await Cliente_cliente_facturacion.find({empresa:id}).populate('cliente_facturacion');
            res.status(200).send({data:clientes_facturacion});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
    
}

const get_clientes_facturacion = async function(req,res){
    if(req.user){
        try {
            let clientes_facturacion = await Cliente_facturacion.find();
            res.status(200).send({data:clientes_facturacion});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    } 
}

const remove_cliente_agente = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let clientes_colaboradores = await Cliente_agente.findByIdAndRemove({_id:id}).populate('colaborador');
            res.status(200).send({data:clientes_colaboradores});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const agregar_cliente_agente = async function(req,res){
    if(req.user){
        try {
            let data = req.body;
            let cliente_colaborador = await Cliente_agente.create(data);
            res.status(200).send({data:cliente_colaborador});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const set_solicitud_credito = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let estado = req.params['estado'];
            console.log(estado);
            if(estado == 'Denegar'){
                var solicitud = await Solicitud_credito.findOne({_id:id}).populate('venta');

                await Solicitud_credito.findByIdAndUpdate({_id:id},{
                    estado: 'Denegado'
                });

                await Venta.findByIdAndUpdate({_id:solicitud.venta._id},{
                    estado: 'Cancelado'
                });

                await Venta_detalle.updateMany({venta:solicitud.venta._id},{
                    estado: 'Cancelado'
                });

                await Pago.updateMany({venta:solicitud.venta._id},{
                    estado: 'Cancelado'
                });

                await Pago_completo.updateMany({venta:solicitud.venta._id},{
                    estado: 'Cancelado'
                });

                await Programacion.updateMany({venta:solicitud.venta._id},{
                    estado: 'Cancelado'
                });

                await Programacion_detalle.updateMany({venta:solicitud.venta._id},{
                    estado: 'Cancelado'
                });

                res.status(200).send({data:true});

                
            }else if(estado == 'Confirmar'){
                var solicitud = await Solicitud_credito.findOne(
                    {_id:id,estado: 'Pendiente'}
                ).populate('venta');


                if(solicitud.venta.estado != 'Cancelado'){
                    let cliente = await Cliente.findById({_id:solicitud.cliente});
                    let nuevo_credito = cliente.credito_total + solicitud.monto;
                    
                    if(nuevo_credito >= 0){
                        await Cliente.findByIdAndUpdate({_id:solicitud.cliente},{
                            credito_total: nuevo_credito,
                            credito_disponible: cliente.credito_disponible + solicitud.monto
                        });
                        await Solicitud_credito.findByIdAndUpdate({_id:id},{
                            estado: 'Aprobado',
                            createdAt_resolucion: Date.now()
                        });

                        await Venta.findByIdAndUpdate({_id:solicitud.venta._id},{
                            estado: 'Procesado',
                        });

                        await Venta_detalle.updateMany({venta:solicitud.venta._id},{
                            estado: 'Procesado',
                        });

                        await Programacion.updateMany({venta:solicitud.venta._id},{
                            estado: 'Procesado',
                        });

                        await Programacion_detalle.updateMany({venta:solicitud.venta._id},{
                            estado: 'Procesado',
                        });
                        

                        send_email_solicitud_credito(id);
                        res.status(200).send({data:true});
                    }else{
                        res.status(200).send({data:undefined,message: 'El limite de credito no puede ser negativo.'});
                    }

                }else{
                    res.status(200).send({data:undefined,message: 'La venta vinculada esta cancelada.'});
                }
            }
 
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_creditos_cliente = async function (req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            var historial = await Solicitud_credito.find({cliente:id,$or: [
                {estado: 'Aprobado'},
                {estado: 'Denegado'},
            ]}).populate('colaborador').populate('venta').populate('programacion').sort({createdAt:-1});
            res.status(200).send({data:historial});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const  get_solicitudes_cliente = async function (req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            var solicitudes = await Solicitud_credito.find({cliente:id})
            .populate('venta')
            .sort({createdAt:-1});
            res.status(200).send({data:solicitudes});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_cliente_cobranza_admin = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let tipo = req.params['tipo'];
           
            var data_cliente = {};

            if(tipo == 'cliente'){
                let cliente = await Cliente.findById({_id:id});
             
                var total = 0;
                var deuda = 0;
                var ventas = await Venta.find({cliente:cliente._id,pago: 'Pendiente'});
                var historial = await Solicitud_credito.find({cliente:cliente._id,estado: 'Aprobado'}).populate('colaborador').sort({createdAt:-1});
                var solicitudes = await Solicitud_credito.find({cliente:cliente._id,estado: 'Abierto'}).populate('venta');
                for(var subitem of ventas){
                    if(subitem.estado != 'Cancelado'){
                        total = total + (subitem.total-subitem.descuento);
                        let pago_venta = 0; //Pago actual de venta
                        let deuda_venta = 0;
                        let pagos = await Pago.find({venta:subitem._id});
                        for(var pg of pagos){
                            pago_venta = pago_venta + pg.monto;
                        }
        
                        deuda_venta = (subitem.total-subitem.descuento) - pago_venta;
                        deuda = deuda + deuda_venta;
                    }
                }
    
                data_cliente = {
                    tipo: 'Cliente',
                    cliente: cliente,
                    total: total,
                    deuda: deuda,
                    historial,
                    solicitudes
                };
            }else if(tipo == 'empresa'){
                let empresa_rs = await Empresa_rs.findById({_id:id}).populate('empresa');
               
                var total = 0;
                var deuda = 0;
                var ventas = await Venta.find({empresa_rs:empresa_rs._id,pago: 'Pendiente'});
                var historial = await Solicitud_credito.find({empresa_rs:empresa_rs._id,estado: 'Aprobado'}).populate('colaborador').sort({createdAt:-1});
                var solicitudes = await Solicitud_credito.find({empresa_rs:empresa_rs._id,estado: 'Abierto'}).populate('venta');

                for(var subitem of ventas){
                    if(subitem.estado != 'Cancelado'){
                        total = total + subitem.total;
                        let pago_venta = 0; //Pago actual de venta
                        let deuda_venta = 0;
                        let pagos = await Pago.find({venta:subitem._id});
                        for(var pg of pagos){
                            pago_venta = pago_venta + pg.monto;
                        }
        
                        deuda_venta = subitem.total - pago_venta;
                        deuda = deuda + deuda_venta;
                    }
                }
    
                data_cliente = {
                    tipo: 'Empresa',
                    empresa: empresa_rs,
                    total: total,
                    deuda: deuda,
                    historial,
                    solicitudes
                };
            }

            res.status(200).send({data:data_cliente});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const update_cliente = async function(req,res){
    if(req.user){
        let data = req.body;
        let id = req.params['id'];

        data.fullnames = data.nombres + ' ' + data.apellidos;

        try {
            var clientes = await Cliente.find({email:data.email});

            if(clientes.length == 0){
                let cliente = await Cliente.findByIdAndUpdate({_id:id},{
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    email: data.email,
                    fullnames: data.fullnames,
                    telefono: data.telefono,
                    rfc: data.rfc,
                    nacimiento: data.nacimiento,
                    prefijo: data.prefijo,
                })
                

                res.status(200).send({data:cliente});
            }else{
                if(clientes[0].email == data.email){
                    let cliente = await Cliente.findByIdAndUpdate({_id:id},{
                        nombres: data.nombres,
                        apellidos: data.apellidos,
                        email: data.email,
                        fullnames: data.fullnames,
                        telefono: data.telefono,
                        rfc: data.rfc,
                        nacimiento: data.nacimiento,
                        prefijo: data.prefijo,
                    })
                    var response_fact;
                   
                    res.status(200).send({data:cliente});
                }else{
                    res.status(200).send({data:undefined,message:'Correo electrónico no disponible.'});
                }
            }
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const verification_email_cliente = async function(req,res){
    var tipo = req.params['tipo'];
    var token_param = req.params['token'];
    console.log(tipo);
    var token = token_param.replace(/['"]+/g,'');
    var segment = token.split('.');

    if(segment.length != 3){
        return res.status(403).send({message: 'InvalidToken'});
    }else{
        try {
            if(tipo == 'Cliente'){
                var payload = jwtsimple.decode(token,'a#z5#znw$#YWFz@2nuZiWAk4!7Pv8IqJHg^qKsLc9gy@tJjwVz');
                let cliente = await Cliente.findByIdAndUpdate({_id:payload.sub},{
                    verificacion:true
                });
                res.status(200).send({data:cliente}); 
            }else if(tipo == 'Colaborador'){
                var payload = jwtsimple.decode(token,'a#z5#znw$#YWFz@2nuZiWAk4!7Pv8IqJHg^qKsLc9gy@tJjwVz');
                console.log(payload);
                let colaborador = await Colaborador.findByIdAndUpdate({_id:payload.sub},{
                    verificacion:true
                });
                res.status(200).send({data:colaborador}); 
            }else if(tipo == 'Proveedor'){
                var payload = jwtsimple.decode(token,'a#z5#znw$#YWFz@2nuZiWAk4!7Pv8IqJHg^qKsLc9gy@tJjwVz');
                console.log(payload);
                let proveedor = await Proveedor.findByIdAndUpdate({_id:payload.sub},{
                    verificacion:true
                });
                res.status(200).send({data:proveedor}); 
            }
        } catch (error) {
            console.log(error);
            return res.status(403).send({message: 'El token de acceso de este correo de verificación ya expiró, \n vuelve a solicitar un nuevo correo de verificación.',data: null});
        }
    }
}

const send_email_verificacition = async function(id,tipo){

    var readHTMLFile = function(path, callback) {
        fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
            if (err) {
                throw err;
                callback(err);
            }
            else {
                callback(null, html);
            }
        });
    };

    var transporter = nodemailer.createTransport(smtpTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: 'seller@ooneunion.com',
            pass: '9T0@A*b90@2CxK'
        },
        tls: {
            ciphers: 'SSLv3'
        },
        requireTLS: true
    }));


    readHTMLFile(process.cwd() + '/mails/email-verification.html', async (err, html)=>{
        let email;

        let cliente = await Cliente.findById({_id:id});
        email = cliente.email;
        var token = jwt.createToken(cliente);   
        let rest_html = ejs.render(html, {nombres: cliente.nombres,token:token,tipo:tipo });

        var template = handlebars.compile(rest_html);
        var htmlToSend = template({op:true});

        var mailOptions = {
            from: '"OOneunion" <seller@ooneunion.com>',
            to: email,
            subject: 'Verificación de correo eletrónico.',
            html: htmlToSend
        };
      
        transporter.sendMail(mailOptions, async function(error, info){
            if (!error) {
                console.log(info);
            }else{
                console.log(error);
            }
        });
    
    });
}

const get_ubicaciones_clientes = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let tipo = req.params['tipo'];
            if(tipo=='Cliente'){
                let ubicaciones = await Cliente_ubicacion.find({cliente:id, status: true}).sort({createdAt:-1});
                res.status(200).send({data:ubicaciones});
            }else if(tipo=='Empresa'){
                let ubicaciones = await Cliente_ubicacion.find({empresa:id, status: true}).sort({createdAt:-1});
                res.status(200).send({data:ubicaciones});
            }
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_ubicaciones_empresa = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            console.log(id);
            let ubicaciones = await Cliente_ubicacion.find({empresa:id}).sort({createdAt:-1});
            res.status(200).send({data:ubicaciones});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const create_ubicacion_clientes = async function(req,res){
    if(req.user){
        let data = req.body;
        let ubicacion = await Cliente_ubicacion.create(data);
        res.status(200).send({data:ubicacion});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const create_ubicacion_empresa = async function(req,res){
    if(req.user){
        let data = req.body;
        let ubicacion = await Cliente_ubicacion.create(data);
        res.status(200).send({data:ubicacion});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const update_ubicacion_cliente = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;
        let ubicacion;
        console.log(data);

        if(data.mapboxChanged){
            ubicacion = await Cliente_ubicacion.findByIdAndUpdate({ _id:id},{
                encargado: data.encargado,
                prefijo: data.prefijo,
                telefono: data.telefono,
                tipo: data.tipo,
    
                text_es: data.text_es,
                place_name_es: data.place_name_es,
                id_mapbox: data.id_mapbox,
                lat: data.lat,
                lng: data.lng,
                country: data.country,
                region: data.region,
                place: data.place,
                locality: data.locality,
                postcode: data.postcode,
            });
        }else{
            ubicacion = await Cliente_ubicacion.findByIdAndUpdate({ _id:id},{
                encargado: data.encargado,
                prefijo: data.prefijo,
                telefono: data.telefono,
                tipo: data.tipo,
            });
        }
        
        res.status(200).send({data:ubicacion});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_ubicacion_cliente = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        
        let ubicacion = await Cliente_ubicacion.findById({_id:id});
        res.status(200).send({data:ubicacion});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const delete_ubicacion_cliente = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        console.log(id);
        let ubicacion = await Cliente_ubicacion.findByIdAndUpdate({_id:id},{
            status: false
        });
        res.status(200).send({data:ubicacion});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}




const set_status_cliente = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;
        let nuevo_estado;
    
        if(data.estado){
            nuevo_estado = false;
        }else if(!data.estado){
            nuevo_estado = true;
        }
    
        let cliente = await Cliente.findByIdAndUpdate({_id:id},{
            estado: nuevo_estado
        });
        res.status(200).send({data:cliente});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const get_empresas_admin = async function(req,res){
    if(req.user){

        let filtro = req.params['filtro'];

        if(req.user.rol == 'Administrador'){
            let empresas = [];
            let data = [];
            if(filtro == 'Todos'){
                empresas = await Empresa.find();
            }else{
                empresas = await Empresa.find({razon_social: new RegExp(filtro,'i')}).sort({razon_social:1});
            }

            for(var item of empresas){
                let agentes = await Cliente_agente.find({empresa:item._id}).populate('colaborador');
                data.push({
                    empresa: item,
                    agentes: agentes
                });
            }
            res.status(200).send({data:data});
        }else{
            let empresas = [];
            let data = [];

            let clientes_propios = await Cliente_agente.find({colaborador:req.user.sub,tipo:'Empresa'});
            if(filtro == 'Todos'){
                empresas = await Empresa.find();
            }else{
                empresas = await Empresa.find({razon_social: new RegExp(filtro,'i')}).sort({razon_social:1});
            }

            for(var item of empresas){
                let exist = clientes_propios.filter(subitem=> subitem.empresa.toString() == item._id.toString());
                let agentes = await Cliente_agente.find({empresa:item._id}).populate('colaborador');
                if(exist.length >= 1) data.push({
                    empresa: item,
                    agentes: agentes
                });
            }
            res.status(200).send({data:data});
        }
        
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_data_empresa = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
        
            let rs = await Empresa_rs.find({empresa:id});
            let clientes = await Cliente_empresa_rs.find({empresa:id}).populate('cliente');
            res.status(200).send({data:true,rs,clientes});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const add_cliente_empresa_rs = async function(req,res){
    if(req.user){
        let data = req.body;
        let cliente_empresa = await Cliente_empresa_rs.find({cliente:data.cliente,empresa:data.empresa});

        if(cliente_empresa.length == 0){
            let cliente = await Cliente_empresa_rs.create(data);
            res.status(200).send({data:cliente});
        }else{
            res.status(200).send({data:undefined,message: 'El cliente ya se encuentra dentro.'});
        } 
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const add_empresa_rs = async function(req,res){
    if(req.user){
        let data = req.body;
        let empresas_rs = await Empresa_rs.find({razon_social:data.razon_social});

        if(empresas_rs.length == 0){
            let empresa_rs = await Empresa_rs.create(data);
            res.status(200).send({data:empresa_rs});
        }else{
            res.status(200).send({data:undefined,message: 'El razón social ya existe.'});
        } 
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const set_status_empresa = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;
        let nuevo_estado;
    
        if(data.estado){
            nuevo_estado = false;
        }else if(!data.estado){
            nuevo_estado = true;
        }
    
        let empresa = await Empresa.findByIdAndUpdate({_id:id},{
            estado: nuevo_estado
        });
        res.status(200).send({data:empresa});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const get_empresa_rs_admin = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        if(filtro == 'Todos'){
            let empresas = await Empresa_rs.find().populate('empresa').sort({createdAt:-1});
            res.status(200).send({data:empresas});
        }else{
            let empresas = await Empresa_rs.find({
                $or: [
                    {razon_social: new RegExp(filtro,'i')},
                ]
            }).populate('empresa').sort({razon_social:1});
            res.status(200).send({data:empresas});
        }
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_empresa_clientes = async function(req,res){
    if(req.user){
        let data = [];
        let filtro = req.params['filtro'];
        let clientes = await Cliente.find({
            $or: [
                {nombres: new RegExp(filtro,'i')},
                {apellidos: new RegExp(filtro,'i')},
                {telefono: new RegExp(filtro,'i')},
                {email: new RegExp(filtro,'i')},
                {fullnames: new RegExp(filtro,'i')},
            ]
        ,estado:true});
        //
        console.log(req.user.rol);

        if(req.user.rol == 'Administrador'){
            for(var item of clientes){
                data.push({
                    tipo: 'Cliente',
                    cliente: item,
                });  
            }
        }else{
            let clientes_propios = await Cliente_agente.find({colaborador:req.user.sub});
            for(var item of clientes){
                let exist = clientes_propios.filter(subitem=> subitem.cliente.toString() == item._id.toString());
                if(exist.length >= 1){
                    data.push({
                        tipo: 'Cliente',
                        cliente: item,
                    });
                }     
            }
        }

        res.status(200).send({data:data});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_empresa_clientes_todos = async function(req,res){
    if(req.user){
        let data = [];
        let filtro = req.params['filtro'];
        
        if(filtro != 'Todos'){
            let clientes = await Cliente.find({
                $or: [
                    {nombres: new RegExp(filtro,'i')},
                    {apellidos: new RegExp(filtro,'i')},
                    {telefono: new RegExp(filtro,'i')},
                    {email: new RegExp(filtro,'i')},
                    {fullnames: new RegExp(filtro,'i')},
                ]
            ,estado:true});
            let empresas_rs = await Empresa_rs.find({razon_social: new RegExp(filtro,'i'),estado:true}).populate('empresa');
    
            for(var item of clientes){
                var total = 0;
                var deuda = 0;
                var ventas = await Venta.find({cliente:item._id,pago: 'Pendiente'});
                
                for(var subitem of ventas){
                    if(subitem.estado != 'Cancelado'){
                        total = total + subitem.total;
                        let pago_venta = 0; //Pago actual de venta
                        let deuda_venta = 0;
                        let pagos = await Pago.find({venta:subitem._id});
                        for(var pg of pagos){
                            pago_venta = pago_venta + pg.monto;
                        }

                        deuda_venta = subitem.total - pago_venta;
                        deuda = deuda + deuda_venta;
                    }
                }

                data.push({
                    tipo: 'Cliente',
                    cliente: item,
                    total: total,
                    deuda: deuda
                });
            }
    
            for(var item of empresas_rs){
                var total = 0;
                var deuda = 0;
                var ventas = await Venta.find({empresa_rs:item._id,pago: 'Pendiente'});
                
                for(var subitem of ventas){
                    if(subitem.estado != 'Cancelado'){
                        total = total + subitem.total;
                        let pago_venta = 0; //Pago actual de venta
                        let deuda_venta = 0;
                        let pagos = await Pago.find({venta:subitem._id});
                        for(var pg of pagos){
                            pago_venta = pago_venta + pg.monto;
                        }
    
                        deuda_venta = subitem.total - pago_venta;
                        deuda = deuda + deuda_venta;
                    }
                    
                }

                data.push({
                    tipo: 'Empresa',
                    empresa: item,
                    total: total,
                    deuda: deuda
                });
            }

    
            res.status(200).send({data:data});
        }else{
            let clientes = await Cliente.find({estado:true});
            let empresas_rs = await Empresa_rs.find({estado:true}).populate('empresa');
    
            for(var item of clientes){
                var total = 0;
                var deuda = 0;
                var ventas = await Venta.find({cliente:item._id,pago: 'Pendiente'});
                
                for(var subitem of ventas){
                    if(subitem.estado != 'Cancelado'){
                        total = total + subitem.total;
                        let pago_venta = 0; //Pago actual de venta
                        let deuda_venta = 0;
                        let pagos = await Pago.find({venta:subitem._id});
                        for(var pg of pagos){
                            pago_venta = pago_venta + pg.monto;
                        }
    
                        deuda_venta = subitem.total - pago_venta;
                        deuda = deuda + deuda_venta;
                    }
                    
                }

                data.push({
                    tipo: 'Cliente',
                    cliente: item,
                    total: total,
                    deuda: deuda
                });
            }
    
            for(var item of empresas_rs){
                var total = 0;
                var deuda = 0;
                var ventas = await Venta.find({empresa_rs:item._id,pago: 'Pendiente'});
                
                for(var subitem of ventas){
                    if(subitem.estado != 'Cancelado'){
                        total = total + subitem.total;
                        let pago_venta = 0; //Pago actual de venta
                        let deuda_venta = 0;
                        let pagos = await Pago.find({venta:subitem._id});
                        for(var pg of pagos){
                            pago_venta = pago_venta + pg.monto;
                        }
    
                        deuda_venta = subitem.total - pago_venta;
                        deuda = deuda + deuda_venta;
                    }
                    
                }

                data.push({
                    tipo: 'Empresa',
                    empresa: item,
                    total: total,
                    deuda: deuda
                });
            }
    
            res.status(200).send({data:data});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const update_cliente_credito = async function(req,res){
    if(req.user){
        let data = req.body;
        console.log(data);

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            
            //CALCULAR SERIE
            let last_solicitud = await Solicitud_credito.find().sort({serie:-1});
            let new_serie = 0;
            if(last_solicitud.length>=1)new_serie = last_solicitud[0].serie + 1; 
            else new_serie = 1;

            let ventas = await Venta.find({
                cliente: data.cliente,
                tipo_pago: 'Contado',
                pago: 'Pendiente',
                $or : [
                    {estado: {$ne: 'Pendiente'}},
                    {estado: {$ne: 'Cancelado'}},
                ]
            });
            let deuda = 0;

            for(var item of ventas){
                deuda = deuda + (item.monto_total - item.monto_pagado)
            }

            if(deuda == 0){   
                if(data.monto >= 1){

                    if(data.tipo == 'Amplitud'){
                    
                        let solicitud = await Solicitud_credito.create({
                            cliente: data.cliente,
                            tipo_usuario: 'Cliente natural',
                            monto: data.monto,
                            tipo: 'Ampliación',
                            colaborador: req.user.sub,
                            serie: new_serie,
                            day: new Date().getDate(),
                            month: new Date().getMonth()+1,
                            year: new Date().getFullYear(),
                            estado: 'Aprobado',
                            createdAt_resolucion: Date.now(),
                        });
    
                        let cliente = await Cliente.findById({_id:data.cliente});
    
                        await Cliente.findByIdAndUpdate({_id:data.cliente},{
                            credito_total: cliente.credito_total + data.monto,
                            credito_disponible: cliente.credito_disponible + data.monto
                        });
    
                        // Commit de la transacción
                        await session.commitTransaction();
                        session.endSession();
    
                        res.status(200).send({data:solicitud});
    
                    }else{
                        let cliente = await Cliente.findById({_id:data.cliente});
    
                        if(data.monto <= cliente.credito_disponible){
                            let solicitud = await Solicitud_credito.create({
                                cliente: data.cliente,
                                tipo_usuario: 'Cliente natural',
                                monto: -data.monto,
                                tipo: 'Reducción',
                                colaborador: req.user.sub,
                                serie: new_serie,
                                day: new Date().getDate(),
                                month: new Date().getMonth()+1,
                                year: new Date().getFullYear(),
                                estado: 'Aprobado',
                                createdAt_resolucion: Date.now(),
                            });
    
                            await Cliente.findByIdAndUpdate({_id:data.cliente},{
                                credito_total: cliente.credito_total - data.monto,
                                credito_disponible: cliente.credito_disponible - data.monto
                            });
        
                            // Commit de la transacción
                            await session.commitTransaction();
                            session.endSession();
        
                            res.status(200).send({data:solicitud});
                        }else{
                            res.status(200).send({data:undefined,message:'La reducción no puede ser mayor al saldo disponible.'});
                        }
                    }
                }else{
                    await session.abortTransaction();
                    session.endSession();
                    res.status(200).send({data:undefined,message:'El monto no puede ser negativo.'});
                }
            }else{
                res.status(200).send({data:undefined,message:'El cliente tiene deuda de contado.'});
            }

            
        } catch (error) {
            // Rollback de la transacción en caso de error
            await session.abortTransaction();
            session.endSession();
            res.status(200).send({data:undefined});
           
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_reduccion_cliente_credito = async function(req,res){
    if(req.user){
        let data = req.body;
        console.log(data);
        if(data.tipo_usuario == 'Cliente'){   
            let cliente_data = await Cliente.findById({_id:data.cliente});
            if(cliente_data.limit_credito){
                if(data.monto <= cliente_data.limit_credito){
                    let nuevo_credito = cliente_data.limit_credito - data.monto;

                    await Cliente.findByIdAndUpdate({_id:data.cliente},{
                        limit_credito: nuevo_credito,
                    })

                    data.colaborador = req.user.sub;
                    data.monto = -data.monto;
                    data.tipo = 'Reduccion';
                    let solicitud = await Solicitud_credito.create(data);

                    res.status(200).send({data:solicitud});
                }else{
                    res.status(200).send({data:undefined,message:'El monto supera el crédito disponible'});
                }
            }else{
                res.status(200).send({data:undefined,message:'El cliente no tiene crédito'});
            }
            
        }else if(data.tipo_usuario == 'Empresa'){
            let empresa_data = await Empresa_rs.findById({_id:data.empresa_rs});

            if(empresa_data.limit_credito){
                if(data.monto <= empresa_data.limit_credito){
                    let nuevo_credito = empresa_data.limit_credito - data.monto;

                    await Empresa_rs.findByIdAndUpdate({_id:data.empresa_rs},{
                        limit_credito: nuevo_credito,
                    })

                    data.colaborador = req.user.sub;
                    data.monto = -data.monto;
                    let solicitud = await Solicitud_credito.create(data);

                    res.status(200).send({data:solicitud});
                }else{
                    res.status(200).send({data:undefined,message:'El monto supera el crédito disponible'});
                }
            }else{
                res.status(200).send({data:undefined,message:'El cliente no tiene crédito'});
            }

        }
        
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_credito_cliente = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let tipo = req.params['tipo'];

        if(tipo == 'Cliente'){
            var arr_ventas = [];
            var arr_pagos = [];
            var total = 0;
            var deuda = 0;
            var ventas = await Venta.find({cliente:id,pago: 'Pendiente',tipo_pago:'Credito',estado: 
            {$ne: 'Cancelado'}});
            var cliente = await Cliente.findById({_id:id});
   
            
            for(var subitem of ventas){
                total = total + (subitem.monto_ventas-subitem.descuento);
                let pago_venta = 0; //Pago actual de venta
                let deuda_venta = 0;
                let pagos = await Pago.find({venta:subitem._id,estado:'Aprobado'});
                for(var pg of pagos){
                    pago_venta = pago_venta + pg.monto;
                    arr_pagos.push(pg);
                }

                deuda_venta = (subitem.monto_ventas-subitem.descuento) - pago_venta;
                deuda = deuda + deuda_venta;

                let porcent = (pago_venta*100)/subitem.monto_ventas;
                arr_ventas.push({
                    venta: subitem,
                    pago_actual: pago_venta,
                    porcent: porcent.toFixed(2),
                    deuda: deuda_venta,
                });
            }


            let cuentas = await Cliente_cliente_facturacion.find({cliente:id}).populate('cliente_facturacion');

            let programaciones = await Programacion_detalle.find({cliente:id,estado:'Realizado'}).populate('producto')
            .populate('producto_variacion').populate('pedido'); 
            //vincular detalle de programacion con ingreso
            let solicitudes = await Solicitud_credito.find({cliente:id,estado: 'Abierto'});
            res.status(200).send({
                deuda,
                ventas:arr_ventas,
                pagos:arr_pagos,
                cliente,
                programaciones,
                cuentas: cuentas,
                solicitudes: solicitudes.length
            });
        }else if(tipo == 'Empresa'){
            var arr_ventas = [];
            var arr_pagos = [];
            var total = 0;
            var deuda = 0;
            var ventas = await Venta.find({empresa_rs:id,pago: 'Pendiente',tipo_pago:'Credito',estado: {$ne: 'Cancelado'}});
            var empresa_rs = await Empresa_rs.findById({_id:id});
            
            for(var subitem of ventas){
                total = total + subitem.monto_ventas;
                let pago_venta = 0; //Pago actual de venta
                let deuda_venta = 0;
                let pagos = await Pago.find({venta:subitem._id,estado:'Aprobado'});
                for(var pg of pagos){
                    pago_venta = pago_venta + pg.monto;
                    arr_pagos.push(pg);
                }

                deuda_venta = subitem.monto_ventas - pago_venta;
                deuda = deuda + deuda_venta;

                let porcent = (pago_venta*100)/subitem.monto_ventas;
                arr_ventas.push({
                    venta: subitem,
                    pago_actual: pago_venta,
                    porcent: porcent.toFixed(2),
                    deuda: deuda_venta,
                });
            }
            

            let cuentas = await Cliente_cliente_facturacion.find({empresa:empresa_rs.empresa}).populate('cliente_facturacion');

            res.status(200).send({
                total,
                deuda,
                limit_days:empresa_rs.limit_days,
                limit_credito:empresa_rs.limit_credito,
                ventas:arr_ventas,pagos:arr_pagos,
                cuentas: cuentas
            });
        }

    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_tiempo_credito_cliente = async function(req,res){
    if(req.user){
        let tipo = req.params['tipo'];
        let id = req.params['id'];
        let limit_days = req.params['limit_days'];

        if(tipo == 'Cliente'){
            let cliente = await Cliente.findByIdAndUpdate({_id:id},{
                limit_days:limit_days
            });
        }else if(tipo == 'Empresa'){
            let empresa = await Empresa.findByIdAndUpdate({_id:id},{
                limit_days:limit_days
            });
        }

        res.status(200).send({data:true});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_solicitudes_abiertas = async function(req,res){
    if(req.user){

        let solicitudes = await Solicitud_credito.find({estado:'Abierto'}).populate('venta').populate('cliente').populate('empresa_rs').sort({createdAt:-1});
        res.status(200).send({data:solicitudes});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_envios_notas = async function(req,res){
    if(req.user){
        /* let compradores */
        const id = req.params['id']; // Página predeterminada
        let compradores = [];
        let data = [];
        let total = 0;
        let pagado = 0;

        let ventas = await Venta.find({cliente:id,$or:[
            {estado: {$ne: 'Entregado'}},
            {estado: {$ne: 'Cancelado'}}
        ]});

        console.log(ventas.length);

        let arr_pagos = [];
        let arr_envios = [];
        for(var item of ventas){
            let montoRestante = item.monto_pagado;
            let envios = await Venta_envio.find({venta:item._id}).sort({serie:1});
            let pagos = await Transacciones.find({estado:true,descripcion:'El cliente realizo un pago',venta:item._id})
            .populate('cliente').populate('venta');
            arr_pagos.push(...pagos);
            for(var subitem of envios){
                total = total + subitem.subtotal;
                let monto_pagado = 0;
                if (montoRestante > 0) {
                    // Calcular el monto a pagar en la deuda actual
                    let pago = Math.min(subitem.subtotal, montoRestante);
                    
                    // Restar el monto pagado del monto restante
                    montoRestante -= pago;
                    
                    // Agregar el campo pagado al objeto deuda
                    monto_pagado = pago;
                } else {
                    // Si no queda dinero, el pago es 0
                    monto_pagado = 0;
                }

                let detalles = await Venta_detalle.find({venta_envio: subitem._id}).populate('producto_variacion')
                .populate('producto').populate('ingreso_detalle');

                pagado = pagado + monto_pagado;

                arr_envios.push({
                    envio:subitem,
                    pagado: monto_pagado,
                    detalles: detalles
                });
            }
        }

        res.status(200).send({data:arr_envios,total,pagado,pagos:arr_pagos});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_clientes_notas = async function(req,res){
    if(req.user){
        let clientes = await Cliente.find().sort({serie:1});
        let arr_clientes = [];

        for(let item of clientes){
            let direcciones = await Cliente_ubicacion.find({cliente:item._id});
            let ventas = await Venta.find({cliente:item._id,$or:[
                {estado: {$ne: 'Entregado'}},
                {estado: {$ne: 'Cancelado'}}
            ]});
            let total = 0;
            let pagado = 0;
            let arr_days = [];

            for(var item_venta of ventas){
                let montoRestante = item_venta.monto_pagado;
                let envios = await Venta_envio.find({venta:item_venta._id}).sort({serie:1});
             
                for(var subitem of envios){
                    total = total + subitem.subtotal;
                    if (montoRestante > 0) {
                        let pago = Math.min(subitem.subtotal, montoRestante);
                        montoRestante -= pago;
                        pagado = pagado + pago;
                    } else {
                        pagado = 0;
                    }

                    if(subitem.fecha_entrega){
                        var date_envio = moment();
                        var today = moment(subitem.fecha_entrega);
                        var diasPasados = date_envio.diff(today, 'days');
                        arr_days.push(diasPasados);
                    }
                }
            }

            console.log(arr_days);

            arr_clientes.push({
                _id: item._id,
                serie: item.serie,
                email: item.email,
                nombres: item.nombres,
                apellidos: item.apellidos,
                credito_total: item.credito_total,
                region: direcciones[0]?.region,
                total: total,
                pagado: pagado,
                dias: Math.max(...arr_days)
            });
        }
        res.status(200).send({data:arr_clientes});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_deudas_comprador = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let cliente = await Cliente.findById({_id:id});

        let arr_ventas = [];
        let ventas = await Venta.find({cliente:cliente._id,pago:'Pendiente'});
        let monto_pagado = 0;
        for(var subitem of ventas){
            let detalles_entregados = await Venta_detalle.find({venta:subitem._id,estado:'Entregado',tipo_detalle:'En almacen'});
            let monto_entregados = 0;
            for(let item of detalles_entregados){
                monto_entregados = monto_entregados + (parseFloat(item.cantidad)*parseFloat(item.precio));
            }

            monto_pagado = monto_pagado+subitem.monto_pagado;

            arr_ventas.push({
                venta: subitem,
                monto_pagado, 
                monto_entregados: monto_entregados,
            });
        }

        res.status(200).send({data:arr_ventas,cliente});

    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_cliente_umedida = async function(req,res){
    if(req.user){
        let data = req.body;
        let id = req.params['id'];

        try {
            let cliente = await Cliente.findByIdAndUpdate({_id:id},{
                umedida_cantidad: data.umedida_cantidad,
            })
        
            res.status(200).send({data:cliente});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_pagos_clientes = async function(req,res){
    if(req.user){
        let id = req.params['id'];

        try {
            let transacciones = await Transaccion.find({cliente:id}).populate('venta').sort({createdAt:-1});
            res.status(200).send({data:transacciones});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_ventas_clientes = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        try {
            let ventas = await Venta.find({cliente:id}).sort({createdAt:-1});
            res.status(200).send({data:ventas});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const send_email_bienvenida = async function(name,email){

    try {
        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };
    
        var transporter = nodemailer.createTransport(smtpTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
                user: 'seller@ooneunion.com',
                pass: '9T0@A*b90@2CxK'
            },
            tls: {
                ciphers: 'SSLv3'
            },
            requireTLS: true
        }));
    
    
        readHTMLFile(process.cwd() + '/mails/email-cliente-bienvenida.html', async (err, html)=>{
            
    
            let rest_html = ejs.render(html, {name:name});
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: '"OOneunion" <seller@ooneunion.com>',
                to: email,
                subject: 'Bienvenido a OOneunion.',
                html: htmlToSend
            };
          
            transporter.sendMail(mailOptions, async function(error, info){
                if (!error) {
                    console.log(info);
                }else{
                    console.log(error);
                }
            });
        
        });
    } catch (error) {
        console.log(error);
    }
}

const send_email_solicitud_credito = async function(id){

    /* try {
        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });
        };
    
        var transporter = nodemailer.createTransport(smtpTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
                user: 'seller@ooneunion.com',
                pass: '9T0@A*b90@2CxK'
            },
            tls: {
                ciphers: 'SSLv3'
            },
            requireTLS: true
        }));

        let programacion = await Solicitud_credito.findOne({_id:id}).populate('cliente');
        let estado,monto;

        estado = programacion.estado;
        monto = programacion.monto;
    
        readHTMLFile(process.cwd() + '/mails/email-solicitud-credito.html', async (err, html)=>{

            let rest_html = ejs.render(html, {
                estado:estado,
                monto: monto,
            });
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: '"OOneunion" <seller@ooneunion.com>',
                to: programacion.cliente.email,
                subject: 'Detalles de tu solicitud de crédito.',
                html: htmlToSend
            };
          
            transporter.sendMail(mailOptions, async function(error, info){
                if (!error) {
                    console.log(info);
                }else{
                    console.log(error);
                }
            });
        
        });
    } catch (error) {
        console.log(error);
    } */
}



module.exports = {
    create_cliente,
    get_clientes_facturacion_cliente,
    get_clientes_facturacion_empresa,
    get_clientes_facturacion,
    add_cliente_facturacion,
    get_clientes_admin,
    get_cliente_admin,
    update_cliente,
    verification_email_cliente,
    get_ubicaciones_clientes,
    get_ubicaciones_empresa,
    create_ubicacion_clientes,
    create_ubicacion_empresa,
    update_ubicacion_cliente,
    get_ubicacion_cliente,
    delete_ubicacion_cliente,
    set_status_cliente,
    get_empresas_admin,
    get_data_empresa,
    add_cliente_empresa_rs,
    add_empresa_rs,
    set_status_empresa,
    get_empresa_rs_admin,
    get_empresa_clientes,
    get_empresa_clientes_todos,
    update_cliente_credito,
    get_credito_cliente,
    get_clientes_latest,
    get_cliente_cobranza_admin,
    set_solicitud_credito,
    update_tiempo_credito_cliente,
    update_reduccion_cliente_credito,
    obtener_solicitudes_abiertas,
    obtener_envios_notas,
    obtener_clientes_notas,
    obtener_deudas_comprador,
    remove_cliente_agente,
    agregar_cliente_agente,
    update_cliente_umedida,
    create_cliente_facturacion,
    delete_cliente_facturacion,
    get_pagos_clientes,
    get_creditos_cliente,
    get_solicitudes_cliente,
    get_ventas_clientes
}