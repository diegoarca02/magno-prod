var Pedido = require('../models/Pedido');
var Venta = require('../models/Venta');
var Pedido_detalle = require('../models/Pedido_detalle');
var Pedido_envio = require('../models/Pedido_envio');
var Pedido_detalle_file = require('../models/Pedido_detalle_file');
var Producto_color = require('../models/Producto_color');
var Ingreso = require('../models/Ingreso');
var Ingreso_detalle = require('../models/Ingreso_detalle');
var Proveedor = require('../models/Proveedor');
var Programacion = require('../models/Programacion');
var Programacion_detalle = require('../models/Programacion_detalle');
var Venta_detalle = require('../models/Venta_detalle');
var Pago_completo = require('../models/Pago_completo');
var Pago = require('../models/Pago');
var Solicitud_credito = require('../models/Solicitud_credito');
var Transacciones = require('../models/Transacciones');

var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var moment = require('moment');
var Ropa_variacion = require('../models/Ropa_variacion');
var Producto_variacion = require('../models/Producto_variacion');
const Pedido_contenedor = require('../models/Pedido_contenedor');
const Cliente = require('../models/Cliente');

const create_pedido = async function(req,res){
    if(req.user){
        try {
            let data = req.body;
            data.colaborador = req.user.sub;


            //ULTIMA SERIE
            let last_pedido = await Pedido.find().sort({serie:-1});
            let new_serie = 0;
            if(last_pedido.length>=1){
                new_serie = last_pedido[0].serie + 1;
            }else{
                new_serie = 1;
            }

            //CALCULAR TOTAL
            let total = 0;
            for(var item of data.detalles){
                total = total + (item.cantidad*parseFloat(item.precio));
            }

            data.day = new Date().getDate(),
            data.month = new Date().getMonth()+1,
            data.year = new Date().getFullYear(),
            data.serie = new_serie;
            data.monto_resultante = total;
            data.fecha_pedido = new Date(data.fecha_pedido+'T00:00:00');
            data.tipo_pedido = 'Pedido';
            let pedido = await Pedido.create(data);

            for(var item of data.detalles){
                item.pedido = pedido._id;
                item.colaborador = req.user.sub;

                if(item.tipo_pedido == 'Programación'){
                    let detalle = await Programacion_detalle.findById({_id:item.programacion_detalle});
                    let programacion = await Programacion.findById({_id:detalle.programacion});

                    await Programacion_detalle.findByIdAndUpdate({_id:item.programacion_detalle},{
                        cantidad_pedido: item.cantidad,
                        estado: 'Realizado',
                        pedido: pedido._id
                    });

                    let detalles_programacion = await Programacion_detalle.find({programacion:programacion._id,estado:'Realizado'});
                    let detalles_totales = await Programacion_detalle.find({programacion:programacion._id});

                    if(detalles_programacion.length == detalles_totales.length){
                        await Programacion.findByIdAndUpdate({_id:detalle.programacion},{
                            estado: 'Realizado',
                        })
                    }
                }

                item.programacion_pedido = item.programacion_detalle;
                delete item._id;
                await Pedido_detalle.create(item);
            }

            /* send_email_invoice(pedido._id,proveedor.email); */

            res.status(200).send({data:pedido});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined,message: 'Ocurrió un error inesperado.'});
        }

    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const create_pedido_ropa = async function(req,res){
    if(req.user){
        try {
            let data = req.body;
            data.colaborador = req.user.sub;

            //PROVEEDOR
            let proveedor = await Proveedor.findById({_id:data.proveedor});

            //ULTIMA SERIE
            let last_pedido = await Pedido.find().sort({serie:-1});
            let new_serie = 0;
            if(last_pedido.length>=1){
                new_serie = last_pedido[0].serie + 1;
            }else{
                new_serie = 1;
            }

            //CALCULAR TOTAL
            let total = 0;
            for(var item of data.detalles){
                total = total + item.subtotal;
            }

            data.day = new Date().getDate(),
            data.month = new Date().getMonth()+1,
            data.year = new Date().getFullYear(),
            data.serie = new_serie;
            data.monto_resultante = total;
            data.fecha_pedido = new Date(data.fecha_pedido+'T00:00:00');
            data.tipo_pedido = 'Pedido';
            data.tipo = 'Ropa';
            console.log(data);
            let pedido = await Pedido.create(data);

            for(var item of data.detalles){
                item.pedido = pedido._id;
                item.colaborador = req.user.sub;

                if(item.tipo_pedido == 'Programación'){
                    let detalle = await Programacion_detalle.findById({_id:item.programacion_detalle});
                    let programacion = await Programacion.findById({_id:detalle.programacion});

                    await Programacion_detalle.findByIdAndUpdate({_id:item.programacion_detalle},{
                        estado: 'Realizado',
                        pedido: pedido._id
                    });

                    let detalles_programacion = await Programacion_detalle.find({programacion:programacion._id,estado:'Realizado'});
                    let detalles_totales = await Programacion_detalle.find({programacion:detalle.programacion});

                    if(detalles_programacion.length == detalles_totales.length){
                        await Programacion.findByIdAndUpdate({_id:detalle.programacion},{
                            estado: 'Realizado',
                        })
                    }
                }
                
                await Pedido_detalle.create(item);
            } 

        /*   send_email_invoice(pedido._id,proveedor.email); */

            res.status(200).send({data:pedido});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined,message: 'Ocurrió un error inesperado.'});
        }

    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_pedidos = async function(req,res){
    if(req.user){
        const estado = req.params['estado'];
        const page = parseInt(req.params['page']) || 1; // Página predeterminada

        let pedidos_todos = await Pedido.find();

        const data = [];
        const estados = {
            pedido: 0,
            aprobado: 0,
            enviado: 0,
            confirmado: 0,
        };

        let pedidos;

        if (estado === 'Todos') {
            pedidos = await Pedido.find()
                .populate('colaborador')
                .sort({ createdAt: -1 })
                .limit(page);

        } else {
            pedidos = await Pedido.find({ estado })
                .populate('colaborador')
                .sort({ createdAt: -1 })
                .limit(page);
        }

        for (const item of pedidos) {
            const detalles = await Pedido_detalle.find({ pedido: item._id })
                .populate('color')
                .populate('producto')
                .populate('producto_variacion')
                .populate('programacion_detalle');

            data.push({
                pedido: item,
                detalles: detalles,
                visible: true
            });

            for (const subitem of detalles) {
                if (subitem.estado === 'Pedido') estados.pedido++;
                else if (subitem.estado === 'Aprobado') estados.aprobado++;
                else if (subitem.estado === 'Enviado') estados.enviado++;
                else if (subitem.estado === 'Confirmado') estados.confirmado++;
            }
        }

        estados.todos = pedidos.length;

        res.status(200).send({ data, estados, todos:pedidos_todos.length });
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_pedido = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let arr_envios = [];

            let pedido = await Pedido.findById({_id:id}).populate('colaborador');
            let arr_detalles = [];
            let detalles = await Pedido_detalle.find({pedido:id}).populate('color').populate('pedido').populate('producto').populate('producto_variacion').populate('proveedor').populate({
                path: 'programacion_detalle',
                populate: {
                    path: 'programacion'
                }
            }).populate('cupon').populate('proveedor');


            console.log(detalles[0]);

            for(let item of detalles){
                let reservados = 0;
                var d_ventas = await Venta_detalle.find({producto_variacion: item.producto_variacion._id,tipo_detalle:'En camino'})
                .populate('venta').populate('color');

                for(let element of d_ventas){

                    if(item.unidad == 'Mtr'){
                        if(element.unidad == 'Yrd') element.cantidad = parseFloat(element.cantidad) * 0.9144; 
                    }else if(item.unidad == 'Yrd'){
                        if(element.unidad == 'Mtr') element.cantidad = parseFloat(element.cantidad) * 1.09361; 
                    }

                    reservados = reservados + parseFloat(element.cantidad);
                }

                console.log(item.color);
              
                arr_detalles.push({
                    _id: item._id,
                    colaborador: item.colaborador,
                    pedido: item.pedido,
                    producto: item.producto,
                    proveedor: item.proveedor,
                    producto_variacion: item.producto_variacion,
                    color: item.color,
                    tipo_pedido: item.tipo_pedido,
                    cantidad: item.cantidad,
                    unidad: item.unidad,
                    precio: item.precio,
                    programacion_detalle: item.programacion_detalle,
                    estado: item.estado,
                    createdAt: item.createdAt,
                    reservados: reservados,
                    contenedor: item.contenedor,
                    porcent: item.porcent,
                });
            }

            let contenedores = await Pedido_contenedor.find({pedido:id});

            res.status(200).send({
                data:true,
                pedido,
                detalles:arr_detalles,
                lasted_envio:arr_envios,
                contenedores
            });
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_pedido_serie = async function(req,res){
    if(req.user){
        try {
            let serie = req.params['serie'];
            if(serie != 'Todos'){
                let pedidos = await Pedido.find({serie:serie}).populate('colaborador').sort({createdAt:-1});
                let arr_pedidos = [];
                for(var item of pedidos){
                    let detalles = await Pedido_detalle.find({pedido:item._id,estado: 'Enviado'});
                    let envios = await Pedido_detalle.find({pedido:item._id,$and:[
                        {estado: 'Enviado'},
                        {estado: {$ne: 'Cancelado'}}
                    ]});

                    let porcent = (envios.length/detalles.length)*100;
                    if(porcent == null || !porcent) porcent = 0;

                    arr_pedidos.push({
                        pedido: item,
                        detalles: detalles.length,
                        envios: envios.length,
                        porcent_envios: porcent
                    });
                }
                res.status(200).send({data:arr_pedidos});
            }else{
                let pedidos = await Pedido.find({ $or:[ {estado:'Enviado'}, {estado:'Aprobado'} ]}).populate('colaborador').sort({createdAt:-1});
                let arr_pedidos = [];
                for(var item of pedidos){
                    let detalles = await Pedido_detalle.find({pedido:item._id,estado: 'Enviado'});
                    let envios = await Pedido_detalle.find({pedido:item._id,$and:[
                        {estado: 'Enviado'},
                        {estado: {$ne: 'Cancelado'}}
                    ]});

                    let porcent = (envios.length/detalles.length)*100;
                    if(porcent == null|| !porcent) porcent = 0;

                    arr_pedidos.push({
                        pedido: item,
                        detalles: detalles.length,
                        envios: envios.length,
                        porcent_envios: porcent
                    });
                }
                res.status(200).send({data:arr_pedidos});
            }
        } catch (error) {
            res.status(200).send({data:[]});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_envios_pedido = async function(req,res){
    if(req.user){
        try {
            let envios = await Pedido_envio.find({estado:'Enviado'}).sort({serie : -1});
            let arr_envios = [];

            for(var item of envios){

                let pedidos = await Pedido_detalle.find({pedido_envio:item._id});
                let pendientes = await Pedido_detalle.find({pedido_envio:item._id,estado:'Enviado'});
                let finalizados = await Pedido_detalle.find({pedido_envio:item._id,estado:'Confirmado'});

                    

                arr_envios.push({
                    envio: item,
                    total: pedidos.length,
                    pendientes: pendientes.length,
                    finalizados: finalizados.length
                });
            }

            res.status(200).send({data:arr_envios});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:[]});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_envio_pedido = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let envio = await Pedido_envio.findById({_id:id});
            if(envio){
                let detalles = await Pedido_detalle.find({pedido_envio : envio._id}).populate('color').populate('pedido').populate('producto').populate('producto_variacion').populate('proveedor').populate({
                    path: 'programacion_detalle',
                    populate: {
                        path: 'programacion'
                    }
                }).populate('cupon').populate('proveedor');
    ;
                res.status(200).send({data:detalles});
            }else{
                res.status(200).send({data:undefined});
            }
            
        } catch (error) {
            console.log(error);
            res.status(200).send({data:[]});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_pedido_serie_ropa = async function(req,res){
    if(req.user){
        try {
            let serie = req.params['serie'];
            if(serie != 'Todos'){
                let pedidos = await Pedido.find({serie:serie,tipo:'Ropa'}).populate('proveedor').populate('colaborador').sort({createdAt:-1});
                res.status(200).send({data:pedidos});
            }else{
                let pedidos = await Pedido.find({ $or:[ {estado:'Enviado'}, {estado:'Aprobado'} ],tipo:'Ropa'}).populate('proveedor').populate('colaborador').sort({createdAt:-1});
                res.status(200).send({data:pedidos});
            }
        } catch (error) {
            res.status(200).send({data:[]});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}


const get_pedido_public = async function(req,res){
    try {
        let id = req.params['id'];
        let pedido = await Pedido.findById({_id:id}).populate('proveedor').populate('colaborador');
        let detalles = await Pedido_detalle.find({pedido:id}).populate('producto').populate('producto_color');

        res.status(200).send({data:true,pedido,detalles});
    } catch (error) {
        res.status(200).send({data:undefined});
    }
}

const update_estado_pedido = async function(req,res){
    if(req.user){
        
        let id = req.params['id'];
        let data = req.body;

        let pedido = await Pedido.findByIdAndUpdate({_id:id},{
            estado: data.estado,
        });

        await Pedido_detalle.updateMany({pedido:id},{
            estado: data.estado,
        });

        if(data.estado == 'Cancelado'){
            let programaciones = await Pedido_detalle.find({pedido: id});
            for(var item of programaciones){
                await Pedido_programacion.findByIdAndUpdate({_id:item.pedido_programacion},{
                    estado: 'Pendiente'
                });
            }
        }

        res.status(200).send({data:pedido});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_detalle_pedido = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let detalle = await Pedido_detalle.findById({_id:id}).populate('producto').populate('producto_color').populate({
                path: 'pedido',
                populate:{
                    path: 'proveedor'
                }
            }).populate({
                path: 'pedido',
                populate:{
                    path: 'colaborador'
                }
            });

            res.status(200).send({data:true,detalle});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const obtener_pedidos_detalles_aprobados = async function(req,res){
    if(req.user){
        try {
            let detalles = await Pedido_detalle.find({estado: 'Aprobado'})
            .populate('proveedor')
            .populate('producto')
            .populate('color')
            .populate('producto_variacion')
            .populate({
                path: 'pedido',
                populate:{
                    path: 'colaborador'
                }
            })
            .populate({
                path: 'programacion_detalle',
                populate:{
                    path: 'programacion'
                }
            });

            res.status(200).send({data:detalles});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const create_envio_detalle = async function(req,res){
    if(req.user){
        
        let data = req.body;
        data.colaborador = req.user.sub;
        data.costos_adicionales = JSON.parse(data.costos_adicionales);

        await Pedido.findByIdAndUpdate({_id:data.pedido},{
            tipo_envio: data.tipo_envio,
        });

        await Pedido_detalle.findByIdAndUpdate({_id:data.pedido_detalle},{
            cantidad: data.cantidad,
            precio: data.precio,
            estado: 'Enviado'
        });

        let detalles_sd = await Pedido_detalle.find({pedido: data.pedido});

        let count_enviados = 0;
        for(var item of detalles_sd){
            if(item.estado == 'Enviado') count_enviados++;
        }

        if(detalles_sd.length == count_enviados){
            await Pedido.findByIdAndUpdate({_id:data.pedido},{
                estado: 'Enviado',
            });
        }

        let envio = await Pedido_envio.create(data);
   
        if(req.files){
            for(var item of req.files.files){
            
                let img_single = (item.path).split('\\')[2];
                await Pedido_detalle_file.create({
                    archivo : item.name,
                    name: img_single,
                    formato: item.type,
                    peso: item.size,
                    pedido : data.pedido,
                    pedido_detalle : data.pedido_detalle,
                    colaborador : req.user.sub,
                });
            }
        }
        
        res.status(200).send({data:envio});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const verify_envio = async function(req,res){
    if(req.user){
        
        let id = req.params['id'];
        let tipo = req.params['tipo'];
        if(tipo == 'Detalle'){
            let envios = await Pedido_envio.find({pedido_detalle:id}).populate('pedido');
            let documentos = await Pedido_detalle_file.find({pedido_detalle:id}).populate('pedido');
            res.status(200).send({data:envios,documentos});
        }else if(tipo == 'Envio'){
            let envios = await Pedido_envio.find({pedido:id}).populate('pedido');
            let documentos = await Pedido_detalle_file.find({pedido:id}).populate('pedido');
            res.status(200).send({data:envios,documentos});
        }

       
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_file = async function(req,res){
    var file = req.params['file'];
    fs.stat('./uploads/envios/'+file, function(err){
        if(!err){
            let path_file = './uploads/envios/'+file;
            res.status(200).sendFile(path.resolve(path_file));
        }else{
            let path_file = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_file));
        }
    });
}

const create_envio_pedido = async function(req,res){
    if(req.user){
        
        try {
            let data = req.body;
            console.log(data);

            //ULTIMA SERIE
            let last_envio = await Pedido_envio.find().sort({serie:-1});
            let new_serie = 0;
            if(last_envio.length>=1){
                new_serie = last_envio[0].serie + 1;
            }else{
                new_serie = 1;
            }

            data.colaborador = req.user.sub;
            data.serie = new_serie;
            let envio = await Pedido_envio.create(data);
            for(var item of data.pedidos_envio){
                let pedido_reg = await Pedido_detalle.findOne({_id:item});
                await Pedido_detalle.findByIdAndUpdate({_id:item},{
                    estado: 'Enviado',
                    pedido_envio: envio._id
                });

                let detalles_enviados = await Pedido_detalle.find({pedido:pedido_reg.pedido,$or:[
                    {estado:'Aprobado'},
                    {estado:'Pedido'},
                ]});
                if(detalles_enviados.length == 0){
                    await Pedido.findByIdAndUpdate({_id:pedido_reg.pedido},{
                        estado: 'Enviado',
                    });
                }
            }

            if(data.arr_contenedores.length >= 1){
                for(var item of data.arr_contenedores){
                    item.colaborador = req.user.sub;
                    item.pedido_envio = envio._id;
                    item.detalles = item.detalles;
                    await Pedido_contenedor.create(item);
                }
            }

            res.status(200).send({data:envio});
        } catch (error) {
            console.log(error);
            res.status(500).send({message: 'NoAccess'});
        }
  
    }else{
   
        res.status(500).send({message: 'NoAccess'});
    }
}


const create_ingreso = async function(req,res){
    if(req.user){
        try {
            let data = req.body;

            //ULTIMA SERIE
            let last_ingreso = await Ingreso.find().sort({serie:-1});
            let new_serie = 0;
            if(last_ingreso.length>=1){
                new_serie = last_ingreso[0].serie + 1;
            }else{
                new_serie = 1;
            }

            data.colaborador = req.user.sub;
            data.day = new Date().getDate();
            data.month = new Date().getMonth()+1;
            data.year = new Date().getFullYear();
            data.serie = new_serie;

            let ingreso = await Ingreso.create(data);
            let detalles_programaciones = [];
       
            //OBTENER LOS PEDIDOS
            const set = new Set();
            for(var item of data.detalles){
                item.ingreso = ingreso._id;
                item.colaborador = req.user.sub;
                item.day = new Date().getDate();
                item.month = new Date().getMonth()+1;
                item.year = new Date().getFullYear();

                if(item.pedido_detalle)  set.add(item.pedido_detalle);
                await Ingreso_detalle.create(item);
            }
            const arr_pedidos = Array.from(set);

            
            if(arr_pedidos.length >= 1){
                for(var item of arr_pedidos){
                    let item_pedido_detalle = await Pedido_detalle.findOne({_id:item});
                 
                    await Pedido_detalle.findByIdAndUpdate({_id:item},{
                        estado:'Confirmado',
                        ingreso: ingreso._id
                    });

                    if(item_pedido_detalle.tipo_pedido == 'Programación'){
                        let reg = await Programacion_detalle.findById({
                            _id:item_pedido_detalle.programacion_detalle
                        }).populate('venta');
                        detalles_programaciones.push(reg)
                    }

                    let arr_detalles_pedidos = await Pedido_detalle.find({pedido: item_pedido_detalle.pedido});
                    let arr_pedidos_confirmados = await Pedido_detalle.find({pedido: item_pedido_detalle.pedido,estado: 'Confirmado'});
                    console.log(arr_pedidos_confirmados.length + ' - '+ arr_detalles_pedidos.length);
                    if(arr_pedidos_confirmados.length == arr_detalles_pedidos.length){
                        await Pedido.findByIdAndUpdate({_id:item_pedido_detalle.pedido},{
                                estado:'Confirmado'
                        });
                    }
                }
            }

             //////////
             var detalle_camino = await Venta_detalle.find({tipo_detalle:'En camino'}).populate('venta');

             console.log('4------');
             for(var element of detalle_camino){
                 var rollos = [];
                 var arr_rollos = [];
                 var metraje_detalle_venta = 0;
                 var arr_detalles_ingreso = await Ingreso_detalle.find({
                     ingreso:ingreso._id, 
                     estado: true,
                     producto_variacion:element.producto_variacion}
                     ).sort({cantidad:1})
                 .populate('ingreso')
                 .populate('pedido_detalle')
                 .populate('producto')
                 .populate('producto_variacion');
 
                 console.log(arr_detalles_ingreso.length + ' INDICES');
 
                 for(var item of arr_detalles_ingreso){
                     rollos.push({
                         _id: item._id,
                         colaborador: item.colaborador,
                         ingreso: item.ingreso,
                         producto: item.producto,
                         producto_variacion: item.producto_variacion,
                         codigo:item.codigo,
                         unidad: item.unidad,
                         cantidad: item.cantidad,
                         day: item.day,
                         month: item.month,
                         year: item.year,
                         estado: item.estado,
                         eliminacion: item.eliminacion,
                         createdAt: item.createdAt,
                     });
                 }
 
                 if(arr_detalles_ingreso.length >= 1){
                     console.log(rollos.length + ' INDICES rollos' + ' Cantidad ' + parseFloat(element.cantidad));
 
                     for(var item of rollos){
                     
                         if(metraje_detalle_venta<= element.cantidad){
                             metraje_detalle_venta = metraje_detalle_venta + parseFloat(item.cantidad);
                             await Venta_detalle.create({
                                 tipo : 'Tela',
                                 colaborador : element.venta.colaborador,
                                 venta : element.venta._id,
                                 day : new Date().getDate(),
                                 month : new Date().getMonth()+1,
                                 year : new Date().getFullYear(),
                                 unidad : 'Mtr',
                                 cantidad : parseFloat(item.cantidad),
                                 tipo_usuario : element.venta.tipo_usuario,
                                 cliente: element.venta.cliente,
                                 empresa: element.venta.empresa,
                                 empresa_rs: element.venta.empresa_rs,
                                 tipo_detalle : "En almacen",
                                 precio: element.precio,
                                 producto : element.producto,
                                 producto_variacion : element.producto_variacion,
                                 color : element.color,
                                 fe_inicio: moment().format('YYYY-MM-DD'),
                                 fe_fin: moment().add(4, 'days').format('YYYY-MM-DD'),
                                 descuento: false,
                                 estado : "Procesado",
                                 ingreso_detalle: item._id
                             });
                         }
                     }
 
                     let cantidad_restante_detalle = element.cantidad - metraje_detalle_venta;
                     console.log('Pendiente: ' + cantidad_restante_detalle);
 
                     if(cantidad_restante_detalle >= 20){
                         console.log(1);
                         await Venta_detalle.findByIdAndUpdate({_id: element._id},{
                             cantidad: cantidad_restante_detalle
                         });
                     }else{
                         console.log(2);
                         await Venta_detalle.findByIdAndRemove({_id: element._id});
                     }
                 }
             }
             console.log('5------');
             console.log(detalles_programaciones.length);
             if(detalles_programaciones.length >= 1){
                var arr_ventas = new Set();

                for(var element of detalles_programaciones){

                    if(!arr_ventas.has(element.venta._id)){
                        arr_ventas.add(element.venta._id);
                    }

                    let rollos = [];
                    let arr_rollos = [];
                    let metraje_detalle_venta = 0;
                    let arr_detalles_ingreso_pgrms = await Ingreso_detalle.find({
                        ingreso:ingreso._id, 
                        estado: true,
                        producto_variacion:element.producto_variacion
                    })
                    .populate('ingreso')
                    .populate('pedido_detalle')
                    .populate('producto')
                    .populate('producto_variacion').sort({cantidad:1});
    
                    console.log(arr_detalles_ingreso_pgrms.length + ' INDICES');
    
                    if(arr_detalles_ingreso_pgrms.length >= 1){
                        for(var item of arr_detalles_ingreso_pgrms){
                            rollos.push({
                                _id: item._id,
                                colaborador: item.colaborador,
                                ingreso: item.ingreso,
                                producto: item.producto,
                                producto_variacion: item.producto_variacion,
                                codigo:item.codigo,
                                unidad: item.unidad,
                                cantidad: item.cantidad,
                                day: item.day,
                                month: item.month,
                                year: item.year,
                                estado: item.estado,
                                eliminacion: item.eliminacion,
                                createdAt: item.createdAt,
                            });
                        }
                        for(var item of rollos){
                            
                            if(metraje_detalle_venta<= element.cantidad){
                                metraje_detalle_venta = metraje_detalle_venta + parseFloat(item.cantidad);
                                await Venta_detalle.create({
                                    tipo : 'Tela',
                                    colaborador : element.venta.colaborador,
                                    venta : element.venta._id,
                                    day : new Date().getDate(),
                                    month : new Date().getMonth()+1,
                                    year : new Date().getFullYear(),
                                    unidad : 'Mtr',
                                    cantidad : parseFloat(item.cantidad),
                                    tipo_usuario : element.venta.tipo_usuario,
                                    cliente: element.venta.cliente,
                                    empresa: element.venta.empresa,
                                    empresa_rs: element.venta.empresa_rs,
                                    tipo_detalle : "En almacen",
                                    precio: element.precio_unidad,
                                    producto : element.producto,
                                    producto_variacion : element.producto_variacion,
                                    color : element.color,
                                    fe_inicio: moment().format('YYYY-MM-DD'),
                                    fe_fin: moment().add(4, 'days').format('YYYY-MM-DD'),
                                    descuento: false,
                                    estado : "Confirmado",
                                    ingreso_detalle: item._id
                                });
                            }
                        }
        
                        let cantidad_restante_detalle = element.cantidad - metraje_detalle_venta;
        
                        await Programacion_detalle.findByIdAndUpdate({_id: element._id},{
                            estado: 'Finalizado',
                            cantidad_recibida: metraje_detalle_venta,
                        });

                        console.log('PROGRAMACION '+ element.venta._id);
                        aprobar_pago(element.venta._id,req.user.sub);
                    }
                }

                for(var element of arr_ventas){
                    let venta = await Venta.findById({_id:element});
                    let detalles_v = await Venta_detalle.find({venta:element});
                    let detalles_p = await Programacion_detalle.find({venta:element});
                    let cliente;
                    let monto_faltante = 0;

                    if(venta.tipo_usuario == 'Cliente natural'){
                        cliente = await Cliente.findById({_id:venta.cliente});
                    }

                    let monto_ventas = 0;
                    let monto_programaciones = 0;

                    for(var subitem of detalles_v){
                        monto_ventas = monto_ventas + (subitem.cantidad*subitem.precio);
                    }

                    for(var subitem of detalles_p){
                        if(subitem.estado != 'Finalizado'){
                            monto_programaciones = monto_programaciones + (subitem.cantidad*subitem.precio_unidad);
                        }
                    }
                    
                    monto_faltante = venta.monto_total - (parseFloat(monto_ventas) + parseFloat(monto_programaciones));
                    //CALCULAR SERIE
                    let last_solicitud = await Solicitud_credito.find().sort({serie:-1});
                    let new_serie = 0;
                    if(last_solicitud.length>=1)new_serie = last_solicitud[0].serie + 1; 
                    else new_serie = 1;

                    let last_transaccion = await Transacciones.find().sort({serie:-1});
                    let new_serie_transaccion = 0;
                    if(last_transaccion.length>=1)new_serie_transaccion = last_transaccion[0].serie + 1; 
                    else new_serie_transaccion = 1;

                    //AUMENTAR TOTAL
                    if(monto_faltante < 0){
                        
                        let solicitud = await Solicitud_credito.create({
                            cliente: cliente._id,
                            tipo_usuario: 'Cliente natural',
                            monto: Math.abs(monto_faltante),
                            tipo: 'Ampliación',
                            colaborador: req.user.sub,
                            serie: new_serie,
                            day: new Date().getDate(),
                            month: new Date().getMonth()+1,
                            year: new Date().getFullYear(),
                            estado: 'Aprobado',
                            createdAt_resolucion: Date.now(),
                        });

                        
                        await Cliente.findByIdAndUpdate({_id:cliente._id},{
                            credito_total: cliente.credito_total + Math.abs(monto_faltante),
                            credito_disponible: cliente.credito_disponible + Math.abs(monto_faltante)
                        });

                        //TRANSACCION
                        let transaccion = await Transacciones.create({
                            cliente: cliente._id,
                            tipo_usuario: 'Cliente natural',
                            venta: venta._id,
                            monto: -Math.abs(monto_faltante),
                            colaborador: req.user.sub,
                            serie: new_serie_transaccion,
                            day: new Date().getDate(),
                            month: new Date().getMonth()+1,
                            year: new Date().getFullYear(),
                            descripcion: 'Actualización de venta por programaciones.',
                            estado: true
                        });

                        if(transaccion){
                            let reg_cliente = await Cliente.findById({_id:venta.cliente});
                            await Cliente.findByIdAndUpdate({_id:cliente._id},{
                                credito_disponible: reg_cliente.credito_disponible - Math.abs(monto_faltante),
                                credito_usado: reg_cliente.credito_usado + Math.abs(monto_faltante),
                            });
                        }
                    }
                    
                    await Venta.findByIdAndUpdate({_id:element},{
                        monto_ventas: monto_ventas,
                        monto_programaciones: monto_programaciones,
                        monto_total: parseFloat(monto_ventas) + parseFloat(monto_programaciones),
                    });
                }

                //ACTUALIZAR ESTADO DE ENVIO

                let pedidos_envio = await Pedido_detalle.find({pedido_envio: data.pedido_envio,ingreso: { $exists: false }});
                if(pedidos_envio.length == 0){
                    await Pedido_envio.findByIdAndUpdate({_id: data.pedido_envio},{
                            estado: 'Finalizado'
                    })
                }
             }

            res.status(200).send({data:ingreso});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined,message:error});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_ingresos = async function(req,res){
    if(req.user){
        const page = parseInt(req.params['page']) || 1; // Página predeterminada

        let ingresos = await Ingreso.find()
        .sort({createdAt:-1})
        .limit(page);

        let ingresos_todos = await Ingreso.find();

        res.status(200).send({data:ingresos,todos:ingresos_todos.length});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_ingreso = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let pedido;
            let ingreso = await Ingreso.findById({_id:id}).populate('colaborador');

            let detalles = await Ingreso_detalle.find({ingreso:id}).populate('producto').populate('producto_variacion').populate('ingreso');
            if(ingreso.pedido){
                pedido = await Pedido_detalle.findById({_id:ingreso.pedido_detalle._id}).populate('producto').populate('producto_variacion').populate({
                    path: 'pedido',
                    populate: {
                        path: 'proveedor'
                    }
                });
            }

            res.status(200).send({data:true,ingreso,detalles,pedido});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const send_email_pedido = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let email = req.params['email'];
           
            send_email_invoice(id,email);

            res.status(200).send({data:true});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const eliminar_rollo_interno = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let rollo = await Ingreso_detalle.findByIdAndUpdate({_id:id},{estado:false,eliminacion:true});
            res.status(200).send({data:rollo});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const send_email_programacion = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let proveedor = req.params['proveedor'];
            let email = req.params['email'];
           
            send_email_programacion_invoice(id,proveedor,email);

            res.status(200).send({data:true});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}



const get_detalle_ingreso_by_color = async function(req,res){
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


            var detalle_pendiente = await Venta_detalle.find({producto_variacion:id,tipo_detalle:'En almacen'}).populate('ingreso_detalle').populate('venta');

            for(var item of detalles){
                var venta_detalle;
                let rollos_venta = detalle_pendiente.filter(subitem=>subitem.ingreso_detalle.codigo == item.codigo && subitem.venta.estado == 'Procesado');
                let apartado;
                if(rollos_venta.length == 0){
                    apartado = false;
                }else{
                    apartado = true;
                    venta_detalle = await Venta_detalle.findOne({ingreso_detalle:item._id}).populate('venta');
                }
                rollos.push({
                    _id: item._id,
                    colaborador: item.colaborador,
                    ingreso: item.ingreso,
                    producto: item.producto,
                    producto_variacion: item.producto_variacion,
                    codigo:item.codigo,
                    peso: item.peso,
                    cantidad: item.cantidad,
                    day: item.day,
                    month: item.month,
                    year: item.year,
                    estado: item.estado,
                    eliminacion: item.eliminacion,
                    createdAt: item.createdAt,
                    apartado: apartado,
                    venta_detalle: venta_detalle
                });
            }

            

            res.status(200).send({data:true,detalles:rollos,variacion});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}




const get_detalle_ingreso_by_variacion = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];

            let variacion = await Ropa_variacion.findById({_id:id});
            var ropas = [];
            let detalles = await Ingreso_detalle.find({ropa_variacion:id, estado: true}).sort({cantidad:1})
            .populate('ingreso')
            .populate('pedido')
            .populate('pedido_detalle')
            .populate('producto')
            ;

            var detalle_pendiente = await Venta_detalle.find({ropa_variacion:id,}).populate('ingreso_detalle').populate('venta');

            for(var item of detalles){
                var venta_detalle;
                let ropas_venta = detalle_pendiente.filter(subitem=>subitem.ingreso_detalle.codigo == item.codigo && subitem.venta.estado == 'Procesado');
                let apartado;
                if(ropas_venta.length == 0){
                    apartado = false;
                }else{
                    apartado = true;
                    venta_detalle = await Venta_detalle.findOne({ingreso_detalle:item._id}).populate('venta');
                }
                ropas.push({
                    _id: item._id,
                    colaborador: item.colaborador,
                    ingreso: item.ingreso,
                    producto: item.producto,
                    ropa_variacion: item.ropa_variacion,
                    codigo:item.codigo,
                    peso: item.peso,
                    cantidad: item.cantidad,
                    day: item.day,
                    month: item.month,
                    year: item.year,
                    estado: item.estado,
                    eliminacion: item.eliminacion,
                    createdAt: item.createdAt,
                    apartado: apartado,
                    venta_detalle: venta_detalle
                });
            }
           
            res.status(200).send({data:true,detalles:ropas,variacion});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
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
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'diegoarca02@gmail.com',
            pass: 'ogfvvlxksebtrkfj'
        }
    }));


    readHTMLFile(process.cwd() + '/mails/email-invoice-proveedor.html', async (err, html)=>{
    
        let pedido = await Pedido.findById({_id:id}).populate('proveedor').populate('colaborador');
        let detalles = await Pedido_detalle.find({pedido:id}).populate('pedido').populate('producto').populate('producto_color');

        let rest_html = ejs.render(html, {pedido:pedido,detalles:detalles});

        var template = handlebars.compile(rest_html);
        var htmlToSend = template({op:true});

        var mailOptions = {
            from: '"Magno" <diegoarca02@gmail.com>',
            to: email,
            subject: 'Orden de pedido.',
            html: htmlToSend
        };
      
        transporter.sendMail(mailOptions, async function(error, info){
            if (!error) {
            }else{
                console.log(error);
            }
        });
    
    });
}

const send_email_programacion_invoice = async function(id,proveedor,email){

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
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'diegoarca02@gmail.com',
            pass: 'ogfvvlxksebtrkfj'
        }
    }));


    readHTMLFile(process.cwd() + '/mails/email-invoice-proveedor.html', async (err, html)=>{
    
        let pedido = await Pedido.findById({_id:id}).populate('proveedor').populate('colaborador');
        let detalles = await Pedido_detalle.find({pedido:id,proveedor:proveedor}).populate('pedido').populate('producto').populate('producto_color');

        let rest_html = ejs.render(html, {pedido:pedido,detalles:detalles});

        var template = handlebars.compile(rest_html);
        var htmlToSend = template({op:true});

        var mailOptions = {
            from: '"Magno" <diegoarca02@gmail.com>',
            to: email,
            subject: 'Orden de pedido.',
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

const validar_variacion  = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let variacion = await Ropa_variacion.findById({_id:id});
            res.status(200).send({data:variacion});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const validar_color  = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let producto = await Producto_color.findById({_id:id});
            res.status(200).send({data:producto});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const rollos_historico = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let periodo = req.params['periodo'];
            let str_periodo = periodo.split('-');
            var firstDay = new Date(str_periodo[0], str_periodo[1]-1, 1);
            var lastDay = new Date(str_periodo[0], str_periodo[1], 0);

            var str_inicio = moment(firstDay).format('YYYY-MM-DD');
            var str_fin = moment(lastDay).format('YYYY-MM-DD');

            let producto = await Producto_color.findById({_id:id});

            var detalle_pendiente = await Ingreso_detalle.find({producto_color:id,createdAt: {
                $gte: new Date(str_inicio+'T00:00:00'),
                $lt: new Date(str_fin+'T23:59:59')
            }}).populate({
                path: 'venta_detalle',
                populate: {
                    path: 'venta'
                }
            }).populate({
                path: 'venta_detalle',
                populate: {
                    path: 'colaborador'
                }
            }).populate({
                path: 'venta_detalle',
                populate: {
                    path: 'venta',
                    populate: {
                        path: 'cliente'
                    }
                }
            }).populate({
                path: 'venta_detalle',
                populate: {
                    path: 'venta',
                    populate: {
                        path: 'empresa_rs'
                    }
                }
            }).populate({
                path: 'ingreso',
                populate: {
                    path: 'colaborador'
                }
            });


            res.status(200).send({data:detalle_pendiente});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const variaciones_historico = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let periodo = req.params['periodo'];
            let str_periodo = periodo.split('-');
            var firstDay = new Date(str_periodo[0], str_periodo[1]-1, 1);
            var lastDay = new Date(str_periodo[0], str_periodo[1], 0);

            var str_inicio = moment(firstDay).format('YYYY-MM-DD');
            var str_fin = moment(lastDay).format('YYYY-MM-DD');

   
            let producto = await Producto_color.findById({_id:id});

            var detalle_pendiente = await Ingreso_detalle.find({ropa_variacion:id,createdAt: {
                $gte: new Date(str_inicio+'T00:00:00'),
                $lt: new Date(str_fin+'T23:59:59')
            }}).populate({
                path: 'venta_detalle',
                populate: {
                    path: 'venta'
                }
            }).populate({
                path: 'venta_detalle',
                populate: {
                    path: 'colaborador'
                }
            }).populate({
                path: 'venta_detalle',
                populate: {
                    path: 'venta',
                    populate: {
                        path: 'cliente'
                    }
                }
            }).populate({
                path: 'venta_detalle',
                populate: {
                    path: 'venta',
                    populate: {
                        path: 'empresa_rs'
                    }
                }
            }).populate({
                path: 'ingreso',
                populate: {
                    path: 'colaborador'
                }
            });

            res.status(200).send({data:detalle_pendiente});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const rollos_general = async function(req,res){
    if(req.user){
        try {
            let periodo = req.params['periodo'];
            let str_periodo = periodo.split('-');
            var firstDay = new Date(str_periodo[0], str_periodo[1]-1, 1);
            var lastDay = new Date(str_periodo[0], str_periodo[1], 0);

            var str_inicio = moment(firstDay).format('YYYY-MM-DD');
            var str_fin = moment(lastDay).format('YYYY-MM-DD');

            var rollos = [];

            let colores = await Producto_color.find();
            for(var item of colores){
                var detalle_pendiente = await Ingreso_detalle.find({producto_color:item._id,createdAt: {
                    $gte: new Date(str_inicio+'T00:00:00'),
                    $lt: new Date(str_fin+'T23:59:59')
                }}).populate('producto').populate('producto_color').populate({
                    path: 'venta_detalle',
                    populate: {
                        path: 'venta'
                    }
                }).populate({
                    path: 'venta_detalle',
                    populate: {
                        path: 'colaborador'
                    }
                }).populate({
                    path: 'venta_detalle',
                    populate: {
                        path: 'venta',
                        populate: {
                            path: 'cliente'
                        }
                    }
                }).populate({
                    path: 'venta_detalle',
                    populate: {
                        path: 'venta',
                        populate: {
                            path: 'empresa_rs'
                        }
                    }
                }).populate({
                    path: 'ingreso',
                    populate: {
                        path: 'colaborador'
                    }
                });

             

                if(detalle_pendiente.length >= 1){
                    for(var subitem of detalle_pendiente){
                        rollos.push(subitem);
                    }
                }
            }


            res.status(200).send({data:rollos});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const set_confirmacion_pedido = async function(req,res){
    if(req.user){

        let data = req.body;

        let pedido = await Pedido_detalle.findByIdAndUpdate({_id:data.pedido_detalle},{
            estado: 'Aprobado',
        });

        res.status(200).send({data:pedido});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const set_cancelar_pedido = async function(req,res){
    if(req.user){

        let data = req.body;
        console.log(data);
        let pedido = await Pedido_detalle.findByIdAndUpdate({_id:data.pedido_detalle},{
            estado: 'Cancelado',
        });

        res.status(200).send({data:pedido});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const set_proveedor_pedido = async function(req,res){
    if(req.user){

        let data = req.body;
        console.log(data);
        
        let pedido = await Pedido_detalle.findByIdAndUpdate({_id:data.pedido_detalle},{
            proveedor: data.proveedor,
        });

        res.status(200).send({data:pedido});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const set_confirmacion_pedidos = async function(req,res){
    if(req.user){

        let data = req.body;

        for(var item of data.pedidos_aprobacion){
            await Pedido_detalle.findByIdAndUpdate({_id:item},{
                estado: 'Aprobado',
            });
        }

        await Pedido.findByIdAndUpdate({_id:data.pedido},{
            estado: 'Aprobado',
        });

        res.status(200).send({data:true});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const set_cancelar_pedidos = async function(req,res){
    if(req.user){

        let data = req.body;
        for(var item of data){
            await Pedido_detalle.findByIdAndUpdate({_id:item},{
                estado: 'Cancelado',
            });
        }

        res.status(200).send({data:true});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const aprobar_pago = async (id,user)=>{
    try {
        let pago_completo = await Pago_completo.findOne({venta:id,tipo_pago:'Programación',estado:'Aprobado'}).populate('cliente');
        console.log('PAGO COMPLETO');
        console.log(pago_completo);
        if(pago_completo){
            var total = 0;
            var deuda = 0;
            if(pago_completo.tipo_usuario == 'Cliente natural'){
                var ventas_usuario = await Venta.find({cliente:pago_completo.cliente,pago: 'Pendiente'});
                for(var subitem of ventas_usuario){
                    if(subitem.estado != 'Cancelado'){
                        total = total + (subitem.monto_total-subitem.descuento);
                        let pago_venta = 0; //Pago actual de venta
                        let deuda_venta = 0;
                        let pagos = await Pago.find({venta:subitem._id});
                        for(var pg of pagos){
                            pago_venta = pago_venta + pg.monto;
                        }

                        deuda_venta = (subitem.monto_total-subitem.descuento) - pago_venta;
                        deuda = deuda + deuda_venta;
                    }
                }
            }

            var monto_restante = pago_completo.monto;
            
            var venta_pagos = [];
            let subtotal_precio = 0;
            let n_detalles = 0;
            let ventas = [];
            var response_fact = {};
            ///
            if(pago_completo.tipo_usuario == "Cliente natural"){
                ventas = await Venta.find({cliente:pago_completo.cliente,pago:"Pendiente"}).sort({createdAt:1});
            }else{
                ventas = await Venta.find({empresa_rs:pago_completo.empresa_rs,pago:"Pendiente"}).sort({createdAt:1});
            }

            for(var item of ventas){
                let dventas = await Venta_detalle.find({venta:item._id}).populate('producto').populate('producto_variacion');
                n_detalles = dventas.length;
                console.log("N DETALLES " + dventas.length);
                for(var subitem of dventas){
                    subtotal_precio = subtotal_precio + subitem.precio;
                }
            
                let pagos_venta = await Pago.find({venta:item._id,estado:'Aprobado'});
                let monto_pagado = 0;
                for(var subitem of pagos_venta){
                    monto_pagado = monto_pagado + subitem.monto;
                }   
                /* monto_pagado = 2400; */
            
                let inicio = moment(item.createdAt);
                let fin = moment(new Date());
            
                let total_venta = 0; //TOTAL DE CADA VENTA A PAGAR
                let hours_despues = fin.diff(inicio,'hours'); //CALCULO DE HORAS DESDE LA COMPRA HASTA LA FECHA ACTUAL EN MINUTOS
                let descuento_porcent = 0; //PORCENTAJE DE DESCUENTO
                let decuento_monto = 0; //MONTO DE DESCUENTO
            
                if(hours_despues <= 120){
                    descuento_porcent = 6;
                }else if(hours_despues >= 121 && hours_despues <= 360){
                    descuento_porcent = 5;
                }else{
                    descuento_porcent = 0;
                }
            
                decuento_monto = ((item.monto_total*descuento_porcent)/100).toFixed(2);
                /* total_venta = (item.monto_total - decuento_monto) - monto_pagado;  */
                if((item.monto_total - monto_pagado)>decuento_monto){//10000-9500 = 500 - 600
                    total_venta = (item.monto_total - monto_pagado) - decuento_monto; //Monto deuda 
                }else{
                    total_venta = (item.monto_total - monto_pagado); //Monto deuda
                }

                if(monto_restante >= 1){
                    
                    if(total_venta > monto_restante){
                        venta_pagos.push({
                            venta: item._id,
                            monto: monto_restante,
                            colaborador : user,
                            year : new Date().getFullYear(),
                            month : new Date().getMonth() +1,
                            day : new Date().getDate(),
                            exp : new Date(moment(new Date()).add(10,'days').format('YYYY-MM-DD')),
                        });
            
                        monto_restante = monto_restante - monto_restante;
                    }else{
                        venta_pagos.push({
                            venta: item._id,
                            monto: total_venta,
                            colaborador : user,
                            year : new Date().getFullYear(),
                            month : new Date().getMonth() +1,
                            day : new Date().getDate(),
                            exp : new Date(moment(new Date()).add(10,'days').format('YYYY-MM-DD')),
                        });
            
                        monto_restante = monto_restante - total_venta;
                    }   
            
                    await Venta.findByIdAndUpdate({_id:item._id},{
                        descuento: decuento_monto,
                    });
                }
                
            }

            for(var item of venta_pagos){
                let last_venta = await Pago.find().sort({serie:-1});
                let new_serie = 0;
                if(last_venta.length>=1){
                    new_serie = last_venta[0].serie + 1;
                }else{
                    new_serie = 1;
                }
            
                if(pago_completo.tipo_usuario == 'Empresa'){
                    item.empresa_rs = pago_completo.empresa_rs;
                    item.empresa = pago_completo.empresa;
                }else{
                    item.cliente = pago_completo.cliente;
                }
            
                item.tipo_usuario = pago_completo.tipo_usuario;
                item.metodo = pago_completo.metodo;
                item.serie = new_serie;
                item.automatico = false;
            
                item.pago_completo = pago_completo._id;
                item.estado = 'Aprobado',
                item.aprobacion = Date.now();
                await Pago.create(item);
                validar_deuda_venta(item.venta);
            }

            await Pago_completo.findByIdAndUpdate({_id:id},{
                estado: 'Aprobado',
                aprobacion: Date.now()
            });

            if(monto_restante>= 1){
                if(pago_completo.tipo_usuario == 'Cliente natural'){
                    await Cliente.findByIdAndUpdate({_id: pago_completo.cliente},{
                        saldo_favor: monto_restante
                    });
                }
            }
            
            /* if(pago_completo.tipo_usuario == 'Cliente natural'){
                if(pago_completo.cliente.email){
                    send_email_invoice(pago_completo._id,pago_completo.cliente.email)
                }
            } */

            return true;
        }else{
            return false;
        }
    } catch (error) {   
        console.log(error);
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

module.exports = {
    create_pedido,
    create_pedido_ropa,
    get_pedidos,
    get_pedido,
    get_pedido_public,
    update_estado_pedido,
    get_detalle_pedido,
    obtener_pedidos_detalles_aprobados,
    create_envio_detalle,
    verify_envio,
    get_file,
    create_envio_pedido,
    get_pedido_serie,
    get_envios_pedido,
    get_envio_pedido,
    get_pedido_serie_ropa,
    create_ingreso,
    get_ingresos,
    get_ingreso,
    get_detalle_ingreso_by_color,
    get_detalle_ingreso_by_variacion,
    send_email_pedido,
    send_email_programacion,
    eliminar_rollo_interno,
    rollos_historico,
    variaciones_historico,
    validar_color,
    validar_variacion,
    rollos_general,
    set_confirmacion_pedido,
    set_cancelar_pedido,
    set_proveedor_pedido,
    set_confirmacion_pedidos,
    set_cancelar_pedidos,
}