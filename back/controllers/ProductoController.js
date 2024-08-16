var Producto = require('../models/Producto');
var Producto_titulo = require('../models/Producto_titulo');
var Producto_imagen = require('../models/Producto_imagen');
var Producto_color = require('../models/Producto_color');
var Producto_variacion = require('../models/Producto_variacion');
var Producto_composicion = require('../models/Producto_composicion');
var Programacion_detalle = require('../models/Programacion_detalle');
var Ingreso_detalle = require('../models/Ingreso_detalle');
var Color = require('../models/Color');
var Ingreso = require('../models/Ingreso');
var Pedido_detalle = require('../models/Pedido_detalle');
var Cupon = require('../models/Cupon');
var Producto_etiqueta = require('../models/Producto_etiqueta');
var Ropa_variacion = require('../models/Ropa_variacion');

var fs = require('fs');
var path = require('path');
const Venta_detalle = require('../models/Venta_detalle');
const { log } = require('console');
var bcrypt = require('bcrypt-nodejs');
const Color_etiqueta = require('../models/Color_etiqueta');


const create_producto = async function(req,res){
    if(req.user){
        try {
            let data = req.body;
            data.portada = req.files[0].location;
            data.codigo = 'T'+data.categoria.substr(0,1).toUpperCase()+''+data.subcategoria.substr(0,2).toUpperCase()+'-'+getRandomArbitrary(10000,99999)

            let producto = await Producto.create(data);


            if(JSON.parse(data.composiciones).length >= 1){
                for(var item of JSON.parse(data.composiciones)){
                    item.producto = producto._id;
                    await Producto_composicion.create(item);
                }
            }

            if(JSON.parse(data.titulos).length >= 1){
                for(var item of JSON.parse(data.titulos)){
                    item.producto = producto._id;
                    await Producto_titulo.create(item);
                }
            }

            if(JSON.parse(data.variaciones).length >= 1){
                for(var item of JSON.parse(data.variaciones)){
                    item.tipo = producto.tipo;
                    item.producto = producto._id;
                    item.sku = producto.tipo.substr(0,3).toUpperCase()+producto.categoria.substr(0,3).toUpperCase()+item.variacion_name.substr(0,3).toUpperCase();
                    await Producto_variacion.create(item);
                }
    
            }

            if(data.galeria){
                if(JSON.parse(data.galeria).length >= 1){
                    var i = 0;
                    for(var item of JSON.parse(data.galeria)){
                        if(i >= 1){
                            item.producto = producto._id;
                            item.imagen = req.files[i].location;
                            await Producto_imagen.create(item);
                         
                        }
                        i++;
                    }
                }
            }

            res.status(200).send({data:producto});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined,message: 'Ocurrió un error inesperado.'});
        }

    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const create_ropa = async function(req,res){
    if(req.user){
        try {
            let data = req.body;

            var img_path = req.files.portada.path;
            var str_path = img_path.split('\\');
            var name = str_path[2];
            data.portada = name;
            console.log(data);
            data.codigo = 'R'+data.categoria.substr(0,1).toUpperCase()+''+data.subcategoria.substr(0,2).toUpperCase()+'-'+getRandomArbitrary(10000,99999)

            let producto = await Producto.create(data);

            if(JSON.parse(data.composiciones).length >= 1){
                for(var item of JSON.parse(data.composiciones)){
                    item.producto = producto._id;
                    await Producto_composicion.create(item);
                }
            }

            if(JSON.parse(data.titulos).length >= 1){
                for(var item of JSON.parse(data.titulos)){
                    item.producto = producto._id;
                    await Producto_titulo.create(item);
                }
            }

            if(JSON.parse(data.etiquetas).length >= 1){
                for(var item of JSON.parse(data.etiquetas)){
                    item.producto = producto._id;
                    await Producto_etiqueta.create(item);
                }
            }
            

            if(JSON.parse(data.variaciones).length >= 1){
                for(var item of JSON.parse(data.variaciones)){
                    item.producto = producto._id;
                    item.sku = producto.tipo.substr(0,3).toUpperCase()+producto.categoria.substr(0,3).toUpperCase()+producto.subcategoria.substr(0,3).toUpperCase()+item.talla.substr(0,3).toUpperCase()+'-'+item.color.substr(0,3).toUpperCase();
                    await Ropa_variacion.create(item);
                }
    
            }
            if(data.galeria){
                if(JSON.parse(data.galeria).length >= 1){
                    var i  = 0;
                    for(var item of JSON.parse(data.galeria)){
                        let img_path = req.files.files[i].path;
                        let str_path = img_path.split('\\');
                        let name = str_path[2];
                        item.producto = producto._id;
                        item.imagen = name;
                        await Producto_imagen.create(item);
                        i++;
                    }
                }
            }
            res.status(200).send({data:producto});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined,message: 'Ocurrió un error inesperado.'});
        }

    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}


const importar_productos = async function(req,res){
    if(req.user){
        let data = req.body;
        console.log(data.productos);
        let productos = JSON.parse(data.productos);

        for(var item of productos){
            let producto_exist = await Producto.find({titulo:item.titulo});

            if(producto_exist.length == 0){
                item.portada = 'defecto.jpg';
                item.codigo = 'T'+item.categoria.substr(0,1).toUpperCase()+''+item.subcategoria.substr(0,2).toUpperCase()+'-'+getRandomArbitrary(10000,99999);
                await Producto.create(item);
            }
        }
        res.status(200).send({data:true});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const importar_colores = async function(req,res){
    if(req.user){
        let data = req.body;
        let colores = JSON.parse(data.colores);
        let producto = await Producto.findById({_id:data.producto});

        console.log(colores);

        for(var item of colores){
            let color_data = await Color.find({color: item.color});
            console.log(color_data.length + ' - '+item.color);
            if(color_data.length == 0){
                item.password = "$2a$10$3HpMeHprXZIdiG0ByMcOsesX.UMXdyn6gih3VVMT0u7DqY2u/Aj9C";
                item.primario = false;
                var color = await Color.create(item);

                //AGREGAR COLOR A PRODUCTO
                let color_producto = {}; 
                color_producto.sku = producto.tipo.substr(0,3).toUpperCase()+producto.categoria.substr(0,3).toUpperCase()+producto.subcategoria.substr(0,3).toUpperCase()+item.color.substr(0,3).toUpperCase();
                color_producto.variante = item.color;
                color_producto.hxd = item.hxd;
                color_producto.color = color._id;
                color_producto.producto = data.producto;
                await Producto_color.create(color_producto);
                console.log('Nuevo');
            }else{
               let producto_color_exist = await Producto_color.find({producto:data.producto,variante: item.color});

               if(producto_color_exist.length == 0){
                    let color_exist = await Color.findOne({color: item.color});

                    //AGREGAR COLOR A PRODUCTO
                    let color_producto = {}; 
                    color_producto.sku = producto.tipo.substr(0,3).toUpperCase()+producto.categoria.substr(0,3).toUpperCase()+producto.subcategoria.substr(0,3).toUpperCase()+item.color.substr(0,3).toUpperCase();
                    color_producto.variante = item.color;
                    color_producto.hxd = item.hxd;
                    color_producto.color = color_exist._id;
                    color_producto.producto = data.producto;
                    await Producto_color.create(color_producto);
                    console.log('Existente');
               }
            }
        }
        res.status(200).send({data:true});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_productos = async function(req,res){
    if(req.user){
        const filtro = req.params['filtro'];
        const page = parseInt(req.params['page']) || 1; // Página predeterminada
        const query = filtro === 'Todos' ? {} : {
            $or: [
                { titulo: new RegExp(filtro, 'i') },
                { descripcion: new RegExp(filtro, 'i') }
            ]
        };

        const data = [];
        let productos_todos = await Producto.find();
        const productos = await Producto.find({ ...query, estado: 'Publicado' })
        .sort({ createdAt: -1 })
        .limit(page);

        for (const item of productos) {
            let precio_status = 0;
            const variaciones = await Producto_variacion.find({ producto: item._id, delete: false })
            .populate('producto').sort({ createdAt: -1 });
            const etiquetas = await Producto_etiqueta.find({ producto: item._id })
            .populate('producto');
            let total_prioridad = 0;

            for (const subitem of variaciones) {
                if (subitem.precio_venta === 0) precio_status++;
            }
            for (const subitem of etiquetas) {
                total_prioridad += subitem.prioridad;
            }
            const programaciones = await Programacion_detalle.find({ producto: item._id, estado: 'Confirmado' });

            data.push({
                producto: item,
                variaciones: variaciones,
                etiquetas: etiquetas,
                total_prioridad: total_prioridad,
                precio_status,
                programaciones: programaciones.length
            });
        }

        data.sort((a, b) => b.total_prioridad - a.total_prioridad);
        res.status(200).send({ data , todos: productos_todos.length });
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const get_productos_papelera = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        if(filtro == 'Todos'){
            let data = [];
            let productos = await Producto.find({estado:'Borrador'}).sort({createdAt:-1});
            for(var item of productos){
                let precio_status = 0;
                let variaciones = await Producto_variacion.find({producto:item._id,delete:false}).populate('producto');
                let etiquetas = await Producto_etiqueta.find({producto:item._id}).populate('producto');
                let total_prioridad = 0;
                for(var subitem of variaciones){
                    if(subitem.precio_venta == 0) precio_status++;
                }
                for(var subitem of etiquetas){
                    total_prioridad = total_prioridad + subitem.prioridad;
                }

                data.push({
                    producto: item,
                    variaciones: variaciones,
                    etiquetas: etiquetas,
                    total_prioridad: total_prioridad,
                    precio_status
                });
            }
            data.sort((a, b) => b.total_prioridad - a.total_prioridad);

            res.status(200).send({data:data});
        }else{
            let data = [];
            let productos = await Producto.find({
                $or: [
                    {titulo: new RegExp(filtro,'i')},
                    {descripcion: new RegExp(filtro,'i')}
                ],
                estado:'Borrador'
            });

            for(var item of productos){
                let precio_status = 0;
                let variaciones = await Producto_variacion.find({producto:item._id})
                .populate('producto').sort({createdAt:-1});
                let etiquetas = await Producto_etiqueta.find({producto:item._id}).populate('producto');
                let total_prioridad = 0;
                for(var subitem of variaciones){
                    if(subitem.precio_venta == 0) precio_status++;
                }
                for(var subitem of etiquetas){
                    total_prioridad = total_prioridad + subitem.prioridad;
                }

                data.push({
                    producto: item,
                    variaciones: variaciones,
                    etiquetas: etiquetas,
                    total_prioridad: total_prioridad,
                    precio_status
                });
            }
            data.sort((a, b) => b.total_prioridad - a.total_prioridad);
            res.status(200).send({data:data});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const get_ropas = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        if(filtro == 'Todos'){
            let data = [];
            let productos = await Producto.find({tipo:'Ropa'}).sort({createdAt:-1});
            for(var item of productos){
                let precio_status = 0;
                let variaciones = await Ropa_variacion.find({producto:item._id}).populate('producto');

                for(var subitem of variaciones){
                    if(subitem.precio_venta == 0) precio_status++;
                }

                data.push({
                    producto: item,
                    variaciones: variaciones,
                    precio_status
                });
            }

            

            res.status(200).send({data:data});
        }else{
            let data = [];
            let productos = await Producto.find({
                $or: [
                    {titulo: new RegExp(filtro,'i')},
                    {descripcion: new RegExp(filtro,'i')}
                ],
                tipo:'Ropa'
            });

            for(var item of productos){
                let precio_status = 0;
                let variaciones = await Ropa_variacion.find({producto:item._id}).populate('producto').sort({createdAt:-1});

                for(var subitem of variaciones){
                    if(subitem.precio_venta == 0) precio_status++;
                }

                data.push({
                    producto: item,
                    variaciones: variaciones,
                    precio_status
                });
               
            }

            res.status(200).send({data:data});
        }

        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const get_productos_programaciones = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        if(filtro == 'Todos'){
            let data = [];
            let productos = await Producto.find({estado:'Publicado',tipo:'Tela'}).sort({createdAt:-1});
           
            for(var item of productos){
                let colores = await Producto_color.find({producto:item._id}).populate('producto')
 
                let p_pendientes = await Pedido_programacion.find({producto: item._id,estado:'Pendiente'});
                let p_realizados = await Pedido_programacion.find({producto: item._id,estado:'Realizado'});
                let p_finalizados = await Pedido_programacion.find({producto: item._id,estado:'Finalizado'});

                let total_pendiente = 0;
                let total_realizado = 0;
                let total_finalizado = 0;

                console.log(p_pendientes);

                for(var subitem of p_pendientes){
                    if(subitem.unidad == 'Yrd'){
                        total_pendiente = total_pendiente + subitem.cantidad;
                    }else{
                        total_pendiente = total_pendiente + (subitem.cantidad*1.09361);
                    }
                }
                for(var subitem of p_realizados){
                    if(subitem.unidad == 'Yrd'){
                        total_realizado = total_realizado + subitem.cantidad;
                    }else{
                        total_realizado = total_realizado + (subitem.cantidad*1.09361);
                    }
                }
                for(var subitem of p_finalizados){
                    if(subitem.unidad == 'Yrd'){
                        total_finalizado = total_finalizado + subitem.cantidad;
                    }else{
                        total_finalizado = total_finalizado + (subitem.cantidad*1.09361);
                    }
                }

                data.push({
                    tipo: item.tipo,
                    producto: item,
                    colores: colores,
                    p_pendientes: p_pendientes.length,
                    p_realizados: p_realizados.length,
                    p_finalizados: p_finalizados.length,
                    total_pendiente,
                    total_realizado,
                    total_finalizado
                });
            }

            res.status(200).send({data:data});
        }else{
            let data = [];
            let productos = await Producto.find({
                $or: [
                    {titulo: new RegExp(filtro,'i')},
                    {descripcion: new RegExp(filtro,'i')}
                ],tipo:'Tela'
            });

            let programaciones = await Pedido_programacion.find().populate('empresa_rs').populate('cliente').populate('producto_color').populate('producto');

            for(var item of productos){
                let colores = await Producto_color.find({producto:item._id}).populate('producto').sort({createdAt:-1});
                let p_pendientes = await Pedido_programacion.find({producto: item._id,estado:'Pendiente'});
                let p_realizados = await Pedido_programacion.find({producto: item._id,estado:'Realizado'});
                let p_finalizados = await Pedido_programacion.find({producto: item._id,estado:'Finalizado'});

                let total_pendiente = 0;
                let total_realizado = 0;
                let total_finalizado = 0;
                for(var subitem of p_pendientes){
                    if(subitem.unidad == 'Yrd'){
                        total_pendiente = total_pendiente + subitem.cantidad;
                    }else{
                        total_pendiente = total_pendiente + (subitem.cantidad*1.09361);
                    }
                }
                for(var subitem of p_realizados){
                    if(subitem.unidad == 'Yrd'){
                        total_realizado = total_realizado + subitem.cantidad;
                    }else{
                        total_realizado = total_realizado + (subitem.cantidad*1.09361);
                    }
                }
                for(var subitem of p_finalizados){
                    if(subitem.unidad == 'Yrd'){
                        total_finalizado = total_finalizado + subitem.cantidad;
                    }else{
                        total_finalizado = total_finalizado + (subitem.cantidad*1.09361);
                    }
                }

                data.push({
                    producto: item,
                    colores: colores,
                    p_pendientes: p_pendientes.length,
                    p_realizados: p_realizados.length,
                    p_finalizados: p_finalizados.length,
                    total_pendiente,
                    total_realizado,
                    total_finalizado
                });
            }

            res.status(200).send({data:data,programaciones: programaciones,});
        }

        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const get_productos_programaciones_ropas = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        if(filtro == 'Todos'){
            let data = [];
            let productos = await Producto.find({estado:'Publicado',tipo:'Ropa'}).sort({createdAt:-1});
            let programaciones = await Pedido_programacion.find({tipo:'Ropa'}).populate('empresa_rs').populate('cliente').populate('ropa_variacion').populate('producto');
            for(var item of productos){
                let variaciones = await Ropa_variacion.find({producto:item._id}).populate('producto')
 
                let p_pendientes = await Pedido_programacion.find({producto: item._id,estado:'Pendiente'});
                let p_realizados = await Pedido_programacion.find({producto: item._id,estado:'Realizado'});
                let p_finalizados = await Pedido_programacion.find({producto: item._id,estado:'Finalizado'});

                let total_pendiente = 0;
                let total_realizado = 0;
                let total_finalizado = 0;
                for(var subitem of p_pendientes){
                    if(subitem.unidad == 'Yrd'){
                        total_pendiente = total_pendiente + subitem.cantidad;
                    }
                }
                for(var subitem of p_realizados){
                    if(subitem.unidad == 'Yrd'){
                        total_realizado = total_realizado + subitem.cantidad;
                    }
                }
                for(var subitem of p_finalizados){
                    if(subitem.unidad == 'Yrd'){
                        total_finalizado = total_finalizado + subitem.cantidad;
                    }
                }

                data.push({
                    tipo: item.tipo,
                    producto: item,
                    variaciones: variaciones,
                    p_pendientes: p_pendientes.length,
                    p_realizados: p_realizados.length,
                    p_finalizados: p_finalizados.length,
                    total_pendiente,
                    total_realizado,
                    total_finalizado
                });
            }

            res.status(200).send({data:data,programaciones: programaciones,});
        }else{
            let data = [];
            let productos = await Producto.find({
                $or: [
                    {titulo: new RegExp(filtro,'i')},
                    {descripcion: new RegExp(filtro,'i')}
                ],tipo:'Ropa'
            });

            let programaciones = await Pedido_programacion.find().populate('empresa_rs').populate('cliente').populate('ropa_variaciones').populate('producto');

            for(var item of productos){
                let variaciones = await Ropa_variacion.find({producto:item._id}).populate('producto').sort({createdAt:-1});
                let p_pendientes = await Pedido_programacion.find({producto: item._id,estado:'Pendiente'});
                let p_realizados = await Pedido_programacion.find({producto: item._id,estado:'Realizado'});
                let p_finalizados = await Pedido_programacion.find({producto: item._id,estado:'Finalizado'});

                let total_pendiente = 0;
                let total_realizado = 0;
                let total_finalizado = 0;
                for(var subitem of p_pendientes){
                    if(subitem.unidad == 'Yrd'){
                        total_pendiente = total_pendiente + subitem.cantidad;
                    }
                }
                for(var subitem of p_realizados){
                    if(subitem.unidad == 'Yrd'){
                        total_realizado = total_realizado + subitem.cantidad;
                    }
                }
                for(var subitem of p_finalizados){
                    if(subitem.unidad == 'Yrd'){
                        total_finalizado = total_finalizado + subitem.cantidad;
                    }
                }

                data.push({
                    producto: item,
                    variaciones: variaciones,
                    p_pendientes: p_pendientes.length,
                    p_realizados: p_realizados.length,
                    p_finalizados: p_finalizados.length,
                    total_pendiente,
                    total_realizado,
                    total_finalizado
                });
            }

            res.status(200).send({data:data,programaciones: programaciones,});
        }

        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const get_image_producto = async function(req,res){
    var img = req.params['img'];

    fs.stat('./uploads/galeria/'+img, function(err){
        if(!err){
            let path_img = './uploads/galeria/'+img;
            res.status(200).sendFile(path.resolve(path_img));
        }else{
            let path_img = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_img));
        }
    });
}

const get_producto = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let producto = await Producto.findById({_id:id});
            let composiciones = await Producto_composicion.find({producto:id});
            let colores = await Producto_color.find({producto:id});
            let titulos = await Producto_titulo.find({producto:id});
            let etiquetas = await Producto_etiqueta.find({producto:id});
            let images = await Producto_imagen.find({producto:id});
            let variaciones = await Ropa_variacion.find({producto:id});

            res.status(200).send({data:true,producto,composiciones,colores,titulos,images,variaciones,etiquetas});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_ropa_tallas = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let variaciones = await Ropa_variacion.find({producto:id});

            res.status(200).send({data:variaciones});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const update_producto = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;

        let producto = await Producto.find({titulo:data.titulo});

        if(producto.length >= 1){
            if(producto[0]._id == id){
                if(req.files){
                    var img_path = req.files.portada.path;
                    var str_path = img_path.split('\\');
                    var name = str_path[2];
                    
                    data.portada = name;
    
                    let reg = await Producto.findByIdAndUpdate({_id:id},{
                        titulo: data.titulo,
                        tipo: data.tipo,
                        categoria: data.categoria,
                        subcategoria: data.subcategoria,
                        descripcion: data.descripcion,
                        cantidad_contenedor: data.cantidad_contenedor,
                        estado: data.estado,
                        genero: data.genero,
                        portada: data.portada,
                    });
                    res.status(200).send({data:reg});
                }else{
                    let reg = await Producto.findByIdAndUpdate({_id:id},{
                        titulo: data.titulo,
                        tipo: data.tipo,
                        categoria: data.categoria,
                        subcategoria: data.subcategoria,
                        descripcion: data.descripcion,
                        cantidad_contenedor: data.cantidad_contenedor,
                        estado: data.estado,
                        genero: data.genero
                    });
                    res.status(200).send({data:reg});
                }
            }else{
                res.status(200).send({data:undefined,message:'El titulo ya fue asignado a un producto.'});
            }
        }else{
            if(req.files){
                var img_path = req.files.portada.path;
                var str_path = img_path.split('\\');
                var name = str_path[2];
                
                data.portada = name;

                let reg = await Producto.findByIdAndUpdate({_id:id},{
                    titulo: data.titulo,
                    tipo: data.tipo,
                    categoria: data.categoria,
                    subcategoria: data.subcategoria,
                    descripcion: data.descripcion,
                    cantidad_contenedor: data.cantidad_contenedor,
                    estado: data.estado,
                    genero: data.genero,
                    portada: data.portada,
                });
                res.status(200).send({data:reg});
            }else{
                let reg = await Producto.findByIdAndUpdate({_id:id},{
                    titulo: data.titulo,
                    tipo: data.tipo,
                    categoria: data.categoria,
                    subcategoria: data.subcategoria,
                    descripcion: data.descripcion,
                    cantidad_contenedor: data.cantidad_contenedor,
                    estado: data.estado,
                    genero: data.genero
                });
                res.status(200).send({data:reg});
            }
        }

        
       
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const add_composicion = async function(req,res){
    if(req.user){
        let data = req.body;
        
        let composiciones = await Producto_composicion.find({producto:data.producto});
        let total = 0;

        for(var item of composiciones){
            total = total + item.porcentaje;
        }

        let _total = total + data.porcentaje;

        if(_total > 100){
            res.status(200).send({message: 'Las composiciones no deben superar el 100%',data: undefined}); 
        }else{
            let composicion = await Producto_composicion.create(data);
           
            res.status(200).send({data:composicion});
        }
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_producto_composiciones = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        
        let composiciones = await Producto_composicion.find({producto:id});
        res.status(200).send({data:composiciones});
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const delete_composicion = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let producto = await Producto_composicion.findByIdAndRemove({_id:id})
        res.status(200).send({data:producto});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const add_titulo = async function(req,res){
    if(req.user){
        let data = req.body;
        
        let titulo = await Producto_titulo.create(data);
        res.status(200).send({data:titulo});
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const add_etiqueta = async function(req,res){
    if(req.user){
        let data = req.body;
        
        let etiqueta = await Producto_etiqueta.create(data);
        res.status(200).send({data:etiqueta});
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const add_etiqueta_color = async function(req,res){
    if(req.user){
        let data = req.body;
        
        let etiquetas = await Color_etiqueta.find({etiqueta:data.etiqueta, color: data.color});

        if(etiquetas.length == 0){
            let etiqueta = await Color_etiqueta.create(data);
            res.status(200).send({data:etiqueta});
        }else{
            res.status(200).send({data:undefined,message:'La etiqueta ya fue agregada.'});
        }
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const delete_titulo = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let producto = await Producto_titulo.findByIdAndRemove({_id:id})
        res.status(200).send({data:producto});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_producto_titulos = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        
        let titulo = await Producto_titulo.find({producto:id});
        res.status(200).send({data:titulo});
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_producto_etiquetas = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        
        let etiquetas = await Producto_etiqueta.find({producto:id});
        res.status(200).send({data:etiquetas});
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_producto_imagenes = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        
        let imagenes = await Producto_imagen.find({producto:id});
        res.status(200).send({data:imagenes});
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const delete_etiqueta = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let etiqueta = await Producto_etiqueta.findByIdAndRemove({_id:id})
        res.status(200).send({data:etiqueta});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const delete_etiqueta_color = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        console.log(id + ' ssssss');
        let etiqueta = await Color_etiqueta.findByIdAndRemove({_id:id})
        res.status(200).send({data:etiqueta});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}


const add_variacion = async function(req,res){
    if(req.user){
        let data = req.body;
        let producto = await Producto.findById({_id:data.producto});
        data.tipo = producto.tipo;
        data.sku = producto.tipo.substr(0,3).toUpperCase()+producto.categoria.substr(0,3).toUpperCase()+data.variacion_name.substr(0,3).toUpperCase();
        let variacion = await Producto_variacion.create(data);
        res.status(200).send({data:variacion});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const edit_color = async function(req,res){
    if(req.user){
        let data = req.body;
        let id = req.params['id'];
       
        let producto = await Producto_color.findByIdAndUpdate({_id:id},{
            hxd: data.hxd,
            variante: data.variante,
            color: data.color
        });
        
        res.status(200).send({data:producto});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_producto_variaciones = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let variaciones = await Producto_variacion.find({producto:id,delete:false});
        res.status(200).send({data:variaciones});
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_colores_ropas = async function(req,res){
    if(req.user){
        let colores = await Producto_color.find();
        res.status(200).send({data:colores});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const set_estado_variacion = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body
        let nuevo_hidden;
    
        if(data.hidden){
            nuevo_hidden = false;
        }else if(!data.hidden){
            nuevo_hidden = true;
        }

        let producto = await Producto_variacion.findByIdAndUpdate({_id:id},{
            hidden: nuevo_hidden
        })
        res.status(200).send({data:producto});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const add_imagen = async function(req,res){
    if(req.user){
        let data = req.body;
        try {
            data.imagen = req.files[0].location;;
            let reg = await Producto_imagen.create(data);
            res.status(200).send({data:reg});
        } catch (error) {
                console.log(error);
        }
        
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const delete_imagen = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let reg = await Producto_imagen.findByIdAndRemove({_id:id})
        let path_img = './uploads/galeria/'+reg.imagen;
        fs.unlinkSync(path_img);
        res.status(200).send({data:reg});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_productos_filter_advanced = async function(req,res){
    if(req.user){
        let data = req.body;
        
        if(data.estado == 'Todos'){
            data.estado = '';
        }
        
        if(data.tipo == 'Todos'){
            data.tipo = '';
        }
        let productos = await Producto.find({tipo: new RegExp(data.tipo,'i'),estado: new RegExp(data.estado,'i')}).sort({nombres:1}).sort({createdAt:-1});
        

        if(data.color){
            let prod_color = [];
            let reg_prod = [];
            for(var item of productos){
                let reg = await Producto_color.find({producto:item._id,variante:new RegExp(data.color.toUpperCase(),'i')}).populate('producto').sort({createdAt:-1});
                for(var subitem of reg){
                    reg_prod.push(subitem);
                }
                
            }   
            //quitar duplicados
            const seen = new Set();
            prod_color = reg_prod.filter(item => {
                const duplicate = seen.has(item.producto._id);
                seen.add(item.producto._id);
                return !duplicate;
            });
            //obtener solo productos
            productos = [];
            for(var item of prod_color){
                productos.push(item.producto);
            }
        }

        if(data.composiciones.length >=1){
            let prod_compo = [];
            let reg_comp = [];
            for(var item of productos){
                let reg = await Producto_composicion.find({producto:item._id}).populate('producto').sort({createdAt:-1}); 
                
                for(var subitem of data.composiciones){
                    let reg_filter = reg.filter(element=>element.composicion == subitem);
                    for(var subitem of reg_filter){
                        reg_comp.push(subitem);
                    }
                }
            }
            const seen = new Set();
            prod_compo = reg_comp.filter(item => {
                const duplicate = seen.has(item.producto._id);
                seen.add(item.producto._id);
                return !duplicate;
            });
            productos = [];
            for(var item of prod_compo){
                productos.push(item.producto);
            }
        }

        final_products = [];
        for(var item of productos){
            let colores = await Producto_color.find({producto:item._id});
            final_products.push({
                producto: item,
                colores: colores
            });
        }
    



        res.status(200).send({data:final_products});
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const get_productos_cantidades_filter_advanced = async function(req,res){
   
    
}


const get_productos_cantidades = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];

        if(filtro == 'Todos'){
            let data = [];
            let productos = await Producto.find().sort({createdAt:-1});
            for(var item of productos){
                let cantidad_total = 0;
                let precio_status = 0;
                let variaciones = await Producto_variacion.find({producto:item._id}).populate('producto');
                let arr_variaciones = [];
                for(var subitem of variaciones){
                    if(subitem.precio_venta == 0) precio_status++;
                    let reg_variacion = await Ingreso_detalle.aggregate([
                        {
                            $match: { producto_variacion: subitem._id, estado: true } 
                        },
                        {
                          $group: {
                            _id: null,
                            cantidad_total: { $sum: '$cantidad' }
                          }
                        }
                    ]);

                    let reg_variacion_total = await Ingreso_detalle.find({ 
                        producto_variacion: subitem._id, estado: true 
                    });
             
                    let cantidad_total = 0;
                    if(reg_variacion && reg_variacion.length > 0 && reg_variacion[0].cantidad_total !== undefined){
                        cantidad_total = reg_variacion[0].cantidad_total;
                    }

                    arr_variaciones.push({
                        _id: subitem._id,
                        color: subitem.color,
                        color_name: subitem.color_name,
                        hxd: subitem.hxd,
                        producto: subitem.producto,
                        sku: subitem.sku,
                        talla: subitem.talla,
                        tipo: subitem.tipo,
                        estado: subitem.estado,
                        variacion_name: subitem.variacion_name,
                        cantidad_total: cantidad_total,
                        unidades_total: reg_variacion_total.length
                    });
                }
                let reg_variacion_total = await Ingreso_detalle.find({ 
                    producto: item._id, estado: true 
                });

                let detalle_ingreso = await Ingreso_detalle.find({producto:item._id,estado:true});
                detalle_ingreso.forEach(element => {
                    cantidad_total = cantidad_total + element.cantidad;
                });

                let etiquetas = await Producto_etiqueta.find({producto:item._id}).populate('producto');
                let total_prioridad = 0;

                for(var subitem of etiquetas){
                    total_prioridad = total_prioridad + subitem.prioridad;
                }

                data.push({
                    producto: item,
                    variaciones: arr_variaciones,
                    precio_status,
                    cantidad_total: cantidad_total,
                    unidades_total: reg_variacion_total.length,
                    etiquetas: etiquetas,
                    total_prioridad: total_prioridad
                });
            }
            data.sort((a, b) => b.total_prioridad - a.total_prioridad);
            res.status(200).send({data:data});
        }else{
            let data = [];
            let productos = await Producto.find({
                $or: [
                    {titulo: new RegExp(filtro,'i')},
                    {descripcion: new RegExp(filtro,'i')}
                ]
            }).sort({createdAt:-1});;

            for(var item of productos){
                let cantidad_total = 0;
                let precio_status = 0;
                let variaciones = await Producto_variacion.find({producto:item._id}).populate('producto').sort({createdAt:-1});

                let arr_variaciones = [];
                for(var subitem of variaciones){
                    if(subitem.precio_venta == 0) precio_status++;
                    let reg_variacion = await Ingreso_detalle.aggregate([
                        {
                            $match: { producto_variacion: subitem._id, estado: true } 
                        },
                        {
                          $group: {
                            _id: null,
                            cantidad_total: { $sum: '$cantidad' }
                          }
                        }
                    ]);

                    let reg_variacion_total = await Ingreso_detalle.find({ 
                        producto_variacion: subitem._id, estado: true 
                    });
             
                    let cantidad_total = 0;
                    if(reg_variacion && reg_variacion.length > 0 && reg_variacion[0].cantidad_total !== undefined){
                        cantidad_total = reg_variacion[0].cantidad_total;
                    }

                    console.log("cantidad_total " +cantidad_total);

                    arr_variaciones.push({
                        _id: subitem._id,
                        color: subitem.color,
                        color_name: subitem.color_name,
                        hxd: subitem.hxd,
                        producto: subitem.producto,
                        sku: subitem.sku,
                        talla: subitem.talla,
                        tipo: subitem.tipo,
                        estado: subitem.estado,
                        variacion_name: subitem.variacion_name,
                        cantidad_total: cantidad_total,
                        unidades_total: reg_variacion_total.length
                    });

                    if(subitem.precio_venta == 0) precio_status++;
                }

                let reg_variacion_total = await Ingreso_detalle.find({ 
                    producto: item._id, estado: true 
                });

                let detalle_ingreso = await Ingreso_detalle.find({producto:item._id,estado:true});
                detalle_ingreso.forEach(element => {
                    cantidad_total = cantidad_total + element.cantidad
                });

                let etiquetas = await Producto_etiqueta.find({producto:item._id}).populate('producto');
                let total_prioridad = 0;

                for(var subitem of etiquetas){
                    total_prioridad = total_prioridad + subitem.prioridad;
                }

                data.push({
                    producto: item,
                    etiquetas: etiquetas,
                    variaciones: arr_variaciones,
                    precio_status,
                    cantidad_total: cantidad_total,
                    unidades_total: reg_variacion_total.length,
                    total_prioridad: total_prioridad
                });
            }
            data.sort((a, b) => b.total_prioridad - a.total_prioridad);
            res.status(200).send({data:data});
        }

        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const get_ropas_cantidades = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        if(filtro == 'Todos'){
            let data = [];
            let productos = await Producto.find({tipo: 'Ropa'}).sort({createdAt:-1});
            
            
            for(var item of productos){
                var arr_variaciones = [];
                let variaciones = await Ropa_variacion.find({producto:item._id});
                var detalles = await Ingreso_detalle.find({producto: item._id,estado:true}).populate('ingreso');

                for(var sbitem of variaciones){
                    arr_variaciones.push({
                        variacion: sbitem,
                        
                    });
                }

                data.push({
                    producto: item,
                    variaciones: arr_variaciones,
                    ropas_activas : detalles.length
                });
            }

            res.status(200).send({data:data});
        }else{
            let data = [];
         
            let productos = await Producto.find({
                $or: [
                    {titulo: new RegExp(filtro,'i')},
                    {descripcion: new RegExp(filtro,'i')}
                ],
                tipo: 'Ropa'
            });

            for(var item of productos){
                var arr_variaciones = [];
                let variaciones = await Ropa_variacion.find({producto:item._id}).sort({createdAt:-1});
                var detalles = await Ingreso_detalle.find({producto: item._id,estado:true}).populate('ingreso');

                for(var sbitem of variaciones){
                    arr_variaciones.push({
                        variacion: sbitem,
                    });
                }
    
                data.push({
                    producto: item,
                    variaciones: arr_variaciones,
                    ropas_activas : detalles.length
                });
            }

            res.status(200).send({data:data});
        }

        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const update_precio_producto_color = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;

        let variacion = await Producto_variacion.findByIdAndUpdate({_id:id},{precio_venta: data.precio_venta});
        res.status(200).send({data:variacion});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_precio_global_color = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
        let data = req.body;

        console.log(id);
        console.log(data);

        await Producto_variacion.updateMany({producto:id},{precio_venta: data.precio_venta});
        res.status(200).send({data:true});
        } catch (error) {
            console.log(error);
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_valores_producto_color = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;

        let color = await Producto_color.findByIdAndUpdate({_id:id},{yrds_min: data.yrds_min,yrds_max: data.yrds_max});
        res.status(200).send({data:color});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_valores_ropa_variacion = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;

        let variacion = await Ropa_variacion.findByIdAndUpdate({_id:id},{cantidad_min: data.cantidad_min,cantidad_max: data.cantidad_max});
        res.status(200).send({data:variacion});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_productos_ventas_con_precios = async function(req,res){
    if(req.user){
        let tipo = req.params['tipo'];
        let filtro = req.params['filtro'];
        if(filtro == 'Todos'){
            let data = [];
            let productos = await Producto.find({estado:'Publicado',tipo:tipo}).sort({createdAt:-1});
            for(var item of productos){
                let variaciones = await Producto_variacion.find({producto:item._id,delete:false}).populate('producto');
                let variaciones_ = [];
                let future_stock_producto = 0;

                console.log("Variaciones "+variaciones.length);

                for(var item_variacion of variaciones){
                    if(item_variacion.precio_venta>= 1){
                        let reg_detalles = await Ingreso_detalle.find({producto_variacion: item_variacion._id, estado: true}); 
                        
                        var future_stock = 0;
                        var reser_future_stock = 0;
                        var disp_future_stock = 0;
            
                        var pedidos = await Pedido_detalle.find({
                            producto_variacion:item_variacion._id,
                            $or: [{ estado: 'Aprobado' }, { estado: 'Enviado' }]
                        }).populate('programacion_detalle');

                        for(var element of pedidos){
                            //CANTIDAD PEDIDO TOTAL - CANTIDAD DE LA PROGRAMACION
                            let metraje_sobrante = 0;
            
                            if(element.tipo_pedido == 'Programación'){
                                metraje_sobrante = element.cantidad - element.programacion_detalle.cantidad;
                            }else if(element.tipo_pedido == 'Pedido'){
                                metraje_sobrante = element.cantidad;
                            }
            
                            if(metraje_sobrante >= 1){
                                future_stock = future_stock + metraje_sobrante;
                                future_stock_producto = future_stock_producto + metraje_sobrante;
                            }
                        }

                        var d_ventas = await Venta_detalle.find({producto_variacion: item_variacion._id,tipo_detalle:'En camino'}).populate('venta');
                        for(var element of d_ventas){
                            if(element.venta.estado != 'Cancelado'){
                                reser_future_stock = reser_future_stock + parseFloat(element.cantidad);
                            }
                        }
                        var disp_future_stock = future_stock - parseFloat(reser_future_stock);
                        
                        let etiquetas = await Color_etiqueta.find({color:item_variacion.color});
                        variaciones_.push({
                            base: item_variacion.base,
                            hxd: item_variacion.hxd,
                            precio_venta: item_variacion.precio_venta,
                            hidden: item_variacion.hidden,
                            producto: item_variacion.producto,
                            sku: item_variacion.sku,
                            variante: item_variacion.variante,
                            color: item_variacion.color,
                            tipo: item_variacion.tipo,
                            talla: item_variacion.talla,
                            variacion_name: item_variacion.variacion_name,
                            color_name: item_variacion.color_name,
                            _id: item_variacion._id,
                            unidades_activos: reg_detalles.length,
                            future_stock:disp_future_stock,
                            etiquetas
                        });
                    }
                }
                let unidades_almacen = await Ingreso_detalle.find({producto: item._id, estado: true});
                if(variaciones.length >= 1){
                    if(variaciones_.length >= 1){
                        let total_unidades = unidades_almacen.length + future_stock_producto;

                        let etiquetas = await Producto_etiqueta.find({producto:item._id}).populate('producto');
                        let total_prioridad = 0;

                        for(var subitem of etiquetas){
                            total_prioridad = total_prioridad + subitem.prioridad;
                        }

                        let precio_status = 0;

                        for (const subitem of variaciones_) {
                            if (subitem.precio_venta === 0) precio_status++;
                        }

                        data.push({
                            producto: item,
                            etiquetas: etiquetas,
                            variaciones: variaciones_,
                            unidades_activos: unidades_almacen.length ,
                            future_stock_producto: future_stock_producto,
                            total_unidades,
                            precio_status,
                            total_prioridad: total_prioridad,
                        });
                    }
                }
            }
            data.sort((a, b) => b.total_prioridad - a.total_prioridad);
            res.status(200).send({data:data});
        }else{
            let data = [];
            let productos = await Producto.find({
                $or: [
                    {titulo: new RegExp(filtro,'i')},
                    {descripcion: new RegExp(filtro,'i')}
                ],estado:'Publicado',tipo:tipo
            });

            for(var item of productos){
                let variaciones = await Producto_variacion.find({producto:item._id,delete:false}).populate('producto');
                let variaciones_ = [];
                let future_stock_producto = 0;

                console.log("Variaciones "+variaciones.length);

                for(var item_variacion of variaciones){
                    if(item_variacion.precio_venta>= 1){
                        let reg_detalles = await Ingreso_detalle.find({producto_variacion: item_variacion._id, estado: true}); 
                        
                        var future_stock = 0;
                        var reser_future_stock = 0;
                        var disp_future_stock = 0;
            
                        var pedidos = await Pedido_detalle.find({
                            producto_variacion:item_variacion._id,
                            $or: [{ estado: 'Aprobado' }, { estado: 'Enviado' }]
                        }).populate('programacion_detalle');

                        for(var element of pedidos){
                            //CANTIDAD PEDIDO TOTAL - CANTIDAD DE LA PROGRAMACION
                            let metraje_sobrante = 0;
            
                            if(element.tipo_pedido == 'Programación'){
                                metraje_sobrante = element.cantidad - element.programacion_detalle.cantidad;
                            }else if(element.tipo_pedido == 'Pedido'){
                                metraje_sobrante = element.cantidad;
                            }
            
                            if(metraje_sobrante >= 1){
                                future_stock = future_stock + metraje_sobrante;
                                future_stock_producto = future_stock_producto + metraje_sobrante;
                            }
                        }

                        var d_ventas = await Venta_detalle.find({producto_variacion: item_variacion._id,tipo_detalle:'En camino'}).populate('venta');
                        for(var element of d_ventas){
                            if(element.venta.estado != 'Cancelado'){
                                reser_future_stock = reser_future_stock + parseFloat(element.cantidad);
                            }
                        }
                        var disp_future_stock = future_stock - parseFloat(reser_future_stock);
                        let etiquetas = await Color_etiqueta.find({color:item_variacion.color});
                        variaciones_.push({
                            base: item_variacion.base,
                            hxd: item_variacion.hxd,
                            precio_venta: item_variacion.precio_venta,
                            hidden: item_variacion.hidden,
                            producto: item_variacion.producto,
                            sku: item_variacion.sku,
                            variante: item_variacion.variante,
                            color: item_variacion.color,
                            tipo: item_variacion.tipo,
                            talla: item_variacion.talla,
                            variacion_name: item_variacion.variacion_name,
                            color_name: item_variacion.color_name,
                            _id: item_variacion._id,
                            unidades_activos: reg_detalles.length,
                            future_stock:disp_future_stock,
                            etiquetas
                        });
                    }
                }
                let unidades_almacen = await Ingreso_detalle.find({producto: item._id, estado: true});
                if(variaciones.length >= 1){
                    if(variaciones_.length >= 1){

                        let etiquetas = await Producto_etiqueta.find({producto:item._id}).populate('producto');
                        let total_prioridad = 0;
                        let precio_status = 0;

                        for (const subitem of variaciones_) {
                            if (subitem.precio_venta === 0) precio_status++;
                        }

                        for(var subitem of etiquetas){
                            total_prioridad = total_prioridad + subitem.prioridad;
                        }

                        data.push({
                            producto: item,
                            etiquetas: etiquetas,

                            variaciones: variaciones_,
                            unidades_activos: unidades_almacen.length ,
                            future_stock_producto: future_stock_producto,
                            total_prioridad: total_prioridad,
                            precio_status,
                        });
                    }
                }
            }
            data.sort((a, b) => b.total_prioridad - a.total_prioridad);
            res.status(200).send({data:data});
        }

        
    }else{
        res.status(500).send({message: 'NoAccess'});
    } 
}

const get_producto_ventas_con_precios = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        
        let data = {};
        let producto = await Producto.findById({_id:id});

        if(producto){
            let variaciones = await Producto_variacion.find({producto:producto._id,delete:false})
            .populate('producto');
            let variaciones_ = [];
            let future_stock_producto = 0;
    
            console.log("Variaciones "+variaciones.length);

            
            for(var item_variacion of variaciones){
                if(item_variacion.precio_venta>= 1){
                    let reg_detalles = await Ingreso_detalle.find({producto_variacion: item_variacion._id, estado: true}); 
                    
                    var future_stock = 0;
                    var reser_future_stock = 0;
                    var disp_future_stock = 0;
        
                    var pedidos = await Pedido_detalle.find({
                        producto_variacion:item_variacion._id,
                        $or: [{ estado: 'Aprobado' }, { estado: 'Enviado' }]
                    }).populate('programacion_detalle');
    
                    for(var element of pedidos){
                        //CANTIDAD PEDIDO TOTAL - CANTIDAD DE LA PROGRAMACION
                        let metraje_sobrante = 0;
        
                        if(element.tipo_pedido == 'Programación'){
                            metraje_sobrante = element.cantidad - element.programacion_detalle.cantidad;
                        }else if(element.tipo_pedido == 'Pedido'){
                            metraje_sobrante = element.cantidad;
                        }
        
                        if(metraje_sobrante >= 1){
                            future_stock = future_stock + metraje_sobrante;
                            future_stock_producto = future_stock_producto + metraje_sobrante;
                        }
                    }
    
                    var d_ventas = await Venta_detalle.find({producto_variacion: item_variacion._id,tipo_detalle:'En camino'}).populate('venta');
                    for(var element of d_ventas){
                        if(element.venta.estado != 'Cancelado'){
                            reser_future_stock = reser_future_stock + parseFloat(element.cantidad);
                        }
                    }
                    var disp_future_stock = future_stock - parseFloat(reser_future_stock);

                    var etiquetas  = await Color_etiqueta.find({color:item_variacion.color});
                    console.log(etiquetas.length + 'ACA SD');
                    variaciones_.push({
                        base: item_variacion.base,
                        hxd: item_variacion.hxd,
                        precio_venta: item_variacion.precio_venta,
                        hidden: item_variacion.hidden,
                        producto: item_variacion.producto,
                        sku: item_variacion.sku,
                        variante: item_variacion.variante,
                        color: item_variacion.color,
                        tipo: item_variacion.tipo,
                        talla: item_variacion.talla,
                        variacion_name: item_variacion.variacion_name,
                        color_name: item_variacion.color_name,
                        _id: item_variacion._id,
                        unidades_activos: reg_detalles.length,
                        future_stock:disp_future_stock,
                        etiquetas
                    });
                }
            }
            let unidades_almacen = await Ingreso_detalle.find({producto: producto._id, estado: true});
            if(variaciones.length >= 1){
                if(variaciones_.length >= 1){
                    data = {
                        producto: producto,
                        variaciones: variaciones_,
                        unidades_activos: unidades_almacen.length ,
                        future_stock_producto: future_stock_producto
                    }
                }
            }
            res.status(200).send({data:data});
        }else{
            res.status(200).send({data:undefined});
        }

       

        
    }else{
        res.status(500).send({message: 'NoAccess'});
    } 
}

const get_productos_ventas = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        if(filtro == 'Todos'){
            let data = [];
            let productos = await Producto.find({estado:'Publicado',tipo:'Tela'}).sort({createdAt:-1});
            for(var item of productos){
                let colores = await Producto_color.find({producto:item._id}).populate('producto');
                let colores_ = [];
                for(var item_color of colores){
                    let rollos_color = await Ingreso_detalle.find({producto_color: item_color._id, estado: true}); 
                    colores_.push({
                        base: item_color.base,
                        hxd: item_color.hxd,
                        precio_venta: item_color.precio_venta,
                        hidden: item_color.hidden,
                        producto: item_color.producto,
                        sku: item_color.sku,
                        variante: item_color.variante,
                        color: item_color.color,
                        _id: item_color._id,
                        rollos_activos: rollos_color.length
                    });
                }
                let rollos_almacen = await Ingreso_detalle.find({producto: item._id, estado: true});
                if(colores.length >= 1){
                    data.push({
                        producto: item,
                        colores: colores_,
                        rollos_activos: rollos_almacen.length 
                    });
                }
            }

            res.status(200).send({data:data});
        }else{
            let data = [];
            let productos = await Producto.find({
                $or: [
                    {titulo: new RegExp(filtro,'i')},
                    {descripcion: new RegExp(filtro,'i')}
                ],estado:'Publicado',tipo:'Tela'
            });

            for(var item of productos){
                let colores = await Producto_color.find({producto:item._id}).populate('producto').sort({createdAt:-1});
                let colores_ = [];
                for(var item_color of colores){
                    let rollos_color = await Ingreso_detalle.find({producto_color: item_color._id, estado: true}); 
                    colores_.push({
                        base: item_color.base,
                        hxd: item_color.hxd,
                        precio_venta: item_color.precio_venta,
                        hidden: item_color.hidden,
                        producto: item_color.producto,
                        sku: item_color.sku,
                        variante: item_color.variante,
                        color: item_color.color,
                        _id: item_color._id,
                        rollos_activos: rollos_color.length
                    });
                }
                let rollos_almacen = await Ingreso_detalle.find({producto: item._id, estado: true});
                if(colores.length >= 1){
                    data.push({
                        producto: item,
                        colores: colores_,
                        rollos_activos: rollos_almacen.length 
                    });
                }
                
            }

            res.status(200).send({data:data});
        }

        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const get_productos_ropas = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        const page = parseInt(req.params['page']) || 1; // Página predeterminada
        if(filtro == 'Todos'){
            let data = [];
            let productos = await Producto.find({estado:'Publicado',tipo:'Ropa'})
            .sort({createdAt:-1})
            .limit(page);


            for(var item of productos){
                let variaciones = await Ropa_variacion.find({producto:item._id}).populate('producto');
                let variaciones_ = [];
                for(var item_variacion of variaciones){
                    let unidades_variacion = await Ingreso_detalle.find({ropa_variacion: item_variacion._id, estado: true}); 
                    variaciones_.push({
                        color: item_variacion.color,
                        hxd: item_variacion.hxd,
                        precio_venta: item_variacion.precio_venta,
                        hidden: item_variacion.hidden,
                        producto: item_variacion.producto,
                        sku: item_variacion.sku,
                        talla: item_variacion.talla,
                        _id: item_variacion._id,
                        unidades_activas: unidades_variacion.length
                    });
                }
                let unidades_almacen = await Ingreso_detalle.find({producto: item._id, estado: true});
                if(variaciones.length >= 1){
                    data.push({
                        producto: item,
                        variaciones: variaciones_,
                        unidades_activas: unidades_almacen.length 
                    });
                }
            }

            res.status(200).send({data:data});
        }else{
            let data = [];
            let productos = await Producto.find({
                $or: [
                    {titulo: new RegExp(filtro,'i')},
                    {descripcion: new RegExp(filtro,'i')}
                ],estado:'Publicado',tipo:'Ropa'
            });

            for(var item of productos){
                let variaciones = await Ropa_variacion.find({producto:item._id}).populate('producto').sort({createdAt:-1});
                let variaciones_ = [];
                for(var item_variacion of variaciones){
                    let unidades_variacion = await Ingreso_detalle.find({ropa_variacion: item_variacion._id, estado: true}); 
                    variaciones_.push({
                        color: item_variacion.color,
                        hxd: item_variacion.hxd,
                        precio_venta: item_variacion.precio_venta,
                        hidden: item_variacion.hidden,
                        producto: item_variacion.producto,
                        sku: item_variacion.sku,
                        talla: item_variacion.talla,
                        _id: item_variacion._id,
                        unidades_activas: unidades_variacion.length
                    });
                }
                let unidades_almacen = await Ingreso_detalle.find({producto: item._id, estado: true});
                if(variaciones.length >= 1){
                    data.push({
                        producto: item,
                        variaciones: variaciones_,
                        unidades_activas: unidades_almacen.length 
                    });
                }
                
            }

            res.status(200).send({data:data});
        }

        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const duplicar_producto = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let producto = await Producto.findById({_id:id});
            let composiciones = await Producto_composicion.find({producto:id});
            
            let titulos = await Producto_titulo.find({producto:id});

            producto.titulo = producto.titulo + ' copia ' +getRandomArbitrary(0,100);
            producto.codigo = 'T'+producto.categoria.substr(0,1).toUpperCase()+''+producto.subcategoria.substr(0,3).toUpperCase()+'-'+getRandomArbitrary(10000,99999)
            let producto_duply = await Producto.create({
                titulo: producto.titulo,
                codigo: producto.codigo,
                tipo: producto.tipo,
                portada: producto.portada,
                categoria: producto.categoria,
                subcategoria: producto.subcategoria,
                genero: producto.genero,
                descripcion: producto.descripcion,
                estado: producto.estado,
            });

            for(var item of composiciones){
                await Producto_composicion.create({
                    composicion: item.composicion,
                    producto: producto_duply._id,
                    porcentaje: item.porcentaje,
                });
            }

            if(producto.tipo == 'Tela'){
                let colores = await Producto_color.find({producto:id});
                for(var item of colores){
                    item.sku = producto.tipo.substr(0,3).toUpperCase()+producto.categoria.substr(0,3).toUpperCase()+item.variante.substr(0,3).toUpperCase()+'-'+item.base.substr(0,3).toUpperCase();
                    await Producto_color.create({
                        base: item.base,
                        producto: producto_duply._id,
                        hxd: item.hxd,
                        precio_venta: item.precio_venta,
                        variante: item.variante,
                        yrds_min: item.yrds_min,
                        yrds_max: item.yrds_max,
                        hidden: item.hidden,
                        sku: item.sku+'-'+getRandomArbitrary(100,999)
                    });
                }
            }else if(producto.tipo == 'Ropa'){
                let variaciones = await Ropa_variacion.find({producto:id});
                for(var item of variaciones){
                    item.sku = producto.tipo.substr(0,3).toUpperCase()+producto.categoria.substr(0,3).toUpperCase()+producto.subcategoria.substr(0,3).toUpperCase()+item.talla.substr(0,3).toUpperCase()+'-'+item.color.substr(0,3).toUpperCase();
                    await Ropa_variacion.create({
                        color: item.color,
                        producto: producto_duply._id,
                        hxd: item.hxd,
                        precio_venta: item.precio_venta,
                        talla: item.talla,
                        cantidad_min: item.cantidad_min,
                        cantidad_max: item.cantidad_max,
                        hidden: item.hidden,
                        sku: item.sku+'-'+getRandomArbitrary(100,999)
                    });
                }
            }

            for(var item of titulos){
                await Producto_titulo.create({
                    titulo: item.titulo,
                    producto: producto_duply._id,
                });
            }


            res.status(200).send({data:producto_duply});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

function getRandomArbitrary(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const get_programaciones_producto = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let producto = await Producto.findById({_id:id});
            if(producto){
                if(producto.tipo == 'Tela'){
                    let colores = await Producto_color.find({producto:id});
                    let programaciones = await Pedido_programacion.find({producto:id}).populate('empresa_rs').populate('cliente').populate('producto').populate('producto_color').populate('colaborador');
                    res.status(200).send({data:true,producto,colores,programaciones});
                }else if(producto.tipo == 'Ropa'){
                    let variaciones = await Ropa_variacion.find({producto:id});
                    let programaciones = await Pedido_programacion.find({producto:id}).populate('empresa_rs').populate('cliente').populate('producto').populate('ropa_variacion').populate('colaborador');
                    res.status(200).send({data:true,producto,variaciones,programaciones});
                }
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

const update_sku_color = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let color = await Producto_color.findById({_id:id}).populate('producto');
            console.log(color);
            if(color){
                let sku = color.producto.tipo.substr(0,3).toUpperCase()+
                color.producto.categoria.substr(0,3).toUpperCase()+
                color.variante.substr(0,3).toUpperCase()+
                '-'+color.base.substr(0,3).toUpperCase()+
                +getRandomArbitrary(0,100);

                let color_reg = await Producto_color.findByIdAndUpdate({_id:id},{
                    sku:sku
                });
                res.status(200).send({data:color_reg});
            }else{
                res.status(200).send({data:undefined,message:'No se pudo actualizar.'});
            }
            
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined,message:'No se pudo actualizar.'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const delete_producto = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let producto = await Producto.findById({_id:id});
            let nuevo_estado;
        
            if(producto.estado == 'Borrador'){
                nuevo_estado = 'Publicado';
            }else if(producto.estado== 'Publicado'){
                nuevo_estado = 'Borrador';
            }
        
            await Producto.findByIdAndUpdate({_id:id},{
                estado: nuevo_estado
            });
            res.status(200).send({data:true});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined, message: 'El producto no pudo se eliminado'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const update_precio_ropa_variacion = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;

        let variacion = await Ropa_variacion.findByIdAndUpdate({_id:id},{precio_venta: data.precio_venta});
        res.status(200).send({data:variacion});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const importar_rollos = async function(req,res){
    if(req.user){
        let data = req.body;
        data.ingresos = JSON.parse(data.ingresos);

        for(var item of data.ingresos){
            item.colaborador = req.user.sub;
            item.year = new Date().getFullYear();
            item.month = new Date().getMonth()+1;
            item.day = new Date().getDate()
            let ingreso = await Ingreso.create(item);
            let producto = await Producto.findById({_id:item.producto});
            let color = await Producto_color.findById({_id:item.producto_color});


            for(var subitem of item.data){
                subitem.ingreso = ingreso._id;
                subitem.colaborador = req.user.sub;
                subitem.producto = item.producto;
                subitem.producto_color = item.producto_color;
                subitem.year = new Date().getFullYear();
                subitem.month = new Date().getMonth()+1;
                subitem.day = new Date().getDate();
                subitem.codigo = item.almacen.replace(/ /g, "").substr(0,3)+''+
                producto.titulo.trim().substr(0,3)+''+
                color.variante.trim().substr(0,3)+''+
                subitem.cantidad+''+ getRandomArbitrary(1000,9999)
                await Ingreso_detalle.create(subitem);
            }
        }

        res.status(200).send({data:true});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

function getRandomArbitrary(min,max) {
    return Math.round(Math.random() * (max - min) + min);
}

const delete_variacion = async function(req,res){
    if(req.user){
        let id = req.params['id'];

        let variacion = await Producto_variacion.findByIdAndUpdate({_id:id},{
            delete: true
        });
        res.status(200).send({data:variacion});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const update_cantidad_contenedor = async function(req,res){
    if(req.user){
        let data = req.body;
        let id = req.params['id'];
    
        try {
            let producto = await Producto.findByIdAndUpdate({_id:id},{
                cantidad_contenedor: data.cantidad_contenedor,
            })
            res.status(200).send({data:producto});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}


module.exports = {
    create_producto,
    create_ropa,
    get_productos,
    get_productos_papelera,
    get_productos_programaciones,
    get_image_producto,
    get_producto,
    update_producto,
    get_producto_composiciones,
    add_composicion,
    delete_composicion,
    add_titulo,
    delete_titulo,
    add_etiqueta,
    delete_etiqueta,
    delete_etiqueta_color,
    add_variacion,
    set_estado_variacion,
    delete_variacion,
    add_imagen,
    add_etiqueta_color,
    delete_imagen,
    get_productos_filter_advanced,
    get_productos_cantidades_filter_advanced,
    get_productos_cantidades,
    get_ropas_cantidades,
    update_precio_producto_color,
    update_precio_ropa_variacion,
    edit_color,
    get_productos_ventas,
    get_productos_ventas_con_precios,
    get_producto_ventas_con_precios,
    get_productos_ropas,
    update_valores_producto_color,
    update_valores_ropa_variacion,
    duplicar_producto,
    get_programaciones_producto,
    get_productos_programaciones_ropas,
    update_sku_color,
    update_precio_global_color,
    delete_producto,
    importar_productos,
    importar_colores,
    get_ropas,
    get_ropa_tallas,
    get_colores_ropas,
    get_producto_titulos,
    get_producto_variaciones,
    get_producto_imagenes,
    get_producto_etiquetas,
    importar_rollos,
    update_cantidad_contenedor
}