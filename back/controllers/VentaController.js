const Ingreso_detalle = require('../models/Ingreso_detalle');
var Venta = require('../models/Venta');
var Cliente = require('../models/Cliente');
var Venta_detalle = require('../models/Venta_detalle');
var Venta_doc_envio = require('../models/Venta_doc_envio');
var Pago = require('../models/Pago');
var Solicitud_credito = require('../models/Solicitud_credito');
var Producto_color = require('../models/Producto_color');
var Producto_variacion = require('../models/Producto_variacion');
var Programacion_doc = require('../models/Programacion_doc');
var Programacion = require('../models/Programacion');
var Programacion_detalle = require('../models/Programacion_detalle');
var Pedido_detalle = require('../models/Pedido_detalle');
var mongoose = require('mongoose');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const Cupon = require('../models/Cupon');
const Ropa_variacion = require('../models/Ropa_variacion');
const Cupon_comprador = require('../models/Cupon_comprador');

const fetch = require('node-fetch');
const https = require('https');
var fs = require('fs');
var GLOBAL = require('../GLOBAL');
const Pago_completo = require('../models/Pago_completo');
const WtppController = require('../controllers/WtppController');
const Venta_envio = require('../models/Venta_envio');
const Transacciones = require('../models/Transacciones');

const create_venta = async function(req,res){
    try {
        let data = req.body;
        let today = new Date();
        console.log(data);
        
        data.colaborador = req.user.sub;
        data.day = today.getDate();
        data.month = today.getMonth()+1;
        data.year = today.getFullYear();
        data.descuento = 0;

        let det_ventas = [];
        let det_programaciones = [];
        let detalles = JSON.parse(data.detalles);
        for(var item of detalles){
            if(item.tipo_detalle == 'En almacen'|| item.tipo_detalle == 'En camino') det_ventas.push(item);
            else if(item.tipo_detalle == 'Programación') det_programaciones.push(item);
        }

        let nventas = 0;
        let nprogramaciones = 0;
        let cant_ventas = 0;
        let cant_programaciones = 0;

        console.log(detalles.length);
        console.log(det_ventas.length);
        console.log(det_programaciones.length);


        detalles.forEach(elemento => {
            if (elemento.tipo_detalle === 'En almacen' || elemento.tipo_detalle === 'En camino') {
                nventas++;
                cant_ventas = cant_ventas + elemento.cantidad;
            } else if (elemento.tipo_detalle === 'Programación') {
                nprogramaciones++;
                cant_programaciones = cant_programaciones + elemento.cantidad;
            }
        });

        let obj_venta,obj_programacion;

        //ULTIMA SERIE
        let last_venta = await Venta.find().sort({serie:-1});
        let new_serie = 0;
        if(last_venta.length>=1)new_serie = last_venta[0].serie + 1; 
        else new_serie = 1;

       
        data.cantidad_total = cant_ventas;
        data.serie = new_serie;
        data.monto_programaciones = data.total_programacion;
        data.monto_ventas = data.total_venta; 
        data.monto_camino = data.total_camino; 
        data.monto_total = data.monto_total;
        console.log("TOTAL "+data.monto_total);
        let venta = await Venta.create(data);

        //SOLICITUD DE CREDITO
        if(data.estado == 'Pendiente'){
             //CALCULAR SERIE
             let last_solicitud = await Solicitud_credito.find().sort({serie:-1});
             let new_serie = 0;
             if(last_solicitud.length>=1)new_serie = last_solicitud[0].serie + 1; 
             else new_serie = 1;

            let data_solicitud = {
                colaborador : req.user.sub,
                monto: data.credito_solicitado,
                venta: venta._id,
                tipo_usuario: 'Cliente natural',
                tipo: 'Ampliación',
                day: new Date().getDate(),
                month: new Date().getMonth()+1,
                year: new Date().getFullYear(),
                estado: 'Pendiente',
                serie: new_serie,
            };
            if(data.tipo_usuario == 'Cliente natural'){
                data_solicitud.cliente = venta.cliente;
            }else if(data.tipo_usuario == 'Empresa'){
                data_solicitud.tipo_usuario = 'Empresa';
                data_solicitud.empresa = venta.empresa;
                data_solicitud.empresa_rs = venta.empresa_rs;
            }
            await Solicitud_credito.create(data_solicitud);
        }

        for(var item of det_ventas){
            item.tipo = data.tipo;
            item.colaborador = req.user.sub;
            item.venta = venta._id;
            item.day = today.getDate();
            item.month = today.getMonth()+1;
            item.year = today.getFullYear();
            item.tipo_usuario = data.tipo_usuario;

            if(item.tipo_detalle == 'En camino'){
                let detalles_pendientes = await Venta_detalle.
                find({tipo_detalle:'En camino'}).
                sort({priority:-1});

                if(detalles_pendientes.length >= 1){
                    item.priority = detalles_pendientes[0].priority + 1;
                }else{
                    item.priority = 1;
                }
            }

            let det = await Venta_detalle.create(item);
        }

        if(venta.tipo_usuario == 'Cliente natural'){
            let cliente = await Cliente.findById({_id:venta.cliente});
            await Cliente.findByIdAndUpdate({_id:venta.cliente},{
                tipo: 'Socio'
            });

            if(cliente.saldo_favor){
                if(cliente.saldo_favor >= 1){
                    let last_pago = await Pago_completo.find({cliente:venta.cliente}).sort({createdAt:-1});
                  
                    let pago_data = {};
                    let last_venta = await Pago.find().sort({serie:-1});
                    let new_serie = 0;
                    if(last_venta.length>=1){
                        new_serie = last_venta[0].serie + 1;
                    }else{
                        new_serie = 1;
                    }

                    if(last_pago[0].tipo_de_comprobante != 'NO-BOLETA'){
                        console.log(last_pago[0]);
                        pago_data.sat_uid = last_pago[0].sat_uid;
                        pago_data.sat_serie = last_pago[0].sat_serie;
                        pago_data.sat_folio = last_pago[0].sat_folio;
                        pago_data.sat_estado = last_pago[0].sat_estado;
                        pago_data.sat_cliente_facturacion = last_pago[0].sat_cliente_facturacion;
                    }

                    pago_data.cliente= venta.cliente,
                    pago_data.venta= venta._id,
                    pago_data.colaborador = req.user.sub,
                    pago_data.year = new Date().getFullYear(),
                    pago_data.month = new Date().getMonth() +1,
                    pago_data.day = new Date().getDate(),
                    pago_data.exp = new Date(moment(new Date()).add(10,'days').format('YYYY-MM-DD')),
                    pago_data.tipo_usuario = last_pago[0].tipo_usuario;
                    pago_data.metodo = last_pago[0].metodo;
                    pago_data.serie = new_serie;
                    pago_data.pago_completo = last_pago[0]._id;
                    pago_data.estado = 'Aprobado',
                    pago_data.aprobacion = Date.now();
                    pago_data.automatico = true;

                    //2000-1500
                    if(venta.monto_total < cliente.saldo_favor){ //VALIDAR SI EL SALDO A FAVOR ES MENOR A LA DEUDA
                        pago_data.monto = venta.monto_total;
                    }else{
                        pago_data.monto = cliente.saldo_favor;
                    }

                    await Cliente.findByIdAndUpdate({_id:cliente._id},{
                        saldo_favor:  cliente.saldo_favor - pago_data.monto
                    });
                    

                    await Pago.create(pago_data);
                    validar_deuda_venta(item.venta);
                }
            }
        }

        send_venta_resumen(venta._id);
        obj_venta = await Venta.findById({_id:venta._id}).populate('cliente_ubicacion');
        let programacion;
        if(nprogramaciones >= 1){
            let last_programacion = await Programacion.find().sort({serie:-1});
            let new_serie = 0;
            if(last_programacion.length>=1) new_serie = last_programacion[0].serie + 1;
            else new_serie = 1;

            data.serie = new_serie;
            data.colaborador = req.user.sub;
            data.day = today.getDate();
            data.month = today.getMonth()+1;
            data.year = today.getFullYear();
            data.venta = venta._id;

            programacion = await Programacion.create(data);

            for(var item of det_programaciones){
                item.colaborador = req.user.sub;
                item.programacion = programacion._id;
                item.day = today.getDate();
                item.month = today.getMonth()+1;
                item.year = today.getFullYear();
                item.unidad = item.unidad;
                item.cantidad = item.cantidad;
                item.tipo_usuario = data.tipo_usuario;
                item.estado = data.estado;
                item.venta = venta._id;
                let det = await Programacion_detalle.create(item);
            }
    
            obj_programacion = await Programacion.findById({_id:programacion._id});
            
        }

        let arr_detalles = [];

        let arr_ventas = await Venta_detalle.find({venta:venta._id})
        .populate('producto')
        .populate('producto_variacion').populate('venta');
        let arr_programaciones = await Programacion_detalle.find({venta:venta._id})
        .populate('producto')
        .populate('producto_variacion').populate('venta');

        for(var item of arr_ventas){
            arr_detalles.push(item);
        }
        for(var item of arr_programaciones){
            arr_detalles.push(item);
        }


        ///PRIMER PAGO
        data.data_facturacion = JSON.parse(data.data_facturacion);
       
        if(data.tipo_pago == 'Contado'){
            if(parseInt(data.total_venta)>= 1){
                await Pago_completo.create({
                    cliente: data.data_facturacion.cliente,
                    metodo : data.metodo,
                    tipo_usuario: data.data_facturacion.tipo_usuario,
                    colaborador : req.user.sub,
                    tipo_pago : 'Venta',
                    tipo : venta.tipo_pago,
                    year : new Date().getFullYear(),
                    month : new Date().getMonth() +1,
                    day : new Date().getDate(),
                    exp : new Date(moment(new Date()).add(10,'days').format('YYYY-MM-DD')),
                    tipo_de_comprobante : data.data_facturacion.tipo_de_comprobante,
                    sat_receptor : data.data_facturacion.receptor,
                    sat_cliente_facturacion : data.data_facturacion.sat_cliente_facturacion,
                    sat_metodo : data.data_facturacion.FormaPago,
                    monto : (parseInt(data.data_facturacion.porcentaje)/100)*data.total_venta,
                    venta : obj_venta._id,
                });
            }
            //CALCULAR SUBTOTAL
            if(parseInt(data.total_programacion)>= 1){
                console.log("PROGRAMACION id "+programacion._id);
                let sa = await Pago_completo.create({
                    cliente: data.data_facturacion.cliente,
                    metodo : data.metodo,
                    tipo_usuario: data.data_facturacion.tipo_usuario,
                    colaborador : req.user.sub,
                    tipo_pago : 'Programación',
                    tipo : venta.tipo_pago,
                    year : new Date().getFullYear(),
                    month : new Date().getMonth() +1,
                    day : new Date().getDate(),
                    exp : new Date(moment(new Date()).add(10,'days').format('YYYY-MM-DD')),
                    tipo_de_comprobante : data.data_facturacion.tipo_de_comprobante,
                    sat_receptor : data.data_facturacion.receptor,
                    sat_cliente_facturacion : data.data_facturacion.sat_cliente_facturacion,
                    sat_metodo : data.data_facturacion.FormaPago,
                    monto : (parseInt(data.data_facturacion.porcentaje)/100)*data.total_programacion,
                    venta : obj_venta._id,
                    programacion: obj_programacion._id
                });
                console.log(sa);
            }
        }

        res.status(200).send({
            venta:obj_venta,
            programacion:obj_programacion,
            detalles:arr_detalles
        });


    } catch (error) {
        console.log(error);
        res.status(200).send({data:undefined});
    }
}

const create_programaciones = async function(req,res){
    try {
        let data = req.body;
        let today = new Date();

        //ULTIMA SERIE
        let last_programacion = await Programacion.find().sort({serie:-1});
        let new_serie = 0;
        if(last_programacion.length>=1){
            new_serie = last_programacion[0].serie + 1;
        }else{
            new_serie = 1;
        }

        data.serie = new_serie;
        data.colaborador = req.user.sub;
        data.day = today.getDate();
        data.month = today.getMonth()+1;
        data.year = today.getFullYear();

        let programacion = await Programacion.create(data);

        if(data.estado == 'En espera'){
            let data_solicitud = {
                colaborador : req.user.sub,
                monto: -(data.credito_solicitado),
                programacion: programacion._id,
                tipo_usuario: data.tipo_usuario,
                estado: 'Abierto',
                tipo: 'Programacion',
            };
            if(data.tipo_usuario == 'Cliente natural'){
                data_solicitud.cliente = programacion.cliente;
            }else if(data.tipo_usuario == 'Empresa'){
                data_solicitud.empresa = programacion.empresa;
                data_solicitud.empresa_rs = programacion.empresa_rs;
            }
            await Solicitud_credito.create(data_solicitud);
        }else{
            data.estado == 'Pendiente';
        }

        data.programaciones = JSON.parse(data.programaciones);
        for(var item of data.programaciones){
            item.colaborador = req.user.sub;
            item.programacion = programacion._id;
            item.day = today.getDate();
            item.month = today.getMonth()+1;
            item.year = today.getFullYear();
            item.unidad = item.unidad;
            item.cantidad = item.cantidad;
            item.tipo_usuario = data.tipo_usuario;
            item.estado = data.estado;
            let det = await Programacion_detalle.create(item);
        }

        if(programacion.tipo_usuario == 'Cliente natural'){
            let cliente = await Cliente.findById({_id:programacion.cliente});
            await Cliente.findByIdAndUpdate({_id:programacion.cliente},{
                tipo: 'Socio'
            });
        }

        /* send_programacion_resumen(programacion._id); */

        let obj_programacion = await Programacion.findById({_id:programacion._id});

        res.status(200).send({data:obj_programacion});

    } catch (error) {
        console.log(error);
        res.status(200).send({data:undefined});
    }
}

const update_file_venta = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var file = req.files[0].location;
        let venta = await Venta.findOne({_id:id}).populate('cliente');
        let venta_res = await Venta.findByIdAndUpdate({_id:id},{file:file});

        if(venta.cliente.prefijo && venta.cliente.telefono){
            WtppController.send_resumen_venta_wtpp(id);
        }

        res.status(200).send({data:venta});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_file_entrega_envio = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        console.log(req.files);
        var file = req.files[0].location;
        let envio = await Venta_envio.findByIdAndUpdate({_id:id},{file_entrega:file});
        let reg_envio = await Venta_envio.findById({_id:id});
        res.status(200).send({data:reg_envio});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_firma_envio = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        let data = req.body;

        let envio = await Venta_envio.findByIdAndUpdate({_id:id},{
            firma: data.firma,
            fecha_entrega: Date.now()
        });

        if(envio){
            let envio = await Venta_envio.findById({_id:id});
            await Venta_detalle.updateMany({venta_envio: id},{
                estado: 'Entregado'
            });
            await Venta_envio.findByIdAndUpdate({_id:id},{estado:'Entregado'});

            let detalles = await Venta_detalle.find({venta:envio.venta, estado: 'Enviado'});
            let programaciones = await Programacion_detalle.find({$or:[
                {estado: 'Procesado'},
                {estado: 'Confirmado'},
                {estado: 'Enviado'}
            ]});

            if(detalles.length == 0){
                let venta_detalles = await Venta_detalle.find({venta:envio.venta,$or:[
                    {estado: 'Confirmado'},
                    {estado: 'Enviado'}
                ],});
                if(programaciones.length == 0){
                    if(venta_detalles.length == 0){
                        await Venta.findByIdAndUpdate({_id: envio.venta},{
                            estado: 'Entregado'
                        });
                    }
                }
            }
            res.status(200).send({data:envio});
        }else{
            res.status(200).send({data:undefined});
        }
      
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_file_envio_venta = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var file = req.files[0].location;
        let envio = await Venta_envio.findByIdAndUpdate({_id:id},{file:file});
        res.status(200).send({data:envio});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_total_venta = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        let data = req.body;
        let venta = await Venta.findByIdAndUpdate({_id:id},{
            monto_total: data.monto_total
        });
        res.status(200).send({data:venta});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_file_programacion = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var file =  req.files[0].location;
        var programacion = await Programacion.findOne({_id:id}).populate('cliente');
        var programacion_res = await Programacion.findByIdAndUpdate({_id:id},{file:file});

        if(programacion.cliente.prefijo && programacion.cliente.telefono){
            WtppController.send_resumen_programacion_wtpp(id);
        }

        res.status(200).send({data:programacion});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_ventas = async function(req,res){
    if(req.user){
        let data = [];
        let ventas = [];
        let ventas_totales = [];

        var estados = {
            procesado: 0,
            enviado: 0,
            confirmado: 0,
            entregado: 0,
            pendiente: 0,
        }

        const estado = req.params['estado'];
        const page = parseInt(req.params['page']) || 1; // Página predeterminada
  

        let query = {};
        if (req.user.rol !== 'Administrador') {
            query.colaborador = req.user.sub;
        }
        if (estado && estado !== 'Todos') {
            query.estado = estado;
        }

        ventas_totales = await Venta.find();

        ventas = await Venta.find(query)
        .populate('colaborador')
        .populate('empresa')
        .populate('cliente')
        .populate({
            path: 'empresa_rs',
            populate: {
                path: 'empresa'
            }
        })
        .populate('ingreso')
        .populate('cupon')
        .sort({ createdAt: -1 })
        .limit(page);

        console.log("Ventas "+ventas.length);

        for(var item of ventas){
            let abonado = 0;
            var arr_colores_sep = [];
            let detalles = await Venta_detalle.find({venta: item._id})
            .populate('producto')
            .populate('producto_variacion')
            .populate('ingreso_detalle');
            
            let pagos = await Pago.find({venta:item._id,estado:'Aprobado'});
            for(var subitem of pagos){
                abonado = abonado + subitem.monto;
            }

            let pagos_pendientes = await Pago_completo.find({venta:item._id,estado:'Pendiente'});

            //SEPARACION POR COLORES
            let colores = [];

            for(var item_det of detalles){
                if(colores.length == 0){
                    colores.push({
                        idproducto: item_det.producto._id,
                        _id: item_det.producto_variacion._id,
                        variacion_name: item_det.producto_variacion.variacion_name,
                        color_name: item_det.producto_variacion.color_name,
                        hxd: item_det.producto_variacion.hxd,
                        producto: item_det.producto.titulo,
                        tipo:  item_det.tipo,
                        categoria:  item_det.producto.categoria,
                        unidad: item_det.unidad,
                        detalles: [item_det]
                    });
                }else{
                    var colores_arr = colores.filter(subitem=> subitem._id == item_det.producto_variacion._id);
                    if(colores_arr.length >= 1){
                    colores_arr[0].detalles.push(item_det);
                    }else{
                    colores.push({
                        idproducto: item_det.producto._id,
                        _id: item_det.producto_variacion._id,
                        variacion_name: item_det.producto_variacion.variacion_name,
                        color_name: item_det.producto_variacion.color_name,
                        hxd: item_det.producto_variacion.hxd,
                        producto: item_det.producto.titulo,
                        tipo:  item_det.tipo,
                        categoria:  item_det.producto.categoria,
                        unidad: item_det.unidad,
                        detalles: [item_det]
                    });
                    }
                }
            }

            for(var item_col of colores){
                var total_cantidad = 0;
                var total_monto = 0;
                for(var det of item_col.detalles){
                    total_cantidad = total_cantidad + parseFloat(det.cantidad);
                    total_monto = total_monto + (parseFloat(det.cantidad)*parseFloat(det.precio))
                }
            
                arr_colores_sep.push({
                    _id: item._id,
                    idproducto: item_col.idproducto,
                    producto: item_col.producto,
                    tipo: item_col.tipo,
                    categoria: item_col.categoria,
                    variacion_name: item_col.variacion_name,
                    color_name: item_col.color_name,
                    hxd: item_col.hxd,
                    total_cantidad: total_cantidad,
                    total_monto: total_monto,
                    unidad: item_col.unidad,
                    rollos: item_col.detalles.length
                })
            }
            
            if(item.estado == 'Procesado') estados.procesado++;
            else  if(item.estado == 'Enviado') estados.enviado++;
            else  if(item.estado == 'Pendiente') estados.pendiente++;
            else  if(item.estado == 'Confirmado') estados.confirmado++;
            else  if(item.estado == 'Entregado') estados.entregado++;


            data.push({
                venta: item,
                pagos: pagos,
                detalles: detalles,
                colores: arr_colores_sep,
                abonado: abonado,
                porcent_abonado: ((abonado*100)/(item.monto_total-item.descuento)).toFixed(2),
                deuda: (item.monto_total-item.descuento) - abonado,
                visible: false,
                tipo: 'Venta',
                createdAt: item.createdAt,
                pagos_pendientes: pagos_pendientes.length
            });
        }
        res.status(200).send({data:data,estados,todos:ventas_totales.length});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_programaciones_range = async function(req,res){
    if(req.user){
        let estado = req.params['estado'];
        const page = parseInt(req.params['page']) || 1; // Página predeterminada
        
        let programaciones = [];
        let regs = [];
        let query = {};

        if(estado != 'Todos'){
           query.estado = 'Todos';
        }

        let programaciones_totales = await Programacion.find();

        programaciones = await Programacion.find(query)
        .populate('venta')
        .populate('colaborador')
        .populate('cliente')
        .populate({
            path: 'empresa_rs',
            populate: {
                path: 'empresa'
            }
        })
        .sort({createdAt:-1})
        .limit(page);

        var estados = {
            solicitudes: 0,
            procesado: 0,
            confirmado: 0,
            realizado: 0,
            finalizado: 0,
        };

        for(var item of programaciones){
            let confirmacion = false;

            if(item.venta?.estado == 'Confirmado'){
                confirmacion = true;
            }
    
            let detalles = await Programacion_detalle.find({programacion:item._id});
            let total_cantidades = 0;

            for(let subitem of detalles){
                total_cantidades = total_cantidades + subitem.cantidad;
            }

            console.log(item.venta._id);

            let pagos_pendientes = await Pago_completo.find({venta:item.venta._id,estado:'Pendiente'});

            if(item.estado == 'Procesado') estados.procesado++;
            else  if(item.estado == 'Realizado') estados.realizado++;
            else  if(item.estado == 'Confirmado') estados.confirmado++;
            else  if(item.estado == 'Finalizado') estados.finalizado++;
            else  if(item.estado == 'Pendiente') estados.solicitudes++;

            regs.push({
                programacion: item,
                total: total_cantidades,
                confirmacion,
                pagos_pendientes: pagos_pendientes.length
            });
        }

        console.log(regs.length);

        res.status(200).send({data:regs,estados,todos:programaciones_totales.length});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_programacion = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let programacion = await Programacion.findById({_id:id}).populate('venta').populate('colaborador').populate('cliente').populate({
                path: 'empresa_rs',
                populate: {
                    path: 'empresa'
                }
            });

            if(programacion){
                let pagos_pendientes = await Pago_completo.find({venta:programacion.venta._id,estado:'Pendiente'});
                let programacion_detalle = await Programacion_detalle.find({programacion:id}).populate('pedido').populate('venta').populate('producto').populate('producto_variacion');
                let solicitud = await Solicitud_credito.findOne({programacion:programacion._id});
    
                res.status(200).send({data:true,programacion,programacion_detalle,solicitud,pagos_pendientes: pagos_pendientes.length});
            }else{
                res.status(200).send({data:undefined});
            }
           
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_last_ventas = async function(req,res){
    if(req.user){
        let data = [];
        let ventas = [];

        if(req.user.rol == 'Administrador'){
            ventas = await Venta.find().populate('colaborador').populate('empresa').populate('cliente').populate({
                path: 'empresa_rs',
                populate: {
                    path: 'empresa'
                }
            }).populate('ingreso').populate('cupon').limit(10).sort({createdAt:-1});
        }else{
            ventas = await Venta.find({colaborador: req.user.sub}).populate('colaborador').populate('empresa').populate('cliente').populate({
                path: 'empresa_rs',
                populate: {
                    path: 'empresa'
                }
            }).populate('ingreso').populate('cupon').sort({createdAt:-1});
        }

        for(var item of ventas){
            let abonado = 0;
            var arr_colores_sep = [];
            var arr_variaciones_sep = [];
            let detalles = [];
             
            if(item.tipo == 'Tela'){
                detalles = await Venta_detalle.find({venta: item._id}).populate('producto').populate('producto_variacion').populate('ingreso_detalle');
                let pagos = await Pago.find({venta:item._id,estado:'Aprobado'});
                for(var subitem of pagos){
                    abonado = abonado + subitem.monto;
                }

                //SEPARACION POR COLORES
                let colores = [];

                for(var item_det of detalles){
                    if(item_det.producto){
                        if(colores.length == 0){
                            colores.push({
                                idproducto: item_det.producto._id,
                                _id: item_det.producto_variacion._id,
                                variante: item_det.producto_variacion.variante,
                                hxd: item_det.producto_variacion.hxd,
                                producto: item_det.producto.titulo,
                                detalles: [item_det]
                            });
                        }else{
                            var colores_arr = colores.filter(subitem=> subitem._id == item_det.producto_variacion._id);
                            if(colores_arr.length >= 1){
                            colores_arr[0].detalles.push(item_det);
                            }else{
                            colores.push({
                                idproducto: item_det.producto._id,
                                _id: item_det.producto_variacion._id,
                                variante: item_det.producto_variacion.variante,
                                hxd: item_det.producto_variacion.hxd,
                                producto: item_det.producto.titulo,
                                detalles: [item_det]
                            });
                            }
                        }
                    }
                }

                for(var item_col of colores){
                    var total_yrds = 0;
                    var total_monto = 0;
                    for(var det of item_col.detalles){
                    total_yrds = total_yrds + parseFloat(det.cantidad);
                    total_monto = total_monto + (parseFloat(det.cantidad)*parseFloat(det.precio))
                    }
            
                    arr_colores_sep.push({
                    _id: item._id,
                    idproducto: item_col.idproducto,
                    producto: item_col.producto,
                    variante: item_col.variante,
                    hxd: item_col.hxd,
                    total_yrds: total_yrds,
                    total_monto: total_monto,
                    rollos: item_col.detalles.length
                    })
                }
            

                data.push({
                    venta: item,
                    pagos: pagos,
                    detalles: detalles,
                    colores: arr_colores_sep,
                    abonado: abonado,
                    porcent_abonado: ((abonado*100)/(item.total-item.descuento)).toFixed(2),
                    deuda: (item.total-item.descuento) - abonado,
                    visible: false,
                    tipo: 'Venta',
                    createdAt: item.createdAt
                });
            }else if(item.tipo == 'Ropa'){
                detalles = await Venta_detalle.find({venta: item._id}).populate('producto').populate('ingreso_detalle');
                let pagos = await Pago.find({venta:item._id,estado:'Aprobado'});
                for(var subitem of pagos){
                    abonado = abonado + subitem.monto;
                }

                //SEPARACION POR COLORES
                let variaciones = [];

                for(var item_det of detalles){
                    if(item_det.producto){
                        if(variaciones.length == 0){
                            variaciones.push({
                                idproducto: item_det.producto._id,
                                _id: item_det.ropa_variacion._id,
                                color: item_det.ropa_variacion.color,
                                talla: item_det.ropa_variacion.talla,
                                hxd: item_det.ropa_variacion.hxd,
                                producto: item_det.producto.titulo,
                                detalles: [item_det]
                            });
                        }else{
                            var variaciones_arr = variaciones.filter(subitem=> subitem._id == item_det.ropa_variacion._id);
                            if(variaciones_arr.length >= 1){
                            variaciones_arr[0].detalles.push(item_det);
                            }else{
                            variaciones.push({
                                idproducto: item_det.producto._id,
                                _id: item_det.ropa_variacion._id,
                                color: item_det.ropa_variacion.color,
                                talla: item_det.ropa_variacion.talla,
                                hxd: item_det.ropa_variacion.hxd,
                                producto: item_det.producto.titulo,
                                detalles: [item_det]
                            });
                            }
                        }
                    }
                }

                for(var item_col of variaciones){
                    var total_cantidad = 0;
                    var total_monto = 0;
                    for(var det of item_col.detalles){
                    total_cantidad = total_cantidad + parseFloat(det.cantidad);
                    total_monto = total_monto + (parseFloat(det.cantidad)*parseFloat(det.precio))
                    }
            
                    arr_variaciones_sep.push({
                        _id: item._id,
                        idproducto: item_col.idproducto,
                        producto: item_col.producto,
                        color: item_col.color,
                        talla: item_col.talla,
                        hxd: item_col.hxd,
                        total_cantidad: total_cantidad,
                        total_monto: total_monto,
                        unidades: item_col.detalles.length
                    })
                }
            

                data.push({
                    venta: item,
                    pagos: pagos,
                    detalles: detalles,
                    variaciones: arr_variaciones_sep,
                    abonado: abonado,
                    porcent_abonado: ((abonado*100)/item.total).toFixed(2),
                    deuda: item.total - abonado,
                    visible: false,
                    tipo: 'Venta',
                    createdAt: item.createdAt
                });
            }
        }

        /////////////////////

        var programaciones = await Programacion_doc.find().populate('empresa').populate('cliente').populate({
            path: 'empresa_rs',
            populate: {
                path: 'empresa'
            }
        }).limit(10).sort({createdAt:-1});

        for(var item of programaciones){
            data.push({
                programacion: item,
                tipo: 'Programacion',
                createdAt: item.createdAt
            });
        }

        data.sort((a, b) => {
            const nameA = new Date(a.createdAt).getTime(); // ignore upper and lowercase
            const nameB = new Date(b.createdAt).getTime(); // ignore upper and lowercase
            if (nameA > nameB) {
              return -1;
            }
            if (nameA < nameB) {
              return 1;
            }
          
            return 0;
        });

        res.status(200).send({data:data});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_ventas_serie = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        if(filtro == 'Todos'){
            try {
                let ventas = await Venta.find().populate('cliente').populate('empresa').populate('empresa_rs').sort({createdAt:-1});;
                res.status(200).send({data:ventas});
            } catch (error) {
                res.status(200).send({data:[]});
            }
        }else{
            try {
                let ventas = await Venta.find({serie:filtro}).populate('cliente').populate('empresa').populate('empresa_rs').sort({razon_social:1});
                res.status(200).send({data:ventas});
            } catch (error) {
                res.status(200).send({data:[]});
            }
        }

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_venta_pagos = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        
        let pagos = await Pago.find({venta:id});
        res.status(200).send({data:pagos});

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_venta = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
           
            let venta = await Venta.findById({_id:id})
            .populate('conf_entrega')
            .populate('cliente')
            .populate('colaborador')
            .populate('empresa')
            .populate('empresa_rs')
            .populate('cliente_ubicacion')
            .populate('cupon');
            
            if(venta){

                let detalles_almacen = await Venta_detalle.find({venta:id,
                    tipo_detalle:'En almacen'}
                ).populate('venta').populate('producto')
                .populate('producto_variacion').populate({
                    path: 'ingreso_detalle',
                    populate: {
                        path: 'ingreso'
                    }
                }).populate('venta_envio');

                let detalles_camino = await Venta_detalle.find({venta:id,tipo_detalle:'En camino'})
                .populate('venta')
                .populate('producto')
                .populate('producto_variacion')
                .populate('venta_envio');

                let pagos = await Pago.find({venta:id});

                let solicitud = await Solicitud_credito.findOne({venta:venta._id});

                let arr_programaciones = await Programacion_detalle.find({venta:venta._id})
                .populate('pedido')
                .populate('producto')
                .populate('producto_variacion').populate('venta')
                .populate('programacion');

                
                
                let primer_pago = await Pago_completo.findOne({venta:id});
                let confirmacion = false;
                if(primer_pago){
                    if(primer_pago.estado == 'Aprobado') confirmacion = true;
                }

                let arr_detalles = [];

                let array_ventas = await Venta_detalle.find({venta:venta._id})
                .populate('producto')
                .populate('producto_variacion').populate('venta');
                let array_programaciones = await Programacion_detalle.find({venta:venta._id})
                .populate('producto')
                .populate('producto_variacion').populate('venta');
        
                for(var item of array_ventas){
                    arr_detalles.push(item);
                }
                for(var item of array_programaciones){
                    arr_detalles.push(item);
                }

                res.status(200).send({
                    data:true,
                    venta,
                    detalles_almacen:detalles_almacen,
                    detalles_camino: detalles_camino,
                    programaciones:arr_programaciones,
                    pagos,
                    solicitud,
                    confirmacion,
                    detalles: arr_detalles
                });
            }else{
                res.status(200).send({data:undefined});
            }
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_envios_venta = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let envios = await Venta_envio.find({venta:id}).populate('cliente_ubicacion').sort({createdAt:-1});
        res.status(200).send({data:envios});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_envios_procesados = async function(req,res){
    if(req.user){
        //{estado:'Procesado'}
        let envios = await Venta_envio.find().populate({
            path: 'venta',
            populate: {
                path: 'cliente'
            }
        }).sort({createdAt:-1});
        res.status(200).send({data:envios});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const confirmar_estado_venta = async function(req,res){
    if(req.user){

        let id = req.params['id'];
        let data = req.body;
        let venta_obj = await Venta.findById({_id:id}).populate('cliente');
        let cliente_obj = await Cliente.findById({_id:venta_obj.cliente._id});
        let trans_ = await Transacciones.find({cliente:venta_obj.cliente._id,tipo: 'Pago Crédito', venta: {$exists: false}});
        
        let detalles = await Venta_detalle.find({venta:data.venta});
        let cliente = await Cliente.findById({_id:venta_obj.cliente._id});
        
        if(cliente_obj.credito_total >= 1){
            if(trans_.length >= 1){
                let monto_deuda = venta_obj.monto_total-venta_obj.monto_pagado;
                let monto_pagar = 0;
                let monto_sobrante = 0;
                
                if(monto_deuda >= 1){
                    if(trans_[0].monto <= monto_deuda){
                        monto_pagar = trans_[0].monto;
                        console.log("1 monto_pagar "+monto_pagar);
                    }else{
                        monto_pagar = monto_deuda;
                        monto_sobrante = trans_[0].monto - monto_deuda;
                        console.log("2 monto_pagar "+monto_pagar);
                        console.log("monto_sobrante "+monto_sobrante);
                    }
    
                    //si el monto del saldo a favor es menor al monto de la venta
                    let last_transaccion = await Transacciones.find().sort({serie:-1});
                    let new_serie_transaccion = 0;
                    if(last_transaccion.length>=1)new_serie_transaccion = last_transaccion[0].serie + 1; 
                    else new_serie_transaccion = 1;
    
                    let transaccion = await Transacciones.findByIdAndUpdate({_id:trans_[0]._id},{
                        venta: venta_obj._id,
                        monto: monto_pagar,
                        descripcion: 'Monto a favor utilizado',
                    });
                
    
                    if(transaccion){
                        let reg_cliente = await Cliente.findById({_id:venta_obj.cliente._id});
                        await Cliente.findByIdAndUpdate({_id:reg_cliente._id},{
                            credito_usado: reg_cliente.credito_usado + Math.abs(monto_pagar),
                        });
    
                        let pago_venta = venta_obj.monto_pagado + monto_pagar;
                        await Venta.findByIdAndUpdate({_id:venta_obj._id},{
                            monto_pagado : pago_venta
                        });
    
                        let venta_update = await Venta.findById({_id:venta_obj._id});
                        if(venta_update.monto_total == venta_update.monto_pagado){
                            await Venta.findByIdAndUpdate({_id:item._id},{
                                pago : 'Completo'
                            });

                           
                        }
                    }
    
                    if(monto_sobrante >= 1 ){
                        let last_transaccion = await Transacciones.find().sort({serie:-1});
                        let new_serie_transaccion = 0;
                        if(last_transaccion.length>=1)new_serie_transaccion = last_transaccion[0].serie + 1; 
                        else new_serie_transaccion = 1;
    
                        let transaccion = await Transacciones.create({
                            cliente: pago_completo.cliente._id,
                            tipo_usuario: 'Cliente natural',
                            monto: monto_sobrante,
                            colaborador: req.user.sub,
                            serie: new_serie_transaccion,
                            day: new Date().getDate(),
                            month: new Date().getMonth()+1,
                            year: new Date().getFullYear(),
                            descripcion: 'Saldo a favor del cliente',
                            estado: true,
                            tipo: 'Pago Crédito'
                        });
    
                        if(transaccion){
                            let reg_cliente = await Cliente.findById({_id:pago_completo.cliente._id});
                            await Cliente.findByIdAndUpdate({_id:reg_cliente._id},{
                                credito_usado: reg_cliente.credito_usado - Math.abs(monto_sobrante),
                            });
                        }
                    }
                }
            }
        }

        for(var item of detalles){
            if(item.ingreso_detalle){
                await Ingreso_detalle.findByIdAndUpdate({_id:item.ingreso_detalle},{
                    estado: false,
                    venta_detalle: item._id
                });
            }
        }
        
        
        if(venta_obj.cliente.email){
            send_email_venta_confirmacion(id);
        }

        await Venta_detalle.updateMany({venta:id},{
            estado : 'Confirmado'
        });

        await Programacion.updateMany({venta:id},{
            estado : 'Procesado'
        });

        await Programacion_detalle.updateMany({venta:id},{
            estado : 'Procesado'
        });

        if(cliente_obj.credito_total >= 1){
            venta_obj = await Venta.findById({_id:id}).populate('cliente');
            let monto_transaccion = venta_obj.monto_total-venta_obj.monto_pagado;

            //CALCULAR SERIE
            if(monto_transaccion >= 1){
                let last_transaccion= await Transacciones.find().sort({serie:-1});
                let new_serie = 0;
                if(last_transaccion.length>=1)new_serie = last_transaccion[0].serie + 1; 
                else new_serie = 1;
                
                //TRANSACCION
                let transaccion = await Transacciones.create({
                    cliente: cliente._id,
                    tipo_usuario: 'Cliente natural',
                    monto: -Math.abs(monto_transaccion),
                    colaborador: req.user.sub,
                    venta: id,
                    serie: new_serie,
                    day: new Date().getDate(),
                    month: new Date().getMonth()+1,
                    year: new Date().getFullYear(),
                    descripcion: 'Se realizó una venta.',
                    estado: true
                });
        
                if(transaccion){

                    console.log('1------------------------------');
                    console.log("monto_transaccion"+monto_transaccion);
                    console.log("credito_disponible "+cliente.credito_disponible);
                    console.log("credito_usado "+cliente.credito_usado);
                    cliente = await Cliente.findById({_id:venta_obj.cliente._id});
                    await Cliente.findByIdAndUpdate({_id:cliente._id},{
                        credito_disponible: cliente.credito_disponible - monto_transaccion,
                        credito_usado: cliente.credito_usado + monto_transaccion,
                    });
                    
                } 
            }
        }

        await Venta.findByIdAndUpdate({_id:id},{
            estado: 'Confirmado'
        }); 
        res.status(200).send({data:true});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_estado_venta = async function(req,res){
    if(req.user){
        
        let id = req.params['id'];
        let data = req.body;

        let venta_obj = await Venta.findById({_id:id}).populate('cliente');
        let venta = await Venta.findByIdAndUpdate({_id:id},{
            estado: data.estado,
        }); 

        if(data.estado == 'Enviado'){
            await Venta.findByIdAndUpdate({_id:id},{
                tracking: data.tracking,
            });

            if(venta_obj.tipo_usuario == 'Cliente natural'){
                if(venta_obj.cliente.email){
                    send_email_venta_envio(id);
                }
            }
            WtppController.send_envio_venta_wtpp(id);
        }

        if(data.estado == 'Entregado'){
            await Venta.findByIdAndUpdate({_id:id},{
                conf_entrega: req.user.sub,
            });

            if(venta_obj.tipo_usuario == 'Cliente natural'){
                if(venta_obj.cliente.email){
                    send_email_venta_entrega(id);
                }
            }
            WtppController.send_recepcion_venta_wtpp(id);
        }
        res.status(200).send({data:venta});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const add_doc_venta = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let tipo = req.params['tipo'];
        let data = req.body;
        console.log(data);
        try {
    
            if(tipo == 'Envio'){
                let reg = await Venta.findByIdAndUpdate({_id:id},{
                    doc_envio:   req.files[0].location,
                    doc_format_envio: data.doc_format_envio,
                });
                res.status(200).send({data:reg});
            }else if(tipo == 'Entrega'){
                let reg = await Venta.findByIdAndUpdate({_id:id},{
                    img_entrega:   req.files[0].location,
                });
                res.status(200).send({data:reg});
            }
        } catch (error) {
                console.log(error);
        }
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const create_doc_envio = async function(req,res){
    if(req.user){
        let data = req.body;

        //ULTIMA SERIE
        let last_envio = await Venta_envio.find().sort({serie:-1});
        console.log(last_envio);
        let new_serie = 0;
        if(last_envio.length>=1)new_serie = last_envio[0].serie + 1; 
        else new_serie = 1;
        data.fecha_expedicion = Date.now();
        data.colaborador = req.user.sub;
        data.serie = new_serie;
        let doc = await Venta_envio.create(data);
        

        for(var item of data.detalles){
            await Venta_detalle.findByIdAndUpdate({_id:item},{
                venta_envio: doc._id,
                estado: 'Enviado'
            });
        }

        let arr_detalles = await Venta_detalle.find({venta:data.venta,estado:'Confirmado'});

        if(arr_detalles.length == 0){
            await Venta.findByIdAndUpdate({_id:data.venta},{
                estado: 'Enviado'
            });
        }


        res.status(200).send({data:doc});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_doc_venta = async function(req,res){
    var img = req.params['img'];

    fs.stat('./uploads/ventas/'+img, function(err){
        if(!err){
            let path_img = './uploads/ventas/'+img;
            res.status(200).sendFile(path.resolve(path_img));
        }else{
            let path_img = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_img));
        }
    });
}

const remove_detalle_venta = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let venta = req.params['venta'];

        let data_detalle = await Venta_detalle.findById({_id:id});
        let subtotal_detalle = parseFloat(data_detalle.cantidad)*parseFloat(data_detalle.precio);
        await Venta_detalle.findByIdAndRemove({_id:id});
        let data_venta = await Venta.findById({_id:venta});

        //CALCULAR TOTAL 
        let detalles = await Venta_detalle.find({venta:venta,tipo_detalle:'En almacen'});
        let monto_ventas = 0;

        if(detalles){
            if(detalles.length >= 1){
                for(var item of detalles){
                    let subtotal = item.cantidad * item.precio;
                    monto_ventas = monto_ventas+ subtotal;
                }
            }
        }

        //CALCULAR SERIE
        let last_transaccion = await Transacciones.find().sort({serie:-1});
        let new_serie_transaccion = 0;
        if(last_transaccion.length>=1)new_serie_transaccion = last_transaccion[0].serie + 1; 
        else new_serie_transaccion = 1;

        //TRANSACCION
        if(data_venta.tipo_usuario == 'Cliente natural'){
            let transaccion = await Transacciones.create({
                cliente: data_venta.cliente,
                tipo_usuario: 'Cliente natural',
                monto: Math.abs(subtotal_detalle),
                colaborador: req.user.sub,
                venta: venta,
                serie: new_serie_transaccion,
                day: new Date().getDate(),
                month: new Date().getMonth()+1,
                year: new Date().getFullYear(),
                descripcion: 'Se quitó un detalle de la venta.',
                estado: true
            });

            if(transaccion){
                let reg_cliente = await Cliente.findById({_id:data_venta.cliente});
                await Cliente.findByIdAndUpdate({_id:reg_cliente._id},{
                    credito_disponible: reg_cliente.credito_disponible + Math.abs(subtotal_detalle),
                    credito_usado: reg_cliente.credito_usado - Math.abs(subtotal_detalle),
                });
            }
        }
        

        let venta_updated = await Venta.findByIdAndUpdate({_id:venta},{
            monto_ventas: monto_ventas,
            monto_total: monto_ventas + parseFloat(data_venta.monto_programaciones)
        });

        await Ingreso_detalle.findByIdAndUpdate({_id:data_detalle.ingreso_detalle},{
            estado: true
        });

        res.status(200).send({data:venta_updated});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const add_detalle_venta = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;

        let venta = await Venta.findById({_id: id});

        if(venta){
            if(venta.tipo_usuario == 'Cliente natural'){
                let cliente = await Cliente.findById({_id:venta.cliente });
                let subtotal = data.cantidad * data.precio;
                if(cliente.credito_total >= 1){ //CREDITO
                
                    if(subtotal <= cliente.credito_disponible){
                        data.tipo_usuario = venta.tipo_usuario;
                        data.colaborador = req.user.sub;

                        let detalle = await Venta_detalle.create(data);

                        let detalles = await Venta_detalle.find({venta:id,tipo_detalle:'En almacen'});
                        let monto_ventas = 0;

                        if(detalles){
                            if(detalles.length >= 1){
                                for(var item of detalles){
                                    let subtotal = item.cantidad * item.precio;
                                    monto_ventas = monto_ventas+ subtotal;
                                }
                            }
                        }

                        await Venta.findByIdAndUpdate({_id:id},{
                            monto_ventas: monto_ventas,
                            monto_total: monto_ventas + parseFloat(venta.monto_programaciones)+ parseFloat(venta.monto_camino)
                        });

                        await Ingreso_detalle.findByIdAndUpdate({_id: data.ingreso_detalle},{
                            estado: false
                        });

                        //CALCULAR SERIE
                        let last_transaccion = await Transacciones.find().sort({serie:-1});
                        let new_serie_transaccion = 0;
                        if(last_transaccion.length>=1)new_serie_transaccion = last_transaccion[0].serie + 1; 
                        else new_serie_transaccion = 1;

                        let transaccion = await Transacciones.create({
                            cliente: cliente._id,
                            tipo_usuario: 'Cliente natural',
                            monto: -Math.abs(subtotal),
                            colaborador: req.user.sub,
                            venta: id,
                            serie: new_serie_transaccion,
                            day: new Date().getDate(),
                            month: new Date().getMonth()+1,
                            year: new Date().getFullYear(),
                            descripcion: 'Se agregó un detalle de la venta.',
                            estado: true
                        });
            
                        if(transaccion){
                            let reg_cliente = await Cliente.findById({_id:cliente._id});
                            await Cliente.findByIdAndUpdate({_id:cliente._id},{
                                credito_disponible: cliente.credito_disponible - subtotal,
                                credito_usado: cliente.credito_usado + subtotal,
                            });
                        }

                        let venta_updated = await Venta.findById({_id:id});
                        if(venta_updated.monto_total > venta_updated.monto_pagado){
                            await Venta.findByIdAndUpdate({_id:id},{
                                pago: 'Pendiente'
                            });
                        }

                        res.status(200).send({data:detalle});
                    }else{
                        res.status(200).send({data:undefined, message: 'No tiene credito suficiente.'});
                    }
                }else if(cliente.credito_total == 0){//CONTADO
                    data.tipo_usuario = venta.tipo_usuario;
                    data.colaborador = req.user.sub;

                    let detalle = await Venta_detalle.create(data);

                    let detalles = await Venta_detalle.find({venta:id,tipo_detalle:'En almacen'});
                    let monto_ventas = 0;

                    if(detalles){
                        if(detalles.length >= 1){
                            for(var item of detalles){
                                let subtotal = item.cantidad * item.precio;
                                monto_ventas = monto_ventas+ subtotal;
                            }
                        }
                    }

                    await Venta.findByIdAndUpdate({_id:id},{
                        monto_ventas: monto_ventas,
                        monto_total: monto_ventas + parseFloat(venta.monto_programaciones)+ parseFloat(venta.monto_camino)
                    });

                    await Ingreso_detalle.findByIdAndUpdate({_id: data.ingreso_detalle},{
                        estado: false
                    });

                    
                    let venta_updated = await Venta.findById({_id:id});
                    if(venta_updated.monto_total > venta_updated.monto_pagado){
                        await Venta.findByIdAndUpdate({_id:id},{
                            pago: 'Pendiente'
                        });
                    }

                    res.status(200).send({data:detalle});
                }
            }
        }else{
            res.status(200).send({data:undefined});
        }

       
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const confirmar_entrega_venta = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let envio = await Venta_envio.findById({_id:id});
        await Venta_detalle.updateMany({venta_envio: id},{
            estado: 'Entregado'
        });
        await Venta_envio.findByIdAndUpdate({_id:id},{estado:'Entregado'});

        let detalles = await Venta_detalle.find({venta:envio.venta, estado: 'Enviado'});
        let programaciones = await Programacion_detalle.find({$or:[
            {estado: 'Confirmado'},
            {estado: 'Enviado'}
        ]});

        if(detalles.length == 0){
            let venta_detalles = await Venta_detalle.find({venta:envio.venta,$or:[
                {estado: 'Confirmado'},
                {estado: 'Enviado'}
            ],});
            if(programaciones.length == 0){
                if(venta_detalles.length == 0){
                    await Venta.findByIdAndUpdate({_id: envio.venta},{
                        estado: 'Entregado'
                    });
                }
            }
        }

        res.status(200).send({data:true});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const cancelar_venta = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let venta = await Venta.findById({_id:id});
            let detalles = await Venta_detalle.find({venta:id});

            if(venta.estado == 'Procesado' || venta.estado == 'Pendiente'){
                await Venta.findByIdAndUpdate({_id:id},{
                    estado: 'Cancelado'
                });

                for(var item of detalles){
                    await Venta_detalle.findByIdAndUpdate({_id:item._id},{
                        estado: 'Cancelado'
                    });
                }

                for(var item of detalles){
                    if(item.ingreso_detalle){
                        await Ingreso_detalle.findByIdAndUpdate({_id:item.ingreso_detalle},{
                            estado: true,
                            venta_detalle: item._id
                        });
                    }
                }

                await Pago.updateMany({venta:id},{
                    estado: 'Cancelado'
                });
                await Pago_completo.updateMany({venta:id},{
                    estado: 'Cancelado'
                });
                await Programacion.updateMany({venta:id},{
                    estado: 'Cancelado'
                });
                await Programacion_detalle.updateMany({venta:id},{
                    estado: 'Cancelado'
                });
                await Solicitud_credito.updateMany({venta:id},{
                    estado: 'Denegado'
                });

                res.status(200).send({data:true});
            }else{
                res.status(200).send({data:undefined,message:'La venta no puede ser cancelada.'});
            }

        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined,message:'La venta no puede ser cancelada.'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const cancelar_programacion = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let programacion = await Programacion.findById({_id:id});
            
            if(programacion){
                await Programacion.findByIdAndUpdate({_id:id},{
                    estado: "Cancelado"
                });

                await Programacion_detalle.updateMany({programacion: id},{
                    estado:"Cancelado",
                });

                await Solicitud_credito.updateMany({programacion: id },{
                    estado: 'Denegado'
                });

                res.status(200).send({data:true});  
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

const cancelar_detalle_programacion = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let detalle = await Programacion_detalle.findByIdAndUpdate({_id: id},{
                estado:"Cancelado",
            });

            res.status(200).send({data:detalle});  
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const confirmar_programacion = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let programacion = await Programacion.findById({_id:id});
            
            if(programacion){
                await Programacion.findByIdAndUpdate({_id:id},{
                    estado: "Confirmado"
                });

                await Programacion_detalle.updateMany({programacion: id},{
                    estado:"Confirmado",
                });

                res.status(200).send({data:true});  
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



///



const get_productos_programaciones_pedido = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        let tipo = req.params['tipo'];

        let programaciones = await Programacion_detalle.find({
                estado:'Confirmado',
                tipo:tipo,
                producto: filtro
            }).populate('producto').populate('producto_variacion').populate('cliente').populate({
            path: 'empresa_rs',
            populate: {
                path: 'empresa'
            }
        }).populate('programacion').populate('venta').sort({createdAt:-1});

        res.status(200).send({data:programaciones});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

///

const crear_pago = async function(req,res){
    if(req.user){
        let data = req.body;

        let cliente = await Cliente.findById({_id:data.cliente});

        if(cliente){
            console.log(data);
            data.colaborador = req.user.sub;
            data.year = new Date().getFullYear();
            data.month = new Date().getMonth() +1;
            data.day = new Date().getDate();
            data.exp = new Date(moment(new Date()).add(10,'days').format('YYYY-MM-DD'));
            data.tipo_pago = 'Venta';
            //CALCULAR SUBTOTAL

            let pago_completo;
            if(req.files){
                data.comprobante = req.files[0].location;;
                pago_completo = await Pago_completo.create(data);
            }else{
                pago_completo = await Pago_completo.create(data);
            }

            res.status(200).send({data:pago_completo});
        }else{
            res.status(200).send({data:undefined,message:'El pago no se proceso.'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

/* async function get_last_correlativo(){
    let last_venta = await Pago.find().sort({serie:-1});
    let new_serie = 0;
    if(last_venta.length>=1){
        new_serie = last_venta[0].serie + 1;
        return new_serie;
    }else{
        new_serie = 1;
        return new_serie;
    }
    
} */


const get_pagos = async function(req,res){
    if(req.user){
        const page = parseInt(req.params['page']) || 1; // Página predeterminada

        let data = [];
        let pagos = [];

        let pagos_todos = await Pago_completo.find();

        if(req.user.rol == 'Administrador'){
            pagos = await Pago_completo.find().populate('colaborador').populate('cliente')
            .populate('sat_cliente_facturacion').populate('empresa_rs').populate('empresa')
            .populate('venta')
            .populate('programacion')
            .sort({createdAt:-1})
            .limit(page);
        }else{
            pagos = await Pago_completo.find({colaborador: req.user.sub}).populate('colaborador')
            .populate('sat_cliente_facturacion').populate('cliente').populate('empresa_rs').populate('empresa')
            .populate('venta')
            .populate('programacion')
            .sort({createdAt:-1})
            .limit(page);
        }

        for(var item of pagos){
            data.push({
                pago: item
            });
        }

        res.status(200).send({data:data,todos:pagos_todos.length});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_detalle_ingreso_by_color_venta = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];

            let variacion = await Producto_variacion.findById({_id:id});
            var rollos = [];
            let detalles = await Ingreso_detalle.find({producto_variacion:id, estado: true}).sort({cantidad:1})
            .populate('ingreso')
            .populate('pedido_detalle')
            .populate('producto')
            .populate('producto_variacion');


            var detalle_pendiente = await Venta_detalle.find({producto_variacion:id,tipo_detalle:'En almacen',estado: {$ne: 'Cancelado'}}).populate('ingreso_detalle').populate('venta');
            var total_dispoble = 0;
            for(var item of detalles){
                if(!item.pedido_programacion){
                    let unidades_venta = detalle_pendiente.filter(subitem=>subitem.ingreso_detalle&&subitem.ingreso_detalle.codigo == item.codigo && subitem.venta.estado == 'Procesado');
                    if(unidades_venta.length == 0){
                        var metraje_total = 0;
                        metraje_total = item.cantidad;
                        total_dispoble = total_dispoble + parseFloat(metraje_total);
                        rollos.push(item);
                    }
                }
            }
           
            var future_stock = 0;
            var reser_future_stock = 0;
            var disp_future_stock = 0;

            var pedidos = await Pedido_detalle.find({
                producto_variacion:id,
                $or: [{ estado: 'Aprobado' }, { estado: 'Enviado' }]
            }).populate('programacion_detalle');

            for(var element of pedidos){
                //CANTIDAD PEDIDO TOTAL - CANTIDAD DE LA PROGRAMACION
                let unidadese_sobrante = 0;

                if(element.tipo_pedido == 'Programación'){
                    unidadese_sobrante = element.cantidad - element.programacion_detalle.cantidad;
                }else if(element.tipo_pedido == 'Pedido'){
                    unidadese_sobrante = element.cantidad;
                }

                if(unidadese_sobrante >= 1){
                    future_stock = future_stock + parseFloat(unidadese_sobrante);
                }
            }

            var d_ventas = await Venta_detalle.find({producto_variacion: id,tipo_detalle:'En camino'}).populate('venta');

            for(var element of d_ventas){
                if(element.venta.estado != 'Cancelado'){
                    reser_future_stock = reser_future_stock + parseFloat(element.cantidad);
                }
            }
            disp_future_stock = future_stock - reser_future_stock;

            let total_reservado = 0;
            var d_ventas_reservadas = await Venta_detalle.find({
                producto_variacion: id,
                tipo_detalle:'En almacen',
            }).populate('venta');

            for(var element of d_ventas_reservadas){
                if(element.venta.estado == 'Procesado'){
                    total_reservado = total_reservado + parseFloat(element.cantidad);
                }
            }

            res.status(200).send({
                data:true,
                detalles:rollos,
                variacion,
                future_stock:disp_future_stock,
                total_dispoble,
                total_reservado
            });
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_detalle_ingreso_by_variacion_venta = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];

            let variacion = await Ropa_variacion.findById({_id:id});
            var unidades = [];
            let detalles = await Ingreso_detalle.find({ropa_variacion:id, estado: true}).sort({cantidad:1})
            .populate('ingreso')
            .populate('pedido')
            .populate('pedido_detalle')
            .populate('producto')
            ;

            console.log(detalles.length);

            var detalle_pendiente = await Venta_detalle.find({ropa_variacion:id,}).populate('ingreso_detalle').populate('venta');

            for(var item of detalles){
                if(!item.pedido_programacion){
                    let unidades_venta = detalle_pendiente.filter(subitem=>subitem.ingreso_detalle.codigo == item.codigo && subitem.venta.estado == 'Procesado');
                    if(unidades_venta.length == 0){
                        unidades.push(item);
                    }
                }
            }
           
            res.status(200).send({data:true,detalles:unidades,variacion});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const cancelar_pago = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        try {
            let pago_completo = await Pago_completo.findByIdAndUpdate({_id:id},{
                estado: 'Cancelado'
            });
            res.status(200).send({data:pago_completo});
        } catch (error) {
            res.status(200).send({data:undefined,message:'El pago no fue encontrado.'});
        }
    }
}

const aprobar_pago = async function(req,res){
    if(req.user){
        let id = req.params['id'];

        try {
            let pago_completo = await Pago_completo.findById({_id:id}).populate('cliente').populate('venta');
     
            //CREDITO
            console.log('VENTA');
  
            if(pago_completo.tipo == 'Credito'){

                let ventas = await Venta.find({
                    cliente: pago_completo.cliente._id,
                    pago: 'Pendiente',
                    $or: [
                        {estado: 'Confirmado'},
                        {estado: 'Enviado'},
                        {estado: 'Entregado'},
                    ]
                });
                //1500
                let monto_sobrante = pago_completo.monto; //500 = 1000

                for(let item of ventas){
                    let last_transaccion = await Transacciones.find().sort({serie:-1});
                    let new_serie_transaccion = 0;
                    if(last_transaccion.length>=1)new_serie_transaccion = last_transaccion[0].serie + 1; 
                    else new_serie_transaccion = 1;

                    let monto_pagar = 0;
                    //1500-0 1500
                    let deuda_venta = item.monto_total - item.monto_pagado; //1500
                    console.log(deuda_venta);

                    if(monto_sobrante >= 1){ //si hay monto restante que pagar 
                        if(deuda_venta >= 1){ //La venta tiene deuda
                            let transaccion;
                            if(monto_sobrante >= deuda_venta){ //Si el monto a pagar es menor a la deuda
                                monto_pagar = deuda_venta; 
    
                                transaccion = await Transacciones.create({
                                    cliente: pago_completo.cliente._id,
                                    tipo_usuario: 'Cliente natural',
                                    monto: monto_pagar,
                                    colaborador: req.user.sub,
                                    venta: item._id,
                                    serie: new_serie_transaccion,
                                    day: new Date().getDate(),
                                    month: new Date().getMonth()+1,
                                    year: new Date().getFullYear(),
                                    descripcion: 'El cliente realizo un pago',
                                    estado: true
                                });

                                if(transaccion){
                                    let reg_cliente = await Cliente.findById({_id:pago_completo.cliente._id});
                                    await Cliente.findByIdAndUpdate({_id:reg_cliente._id},{
                                        credito_disponible: reg_cliente.credito_disponible + Math.abs(monto_pagar),
                                        credito_usado: reg_cliente.credito_usado - Math.abs(monto_pagar),
                                    });
    
                                    let pago_venta = item.monto_pagado + monto_pagar;
                                    await Venta.findByIdAndUpdate({_id:item._id},{
                                        monto_pagado : pago_venta
                                    });

                                    let venta_update = await Venta.findById({_id:item._id});
                                    if(venta_update.monto_total == venta_update.monto_pagado){
                                        await Venta.findByIdAndUpdate({_id:item._id},{
                                            pago : 'Completo'
                                        });
                                    }
                                }

                                monto_sobrante = monto_sobrante - monto_pagar; //Descontar monto sobrante
                            }else{
                                monto_pagar = monto_sobrante;

                                transaccion = await Transacciones.create({
                                    cliente: pago_completo.cliente._id,
                                    tipo_usuario: 'Cliente natural',
                                    monto: monto_pagar,
                                    colaborador: req.user.sub,
                                    venta: item._id,
                                    serie: new_serie_transaccion,
                                    day: new Date().getDate(),
                                    month: new Date().getMonth()+1,
                                    year: new Date().getFullYear(),
                                    descripcion: 'El cliente realizo un pago',
                                    estado: true
                                });

                                monto_sobrante = monto_sobrante - monto_pagar; //Descontar monto sobrante

                                if(transaccion){
                                    let reg_cliente = await Cliente.findById({_id:pago_completo.cliente._id});
                                    await Cliente.findByIdAndUpdate({_id:reg_cliente._id},{
                                        credito_disponible: reg_cliente.credito_disponible + Math.abs(monto_pagar),
                                        credito_usado: reg_cliente.credito_usado - Math.abs(monto_pagar),
                                    });
    
                                    let pago_venta = item.monto_pagado + monto_pagar;
                                    await Venta.findByIdAndUpdate({_id:item._id},{
                                        monto_pagado : pago_venta
                                    });

                                    let venta_update = await Venta.findById({_id:item._id});
                                    if(venta_update.monto_total == venta_update.monto_pagado){
                                        await Venta.findByIdAndUpdate({_id:item._id},{
                                            pago : 'Completo'
                                        });
                                    }
                                }
                            }

                            
                        }
                    }
                }

                await Pago_completo.findByIdAndUpdate({_id:id},{
                    estado:'Aprobado'
                });

                if(monto_sobrante >= 1){
                    let last_transaccion = await Transacciones.find().sort({serie:-1});
                    let new_serie_transaccion = 0;
                    if(last_transaccion.length>=1)new_serie_transaccion = last_transaccion[0].serie + 1; 
                    else new_serie_transaccion = 1;

                    let transaccion = await Transacciones.create({
                        cliente: pago_completo.cliente._id,
                        tipo_usuario: 'Cliente natural',
                        monto: monto_sobrante,
                        colaborador: req.user.sub,
                        serie: new_serie_transaccion,
                        day: new Date().getDate(),
                        month: new Date().getMonth()+1,
                        year: new Date().getFullYear(),
                        descripcion: 'Saldo a favor del cliente',
                        estado: true,
                        tipo: 'Pago Crédito'
                    });

                    if(transaccion){
                        let reg_cliente = await Cliente.findById({_id:pago_completo.cliente._id});
                        await Cliente.findByIdAndUpdate({_id:reg_cliente._id},{
                            credito_usado: reg_cliente.credito_usado - Math.abs(monto_sobrante),
                        });
                    }
                }

                res.status(200).send({data:true});
            
            }

            //CONTADO
            else if(pago_completo.tipo == 'Contado'){
                let ventas = await Venta.find({
                    cliente: pago_completo.cliente._id,
                    pago: 'Pendiente',
                    $or: [
                        {estado: 'Confirmado'},
                        {estado: 'Enviado'},
                        {estado: 'Entregado'},
                    ]
                });
                let ventas_sn_confirmar = await Venta.find({
                    cliente: pago_completo.cliente._id,
                    estado: 'Procesado'
                });
                let deuda = 0;
                console.log('Procesados ' + ventas_sn_confirmar.length);

                for(var item of ventas){
                    deuda = deuda + (item.monto_total - item.monto_pagado)
                }
                console.log("Deuda " + deuda);
                console.log(pago_completo.monto);

                if(ventas_sn_confirmar.length == 0){
                    if(pago_completo.monto <= deuda){
                        let monto_sobrante = pago_completo.monto; //500 = 1000
    
                        for(let item of ventas){
                            let last_transaccion = await Transacciones.find().sort({serie:-1});
                            let new_serie_transaccion = 0;
                            if(last_transaccion.length>=1)new_serie_transaccion = last_transaccion[0].serie + 1; 
                            else new_serie_transaccion = 1;
        
                            let monto_pagar = 0;
                            //1500-0 1500
                            let deuda_venta = item.monto_total - item.monto_pagado; //1500
                            console.log(deuda_venta);
        
                            if(monto_sobrante >= 1){ //si hay monto restante que pagar 
                                if(deuda_venta >= 1){ //La venta tiene deuda
                                    let transaccion;
                                    if(monto_sobrante >= deuda_venta){ //Si el monto a pagar es menor a la deuda
                                        monto_pagar = deuda_venta; 
    
                                        let pago_venta = item.monto_pagado + monto_pagar;
                                        await Venta.findByIdAndUpdate({_id:item._id},{
                                            monto_pagado : pago_venta
                                        });
    
                                        let venta_update = await Venta.findById({_id:item._id});
                                        if(venta_update.monto_total == venta_update.monto_pagado){
                                            await Venta.findByIdAndUpdate({_id:item._id},{
                                                pago : 'Completo'
                                            });

                                            await Venta_detalle.updateMany({venta: item._id},{
                                                envio: true
                                            });
                                        }
        
                                        monto_sobrante = monto_sobrante - monto_pagar; //Descontar monto sobrante
                                    }else{
                                        monto_pagar = monto_sobrante;
                                        
                                        let pago_venta = item.monto_pagado + monto_pagar;
                                        await Venta.findByIdAndUpdate({_id:item._id},{
                                            monto_pagado : pago_venta
                                        });
    
                                        let venta_update = await Venta.findById({_id:item._id});
                                        if(venta_update.monto_total == venta_update.monto_pagado){
                                            await Venta.findByIdAndUpdate({_id:item._id},{
                                                pago : 'Completo'
                                            });
                                            await Venta_detalle.updateMany({venta: item._id},{
                                                envio: true
                                            });
                                        }
                                        monto_sobrante = monto_sobrante - monto_pagar; //Descontar monto sobrante
                                    }
        
                                    
                                }
                            }
                        }
    
                        await Pago_completo.findByIdAndUpdate({_id:id},{
                            estado:'Aprobado'
                        });
    
                        res.status(200).send({data:true});
                    }else{
                        res.status(200).send({data:undefined,message:'El monto supera la deuda del cliente.'});
                    }
                }else{
                    res.status(200).send({data:undefined,message:'Hay ventas del cliente sin confirmar.'});
                }
                
            }
        } catch (error) {
            console.log(error);
        }

    

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

async function validar_deuda_venta(idventa){
    var venta = await Venta.findById({_id:idventa});
    let pagos = await Pago.find({venta:idventa,estado:'Aprobado'});
    let pago_venta = 0;
    let deuda_venta = 0;
    for(var pg of pagos){
        pago_venta = pago_venta + pg.monto;
    }
    deuda_venta = (venta.total-venta.descuento) - pago_venta.toFixed(2);
    console.log(deuda_venta);
    if(deuda_venta<=0){
        await Venta.findByIdAndUpdate({_id:idventa},{
            pago: 'Completo',
            fecha_pago: Date.now()
        });
    }
}

const get_image_comprobante = async function(req,res){
    var img = req.params['img'];

    fs.stat('./uploads/pagos/'+img, function(err){
        if(!err){
            let path_img = './uploads/pagos/'+img;
            res.status(200).sendFile(path.resolve(path_img));
        }else{
            let path_img = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_img));
        }
    });
}

const get_programacion_nota = async function(req,res){
    var file = req.params['file'];

    fs.stat('./uploads/invoices/programaciones/'+file, function(err){
        if(!err){
            let path_file = './uploads/invoices/programaciones/'+file;
            res.status(200).sendFile(path.resolve(path_file));
        }else{
            let path_file = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_file));
        }
    });
}

const get_venta_nota = async function(req,res){
    var file = req.params['file'];
    fs.stat('./uploads/invoices/ventas/'+file, function(err){
        if(!err){
            let path_file = './uploads/invoices/ventas/'+file;
            res.status(200).sendFile(path.resolve(path_file));
        }else{
            let path_file = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_file));
        }
    });
}


const get_venta_cobranza = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let pago_completo = await Pago_completo.findById({_id:id}).populate('cliente').populate('empresa').populate('empresa_rs').populate('colaborador').populate('sat_cliente_facturacion');
            let pagos;
            if(pago_completo){
                pagos = await Pago.find({pago_completo:id}).populate('venta').populate('cliente').populate('empresa').populate('empresa_rs').populate('colaborador').populate('sat_cliente_facturacion');
            }
            console.log(pago_completo);
            res.status(200).send({data:true,pago_completo,pagos});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const crear_pago_contado = async function(data){
    try {
        let venta = await Venta.findById({_id:data.venta}).sort({createdAt:1});

        let last_venta = await Pago.find().sort({serie:-1});
        let new_serie = 0;
        if(last_venta.length>=1){
            new_serie = last_venta[0].serie + 1;
        }else{
            new_serie = 1;
        }

        data.colaborador = data.colaborador;
        data.year = new Date().getFullYear();
        data.month = new Date().getMonth() +1;
        data.day = new Date().getDate();
        data.exp = new Date(moment(new Date()).add(10,'days').format('YYYY-MM-DD'));
        data.serie = new_serie;
        data.venta = data.venta;

        //CALCULAR EL SUBPAGO
        var arr_productos = [];
        var subpagos = [];
        var detalles = [];
        let ventas = await Venta_detalle.find({venta:data.venta}).populate('producto').populate('producto_variacion');

        for(var item of ventas){
            detalles.push({
                producto: item.producto,
                producto_variacion: item.producto_variacion,
                cantidad: item.cantidad,
                precio: item.precio
            });
        }

        //OBTENER PRODUCTOS DE LA VENTA
        for(var item of detalles){
            if(arr_productos.length == 0){
                arr_productos.push({
                    titulo: item.producto.titulo,
                    _idproducto: item.producto._id,
                    variante: item.producto_variacion.variante,
                    _idcolor: item.producto_variacion._id,
                    porcent: 0,
                    monto: 0
                });
            }else{
                let reg = arr_productos.filter(subitem=>subitem._idcolor.toString() == item.producto_variacion._id.toString());
                if(reg.length == 0){
                    arr_productos.push({
                        titulo: item.producto.titulo,
                        _idproducto: item.producto._id,
                        variante: item.producto_variacion.variante,
                        _idcolor: item.producto_variacion._id,
                        porcent: 0,
                        monto: 0
                    });
                }
            }
        }


        //CALCULAR PORCENTAJE CON RESPECTO AL TOTAL
        for(var item of arr_productos){
            for(var subitem of detalles){
                if(item._idcolor.toString() == subitem.producto_variacion._id.toString()){
                    let subtotal = (subitem.cantidad * subitem.precio).toFixed(2);
                    item.monto = item.monto + parseFloat(subtotal);
                }
            }
        }

        console.log(arr_productos);

        //CALCULAR PORCENTAJE
        for(var item of arr_productos){
            item.porcent = (item.monto/venta.total).toFixed(2);
        }

        //CALCULAR MONTOS SUBPAGOS
        for(var item of arr_productos){
            let data_subpago = {};
            data_subpago.monto = data.monto*item.porcent;
            data_subpago.producto_variacion = item._idcolor;
            data_subpago.variante = item.variante;
            data_subpago.producto = item._idproducto;
            data_subpago.colaborador = data.colaborador;
            data_subpago.year = new Date().getFullYear();
            data_subpago.month = new Date().getMonth() +1;
            data_subpago.day = new Date().getDate();
            data_subpago.exp = new Date(moment(new Date()).add(10,'days').format('YYYY-MM-DD'));
            data_subpago.serie = new_serie;
            data_subpago.venta = data.venta;
            data_subpago.metodo = data.metodo;
            data_subpago.tipo_usuario = data.tipo_usuario;
            data_subpago.entidad = data.entidad;
            if(data.tipo_usuario == 'Cliente natural'){
                data_subpago.cliente = data.cliente
            }else if(data.tipo_usuario == 'Empresa'){
                data_subpago.empresa_rs = data.empresa_rs;
                data_subpago.empresa = data.empresa;
            }

            subpagos.push(data_subpago);
        }


        let pago = await Pago.create(data);
        //CREAR SUBPAGOS
        for(var item of subpagos){
            item.pago = pago._id;
            await Pago_sub.create(item);
        }
    } catch (error) {
        console.log(error);
    }
}

const create_cupon = async function(req,res){
    if(req.user){
        let data = req.body;

        let cupones = await Cupon.find({codigo: data.codigo});

        if(cupones.length==0){
            data.colaborador = req.user.sub;
            let cupon = await Cupon.create(data);
            for(let item of data.cupon_compradores){
                item.cupon = cupon._id;
                await Cupon_comprador.create(item);
            }
            res.status(200).send({data:cupon});
        }else{
            res.status(200).send({data:undefined,message: 'El código de cupón ya existe'});
        }

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_cupones = async function(req,res){
    if(req.user){
        let codigo = req.params['codigo'];
        let estado =  req.params['estado'];

        if(estado != 'Todos'){
            estado = (estado === 'true');
        }

        if(codigo == ' '){
            codigo = '';
        }

        let cupones = await Cupon.find({codigo: new RegExp(codigo,'i')}).populate('producto').sort({createdAt:-1});
        let data = [];
        console.log(cupones.length);
        console.log(estado);
        for(var item of cupones){
            if(estado === 'Todos'){
                console.log(1);
                data.push(item);
            }else if(estado === true){
                if(item.estado === true) data.push(item);
                console.log(2);
            }else if(estado === false){
                if(item.estado === false) data.push(item);
                console.log(3);
            }
        }
        res.status(200).send({data:data});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_cupon = async function(req,res){
    if(req.user){
        try {
            let codigo = req.params['codigo'];
       
            let cupon = await Cupon.findOne({codigo: codigo}).populate('producto').populate('colaborador');
            let compradores = await Cupon_comprador.find({cupon:cupon._id}).populate('cliente').populate('empresa_rs').populate('venta');
        
            res.status(200).send({data:cupon,compradores});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const cancelar_comprador_cupon = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];

            let cupon_comprador = await Cupon_comprador.findByIdAndUpdate({_id:id},{
                estado: false
            });

             //VALIDAR ESTADO CUPON
            let compradores_cupon = await Cupon_comprador.find({cupon:cupon_comprador.cupon});
            let compradores_cupon_true = await Cupon_comprador.find({cupon:cupon_comprador.cupon,estado:false});
            if(compradores_cupon.length == compradores_cupon_true.length){
                await Cupon.findByIdAndUpdate({_id:cupon_comprador.cupon},{
                    estado: false
                });
            }
    
            res.status(200).send({data:cupon_comprador});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const obtener_ventas_en_camino = async function(req,res){
    if(req.user){
        try {
            let ventas = await Venta_detalle.find({tipo_detalle: 'En camino'}).populate('producto').populate('producto_variacion').populate({
                path: 'venta',
                populate: {
                    path: 'cliente'
                }
            }).populate({
                path: 'venta',
                populate: {
                    path: 'empresa_rs'
                }
            })
            .sort({priority:1});
            res.status(200).send({data:ventas});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const actualizar_prioridades_ventas = async function(req,res){
    if(req.user){
        let data = req.body;
        try {
            data.ventas.forEach( async element => {
                await Venta_detalle.findByIdAndUpdate({_id:element._id},{
                    priority: element.priority
                });
            });
            res.status(200).send({data:true});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const download_cfdi = async function(req,res){
    let id = req.params['id'];
    console.log(id);

    var request = require('request');
    var options = {
      'method': 'GET',
      'url': GLOBAL.GLOBAL.url_fact+'v4/cfdi40/'+id+'/pdf',
      'headers': {
        'Content-Type': 'application/json',
        'F-PLUGIN':GLOBAL.GLOBAL.plugin_fact,
        'F-Api-Key':GLOBAL.GLOBAL.api_fact,
        'F-Secret-Key':GLOBAL.GLOBAL.secret_dact
      }
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
      res.status(200).send(response);

      
    });
}

const timbrar_borrador_pago = async function(req,res){
    let id = req.params['id'];
    console.log(id);
    let pagos = await Pago_completo.find({sat_uid:id});

    if(pagos.length >= 1){
        const response = await fetch(GLOBAL.GLOBAL.url_fact+'v4/cfdi40/'+id+'/timbrarborrador', {
            method: 'post',
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json',
                'F-PLUGIN':GLOBAL.GLOBAL.plugin_fact,
                'F-Api-Key':GLOBAL.GLOBAL.api_fact,
                'F-Secret-Key':GLOBAL.GLOBAL.secret_dact
            }
        });
        response_fact = await response.json();
        console.log(response_fact);
        if (response_fact.response != 'error') {
         
            await Pago_completo.findByIdAndUpdate({_id:pagos[0]._id},{
                sat_timbrado_uid : response_fact.SAT.UUID,
                sat_timbrado_FechaTimbrado : response_fact.SAT.FechaTimbrado,
                sat_timbrado_SelloSAT : response_fact.SAT.SelloSAT,
                sat_timbrado_SelloCFD : response_fact.SAT.SelloCFD,
                sat_timbrado_NoCertificadoSAT : response_fact.SAT.NoCertificadoSAT,
                estado: 'Timbrado'
            });
            res.status(200).send({data:true});
        }else{
            res.status(200).send({data:undefined,message:'El comprobante no se pudo timbrar.'});
        }
    }else{
        res.status(200).send({data:undefined,message:'No se encontró el pago.'});
    }
    
}

const send_email_invoice = async function(id,email){

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


    readHTMLFile(process.cwd() + '/mails/email-invoice.html', async (err, html)=>{
    
        let pago = await Pago_completo.findById({_id:id});
        let createdAt = moment(pago.createdAt).format('YYYY-MM-DD');
        let rest_html = ejs.render(html, {pago:pago,createdAt});

        var template = handlebars.compile(rest_html);
        var htmlToSend = template({op:true});

        var mailOptions = {
            from: '"OOneunion" <seller@ooneunion.com>',
            to: email,
            subject: 'Comprobante de pago.',
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

const send_venta_resumen = async function(id){

    try {

        let venta = await Venta.findOne({_id:id}).populate('conf_entrega').populate('cliente').populate('colaborador').populate('empresa').populate('empresa_rs').populate('cliente_ubicacion').populate('cupon');

        let detalles = await Venta_detalle.find({venta:id}).populate('venta').populate('producto').populate('producto_variacion').populate({
            path: 'ingreso_detalle',
            populate: {
                path: 'ingreso'
            }
        });

        let email,nombres,codigo,tipo_cliente,metraje,fecha,colaborador,unidad,tipo_pago,total,descuento,estado;
        let arr_colores = [];

        codigo = new Date(venta.createdAt).getFullYear()+'-'+venta.serie.toString().padStart(6,'000000');
        metraje = venta.metraje_cantidad + ' '+ venta.umedida_cantidad;
        fecha = moment(venta.createdAt).format('YYYY-MM-DD');
        colaborador = venta.colaborador.nombres.trim().split(' ')[0]+ ' '+ venta.colaborador.apellidos.trim().split(' ')[0];
        unidad = venta.umedida_cantidad;
        tipo_pago = venta.tipo_pago;
        total = venta.total+venta.descuento;
        descuento = venta.descuento;
        estado = venta.estado;

        if(venta.tipo_usuario == 'Cliente natural'){
            if(venta.cliente.email){
                tipo_cliente = 'Persona natural';
                email = venta.cliente.email;
                nombres = venta.cliente.nombres.trim().split(' ')[0]+ ' '+ venta.cliente.apellidos.trim().split(' ')[0];
            }
        }else{
            if(venta.empresa.email){
                tipo_cliente = 'Empresa';
                email = venta.empresa.email;
                nombres = venta.empresa.razon_social;
            }
        }

        let monto_credito = 0;
        if(estado == 'Pendiente'){
            let solicitud = await Solicitud_credito.findOne({venta:id});
            monto_credito = solicitud.monto;
        }

        let colores = [];
        for(var item of detalles){
            if(colores.length == 0){
                colores.push({
                _id: item.producto_variacion._id,
                producto: item.producto.titulo,
                variante: item.producto_variacion.variante,
                precio: item.precio,
                detalles: [item]
                });
            }else{
                var colores_arr = colores.filter(subitem=> subitem._id == item.producto_variacion._id);
                if(colores_arr.length >= 1){
                    colores_arr[0].detalles.push(item);
                }else{
                    colores.push({
                        _id: item.producto_variacion._id,
                        producto: item.producto.titulo,
                        variante: item.producto_variacion.variante,
                        precio: item.precio,
                        detalles: [item]
                    });
                }
            }
        }


        for(var sitem of colores){
            var total_yrds = 0;
            var total_monto = 0;
            var total_precio = 0;

            for(var det of sitem.detalles){
                total_yrds = total_yrds + parseFloat(det.cantidad);
                total_monto = total_monto + (parseFloat(det.cantidad)*parseFloat(det.precio));
                total_precio = total_precio + det.precio;
            }

            arr_colores.push({
                _id: item._id,
                producto: sitem.producto,
                variante: sitem.variante,
                total_yrds: total_yrds.toFixed(2),
                total_monto: total_monto.toFixed(2),
                rollos: sitem.detalles.length,
                precio: (total_precio/sitem.detalles.length).toFixed(2)
            })
        }

      
        if(email){
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
        
            readHTMLFile(process.cwd() + '/mails/email-venta-resumen.html', async (err, html)=>{
                
        
                let rest_html = ejs.render(html, {
                    email:email,
                    nombres: nombres,
                    codigo: codigo,
                    tipo_cliente: tipo_cliente,
                    metraje: metraje,
                    fecha: fecha,
                    colaborador: colaborador,
                    arr_colores: arr_colores,
                    unidad: unidad,
                    tipo_pago: tipo_pago,
                    total: total,
                    descuento: descuento,
                    estado: estado,
                    monto_credito: monto_credito
                });
        
                var template = handlebars.compile(rest_html);
                var htmlToSend = template({op:true});
        
                var mailOptions = {
                    from: '"OOneunion" <seller@ooneunion.com>',
                    to: email,
                    subject: 'Resumen de pedido en OOneunion.',
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

        
    } catch (error) {
        console.log(error);
    }
}

const send_email_venta_confirmacion = async function(id){

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

        let venta = await Venta.findOne({_id:id}).populate('conf_entrega').populate('cliente').populate('colaborador').populate('empresa').populate('empresa_rs').populate('cliente_ubicacion').populate('cupon');

        let email,nombres,codigo,tipo_cliente,metraje,fecha,colaborador,unidad,tipo_pago,total,descuento;

        codigo = new Date(venta.createdAt).getFullYear()+'-'+venta.serie.toString().padStart(6,'000000');
        metraje = venta.metraje_cantidad + ' '+ venta.umedida_cantidad;
        fecha = moment(venta.createdAt).format('MMMM Do YYYY');
        colaborador = venta.colaborador.nombres.trim().split(' ')[0]+ ' '+ venta.colaborador.apellidos.trim().split(' ')[0];
        unidad = venta.umedida_cantidad;
        tipo_pago = venta.tipo_pago;
        total = venta.total+venta.descuento;
        descuento = venta.descuento;
     
        if(venta.tipo_usuario == 'Cliente natural'){
            if(venta.cliente.email){
                tipo_cliente = 'Persona natural';
                email = venta.cliente.email;
                nombres = venta.cliente.nombres.trim().split(' ')[0]+ ' '+ venta.cliente.apellidos.trim().split(' ')[0];
            }
        }else{
            if(venta.empresa.email){
                tipo_cliente = 'Empresa';
                email = venta.empresa.email;
                nombres = venta.empresa.razon_social;
            }
        }
    
    
        readHTMLFile(process.cwd() + '/mails/email-venta-confirmacion.html', async (err, html)=>{
            
    
            let rest_html = ejs.render(html, {
                email:email,
                nombres: nombres,
                codigo: codigo,
                tipo_cliente: tipo_cliente,
                metraje: metraje,
                fecha: fecha,
                colaborador: colaborador,
                unidad: unidad,
                tipo_pago: tipo_pago,
                total: total,
                descuento: descuento
            });
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: '"OOneunion" <seller@ooneunion.com>',
                to: venta.cliente.email,
                subject: 'Orden de compra confirmada en OOneunion.',
                html: htmlToSend,
                attachments: [{
                    filename: venta.file,
                    path: process.cwd() +'/uploads/invoices/ventas/'+venta.file,
                    contentType: 'application/pdf'
                }],
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

const send_email_venta_envio = async function(id){

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
    
        let venta = await Venta.findOne({_id:id}).populate('conf_entrega').populate('cliente').populate('colaborador').populate('empresa').populate('empresa_rs').populate('cliente_ubicacion').populate('cupon');

        let email,nombres,codigo,tipo_cliente,metraje,fecha,colaborador,unidad,tipo_pago,total,descuento,tracking,metodo_envio;

        codigo = new Date(venta.createdAt).getFullYear()+'-'+venta.serie.toString().padStart(6,'000000');
        metraje = venta.metraje_cantidad + ' '+ venta.umedida_cantidad;
        fecha = moment(venta.createdAt).format('MMMM Do YYYY');
        colaborador = venta.colaborador.nombres.trim().split(' ')[0]+ ' '+ venta.colaborador.apellidos.trim().split(' ')[0];
        unidad = venta.umedida_cantidad;
        tipo_pago = venta.tipo_pago;
        total = venta.total+venta.descuento;
        descuento = venta.descuento;
        tracking = venta.tracking;
        metodo_envio = venta.metodo_envio;

        if(venta.tipo_usuario == 'Cliente natural'){
            if(venta.cliente.email){
                tipo_cliente = 'Persona natural';
                email = venta.cliente.email;
                nombres = venta.cliente.nombres.trim().split(' ')[0]+ ' '+ venta.cliente.apellidos.trim().split(' ')[0];
            }
        }else{
            if(venta.empresa.email){
                tipo_cliente = 'Empresa';
                email = venta.empresa.email;
                nombres = venta.empresa.razon_social;
            }
        }
    
        readHTMLFile(process.cwd() + '/mails/email-venta-envio.html', async (err, html)=>{
            let venta = await Venta.findById({_id:id}).populate('cliente').populate({
                path: 'empresa_rs',
                populate: {
                    path: 'empresa'
                }
            });
            let cliente;
    
            if(venta.tipo_usuario == 'Cliente natural'){
                cliente = venta.cliente.nombres + ' '+venta.cliente.apellidos;
            }else if(venta.tipo_usuario == 'Empresa'){
                cliente = venta.empresa_rs.empresa.razon_social;
            }
    
            let rest_html = ejs.render(html, {
                email:email,
                nombres: nombres,
                codigo: codigo,
                tipo_cliente: tipo_cliente,
                metraje: metraje,
                fecha: fecha,
                colaborador: colaborador,
                unidad: unidad,
                tipo_pago: tipo_pago,
                total: total,
                descuento: descuento,
                tracking: venta.tracking,
                metodo_envio: metodo_envio,
            });
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: '"OOneunion" <seller@ooneunion.com>',
                to: venta.cliente.email,
                subject: 'Tu orden fué enviada por OOneunion.',
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

const send_email_venta_entrega = async function(id){

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

        let venta = await Venta.findOne({_id:id}).populate('conf_entrega').populate('cliente').populate('colaborador').populate('empresa').populate('empresa_rs').populate('cliente_ubicacion').populate('cupon');

        let email,nombres,codigo,tipo_cliente,metraje,fecha,colaborador,unidad,tipo_pago,total,descuento;

        codigo = new Date(venta.createdAt).getFullYear()+'-'+venta.serie.toString().padStart(6,'000000');
        metraje = venta.metraje_cantidad + ' '+ venta.umedida_cantidad;
        fecha = moment(venta.createdAt).format('MMMM Do YYYY');
        colaborador = venta.colaborador.nombres.trim().split(' ')[0]+ ' '+ venta.colaborador.apellidos.trim().split(' ')[0];
        unidad = venta.umedida_cantidad;
        tipo_pago = venta.tipo_pago;
        total = venta.total+venta.descuento;
        descuento = venta.descuento;

        if(venta.tipo_usuario == 'Cliente natural'){
            if(venta.cliente.email){
                tipo_cliente = 'Persona natural';
                email = venta.cliente.email;
                nombres = venta.cliente.nombres.trim().split(' ')[0]+ ' '+ venta.cliente.apellidos.trim().split(' ')[0];
            }
        }else{
            if(venta.empresa.email){
                tipo_cliente = 'Empresa';
                email = venta.empresa.email;
                nombres = venta.empresa.razon_social;
            }
        }
    
        readHTMLFile(process.cwd() + '/mails/email-venta-entrega.html', async (err, html)=>{

            let rest_html = ejs.render(html, {
                email:email,
                nombres: nombres,
                codigo: codigo,
                tipo_cliente: tipo_cliente,
                metraje: metraje,
                fecha: fecha,
                colaborador: colaborador,
                unidad: unidad,
                tipo_pago: tipo_pago,
                total: total,
                descuento: descuento
            });
    
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({op:true});
    
            var mailOptions = {
                from: '"OOneunion" <seller@ooneunion.com>',
                to: venta.cliente.email,
                subject: 'Tu orden fué recibida.',
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

const send_programacion_resumen = async function(id){

    try {

        let programacion = await Programacion.findOne({_id:id}).populate('cliente').populate('colaborador').populate('empresa').populate('empresa_rs');

        let detalles = await Programacion_detalle.find({programacion:id}).populate('programacion').populate('producto').populate('producto_variacion');

        let email,nombres,codigo,tipo_cliente,metraje,fecha,colaborador,unidad,tipo_pago,total,descuento;
        let arr_colores = [];

        codigo = new Date(programacion.createdAt).getFullYear()+'-'+programacion.serie.toString().padStart(6,'000000');
        metraje = '---';
        fecha = moment(programacion.createdAt).format('MMMM Do YYYY');
        colaborador = programacion.colaborador.nombres.trim().split(' ')[0]+ ' '+ programacion.colaborador.apellidos.trim().split(' ')[0];
        tipo_pago = programacion.tipo_pago;
        estado = programacion.estado;

        if(programacion.tipo_usuario == 'Cliente natural'){
            if(programacion.cliente.email){
                tipo_cliente = 'Persona natural';
                email = programacion.cliente.email;
                nombres = programacion.cliente.nombres.trim().split(' ')[0]+ ' '+ programacion.cliente.apellidos.trim().split(' ')[0];
            }
        }else{
            if(programacion.empresa.email){
                tipo_cliente = 'Empresa';
                email = programacion.empresa.email;
                nombres = programacion.empresa.razon_social;
            }
        }

        let arr_detalles = [];
        for(var item of detalles){
            arr_detalles.push({
                _id: item._id,
                producto: item.producto.titulo,
                variante: item.producto_variacion.variante,
                cantidad: item.cantidad.toFixed(2),
                unidad: item.unidad,
                precio_unidad: parseFloat(item.precio_unidad).toFixed(2),
                subtotal: (item.cantidad*parseFloat(item.precio_unidad)).toFixed(2)
            })
        }

        let monto_credito = 0;
        if(estado == 'En espera'){
            let solicitud = await Solicitud_credito.findOne({programacion:id});
            monto_credito = solicitud.monto;
        }



      
        if(email){
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
        
            readHTMLFile(process.cwd() + '/mails/email-programacion-resumen.html', async (err, html)=>{
                
        
                let rest_html = ejs.render(html, {
                    email:email,
                    nombres: nombres,
                    codigo: codigo,
                    tipo_cliente: tipo_cliente,
                    metraje: metraje,
                    fecha: fecha,
                    colaborador: colaborador,
                    arr_detalles: arr_detalles,
                    unidad: unidad,
                    tipo_pago: tipo_pago,
                    estado: estado,
                    monto_credito: monto_credito
                });
        
                var template = handlebars.compile(rest_html);
                var htmlToSend = template({op:true});
        
                var mailOptions = {
                    from: '"OOneunion" <seller@ooneunion.com>',
                    to: email,
                    subject: 'Resumen de programación en OOneunion.',
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

        
    } catch (error) {
        console.log(error);
    }
}

const get_ventas_confirmadas = async function(req,res){
    try {
        let arr_ventas = [];
        let ventas = await Venta.find({estado: 'Confirmado'})
        .populate('cliente_ubicacion')
        .populate('empresa_rs')
        .populate('cliente')
        .sort({createdAt:-1});

        for(var item of ventas){
            let enviados = await Venta_detalle.find({venta:item._id,estado: 'Enviado'});
            let detalles = await Venta_detalle.find({venta:item._id});

            if(detalles.length >= 1){
                arr_ventas.push({
                    venta: item,
                    enviados: enviados.length,
                    detalles: detalles.length
                });
            }
        }

        res.status(200).send({data:arr_ventas});
    } catch (error) {
        console.log(error);
    }
}

const get_detalles_venta = async function(req,res){
    try {
        let id = req.params['id'];
        let arr_ventas = [];
        let venta = await Venta.findById({_id:id}).populate('cliente_ubicacion');
        let detalles = await Venta_detalle.find({venta: id,estado: 'Confirmado',tipo_detalle:'En almacen'})
        .populate('venta').populate('producto')
        .populate('producto_variacion')
        .populate({
            path: 'ingreso_detalle',
            populate: {
                path: 'ingreso'
            }
        }).populate('venta_envio')
        .sort({createdAt:-1});

        res.status(200).send({data:detalles,venta});
    } catch (error) {
        console.log(error);
    }
}

const unidades_disponibles_productos = async function(req,res){
    if(req.user){
        let products = req.body.products;
        console.log(products);
        const arr_id_products = products.map(id => mongoose.Types.ObjectId(id));

        var rollos = [];
        let ingresos_rollos = await Ingreso_detalle.find({producto: { $in: arr_id_products }, estado: true}).sort({cantidad:1})
        .populate('ingreso')
        .populate('pedido_detalle')
        .populate('producto')
        .populate('producto_variacion');

        for(var item of ingresos_rollos){
            let unidades_venta = await Venta_detalle.find({ingreso_detalle: item._id});
            if(unidades_venta.length == 0){
                rollos.push(item);
            }
        }
        res.status(200).send({data:rollos});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_ventas_envios = async function(req,res){
    if(req.user){
        let data = [];
        let ventas = [];
        let ventas_totales = [];

        var estados = {
            confirmado: 0,
            procesado: 0
        }

        const estado = req.params['estado'];
        const page = parseInt(req.params['page']) || 1; // Página predeterminada
  

        let query = {};
        if (req.user.rol !== 'Administrador') {
            query.colaborador = req.user.sub;
        }
        
        query.estado = { $nin: ['Pendiente'] };

        ventas_totales = await Venta.find();

        ventas = await Venta.find(query)
        .populate('colaborador')
        .populate('empresa')
        .populate('cliente')
        .populate({
            path: 'empresa_rs',
            populate: {
                path: 'empresa'
            }
        })
        .populate('ingreso')
        .populate('cupon')
        .sort({ createdAt: -1 })
        .limit(page);

        console.log("Ventas "+ventas.length);

        for(var item of ventas){
            let abonado = 0;
            let detalles = await Venta_detalle.find({venta: item._id,tipo_detalle:'En almacen'})
            .populate('producto')
            .populate('producto_variacion')
            .populate('ingreso_detalle');

            let enviados = await Venta_detalle.find({venta: item._id,$or: [
                {estado:'Enviado'},
                {estado:'Entregado'},
            ]});
            console.log('ENVIADOS'+enviados.length);
            
            //SEPARACION POR COLORES
            
            if(item.estado == 'Procesado') estados.procesado++;
            else  if(item.estado == 'Confirmado') estados.confirmado++;


            if(detalles.length >= 1){
                data.push({
                    venta: item,
                    detalles: detalles.length,
                    enviados: enviados.length,
                    tipo: 'Venta',
                    createdAt: item.createdAt,
                });
            }
        }
        res.status(200).send({data:data,estados,todos:ventas_totales.length});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_venta_guest = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
           
            let ventas = await Venta.find({serie:id})
            .populate('conf_entrega')
            .populate('cliente')
            .populate('colaborador')
            .populate('empresa')
            .populate('empresa_rs')
            .populate('cliente_ubicacion')
            .populate('cupon');


            if(ventas.length >= 1){

                let ventas_ = await Venta.find({
                    cliente:ventas[0].cliente._id,
                    pago: 'Pendiente',
                    $or : [
                        {estado: {$ne: 'Pendiente'}},
                        {estado: {$ne: 'Cancelado'}},
                    ]
                });
                let deuda = 0;
                for(var item of ventas_){
                    deuda = deuda + (item.monto_ventas - item.monto_pagado)
                }

                let detalles_almacen = await Venta_detalle.find({venta:ventas[0]._id,
                    tipo_detalle:'En almacen'}
                ).populate('venta').populate('producto')
                .populate('producto_variacion').populate({
                    path: 'ingreso_detalle',
                    populate: {
                        path: 'ingreso'
                    }
                }).populate('venta_envio');
                
                let envios = await Venta_envio.find({venta:ventas[0]._id})
                .populate('cliente_ubicacion')
                .sort({createdAt:-1});

                res.status(200).send({data:{
                    detalles_almacen,
                    venta: ventas[0],
                    envios,
                    deuda,
                }});
            }else{
                res.status(200).send({data:undefined});
            }
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

module.exports = {
    create_venta,
    create_programaciones,
    get_ventas,
    get_ventas_envios,
    get_last_ventas,
    get_venta,
    update_estado_venta,
    add_doc_venta,
    get_doc_venta,
    create_doc_envio,
    remove_detalle_venta,
    add_detalle_venta,
    get_programacion,
    get_programaciones_range,
    get_productos_programaciones_pedido,
    get_ventas_serie,
    get_venta_pagos,
    crear_pago,
    cancelar_venta,
    get_pagos,
    get_detalle_ingreso_by_color_venta,
    get_detalle_ingreso_by_variacion_venta,
    aprobar_pago,
    cancelar_pago,
    get_image_comprobante,
    get_programacion_nota,
    get_venta_nota,
    get_venta_cobranza,
    create_cupon,
    get_cupones,
    get_cupon,
    cancelar_comprador_cupon,
    download_cfdi,
    update_file_venta,
    update_file_entrega_envio,
    update_firma_envio,
    update_file_programacion,
    cancelar_programacion,
    cancelar_detalle_programacion,
    confirmar_programacion,
    obtener_ventas_en_camino,
    actualizar_prioridades_ventas,
    update_total_venta,
    get_ventas_confirmadas,
    get_detalles_venta,
    unidades_disponibles_productos,
    timbrar_borrador_pago,
    confirmar_entrega_venta,
    get_envios_venta,
    get_envios_procesados,
    update_file_envio_venta,
    confirmar_estado_venta,
    get_venta_guest
}