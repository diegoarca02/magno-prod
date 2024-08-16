var Producto = require('../models/Producto');
var Producto_color = require('../models/Producto_color');
var Producto_variacion = require('../models/Producto_variacion'); 
var Venta_detalle = require('../models/Venta_detalle');
var Pedido_detalle = require('../models/Pedido_detalle');
var Ingreso_detalle = require('../models/Ingreso_detalle');
var Pedido = require('../models/Pedido');
var Programacion_detalle = require('../models/Programacion_detalle');
var Producto_etiqueta= require('../models/Producto_etiqueta');
const inf_pedidos = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        var arr_colores = [];

        var producto = await Producto.findById({_id:id});
        var colores = await Producto_color.find({producto:id});

        for(var item of colores){

            var stock_free = 0;
            var stock_total = 0;


            var pedidos = await Pedido_detalle.find({producto_color:item._id}).populate('pedido');
            var pedidos_color = [];
            for(var subitem of pedidos){
                if(subitem.pedido.estado != 'Confirmado'){
                    pedidos_color.push(subitem);
                }
            }

            var ingresos = await Ingreso_detalle.find({producto_color:item._id,estado:true}).populate('ingreso');
            for(var subitem of ingresos){

                var ventas = await Venta_detalle.find({ingreso_detalle:subitem._id});
                if(ventas.length == 0){
                    stock_free = stock_free + subitem.cantidad;
                }

                stock_total = stock_total + subitem.cantidad

            }
  
            arr_colores.push({
                color: item,
                pedidos_color,
                stock_free: stock_free.toFixed(2),
                stock_total: stock_total.toFixed(2)
            });
        }

        res.status(200).send({data:arr_colores,producto});

    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const inf_pedidos_completo = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        console.log(id);
        var productos = [];

        if(id == 'Todos'){
            productos =  await Producto.find({estado:'Publicado'}).sort({createdAt:-1});
        }else{
            productos =  await Producto.find({_id:id,estado:'Publicado'}).sort({createdAt:-1});
        }
       
        var arr_productos = [];

        for(var item of productos){
            var variaciones = await Producto_variacion.find({producto:item._id,delete:false});
            let etiquetas = await Producto_etiqueta.find({producto:item._id}).populate('producto');
            var arr_variaciones = [];
            var stock_free_producto = 0;
            var stock_total_producto = 0;
            var future_stock_producto = 0;

            for(var subitem of variaciones){
                var variacion = {}
                var stock_free = 0;
                var stock_total = 0;
                var future_stock = 0;
                var reser_future_stock = 0;
                var disp_future_stock = 0;
                var pedidos_color = [];

                var ingresos = await Ingreso_detalle.find({producto_variacion:subitem._id,estado:true})
                .populate('ingreso');
                for(var element of ingresos){

                    var ventas = await Venta_detalle.find({ingreso_detalle:element._id});
                    if(ventas.length == 0){
                        stock_free = stock_free + element.cantidad;
                        stock_free_producto = stock_free_producto + element.cantidad;
                    }
                    stock_total = stock_total + element.cantidad;
                    stock_total_producto = stock_total_producto + element.cantidad;
                }

                var pedidos = await Pedido_detalle.find({
                    producto_variacion:subitem._id,
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
                        future_stock = future_stock + parseFloat(metraje_sobrante);
                        future_stock_producto = future_stock_producto + parseFloat(metraje_sobrante);
                    }
                }

 
                var d_ventas = await Venta_detalle.find({producto_variacion: subitem._id,tipo_detalle:'En camino'}).populate('venta');
                for(var element of d_ventas){
                    if(element.venta.estado != 'Cancelado'){
                        reser_future_stock = reser_future_stock + parseFloat(element.cantidad);
                    }
                }

                var disp_future_stock = future_stock - parseFloat(reser_future_stock);
                
                let unidad;

                if(subitem.tipo == 'Tela') unidad = 'Mtr';
                else if(subitem.tipo == 'Ropa') unidad = 'Unid';
                else if(subitem.tipo == 'Acero') unidad = 'Kg';

                variacion._id = subitem._id;
                variacion.sku =  subitem.sku;
                variacion.hxd =  subitem.hxd;
                variacion.variacion_name =  subitem.variacion_name;
                variacion.color_name =  subitem.color_name;
                variacion.talla =  subitem.talla;
                variacion.tipo =  subitem.tipo;
                variacion.unidad = unidad;
                variacion.stock_free = stock_free.toFixed(2);
                variacion.stock_total = stock_total.toFixed(2);
                variacion.future_stock = disp_future_stock.toFixed(2);
                variacion.pedidos = [],
                arr_variaciones.push(variacion);
            }

            if(arr_variaciones.length >= 1){

                let etiquetas = await Producto_etiqueta.find({producto:item._id}).populate('producto');
                let total_prioridad = 0;
                console.log(total_prioridad);
                for(var subitem of etiquetas){
                    total_prioridad = total_prioridad + subitem.prioridad;
                }


                arr_productos.push({
                    producto: item,
                    etiquetas,
                    arr_variaciones,
                    npedidos_producto: 0,
                    arr_header: [],
                    stock_free_producto : stock_free_producto,
                    stock_total_producto : stock_total_producto,
                    future_stock_producto : future_stock_producto,
                    total_prioridad: total_prioridad,
                    etiquetas: etiquetas
                });
            }
        }

        arr_productos.sort((a, b) => b.total_prioridad - a.total_prioridad);
        for(var item of arr_productos){
        
            var detalle_pedidos = await Pedido_detalle.find({
                producto: item.producto._id,
                $or: [{ estado: 'Aprobado' }, { estado: 'Enviado' }]
            }).populate('pedido');

            var arr_pedidos_total = [];

            for(var subitem of detalle_pedidos){
                if(arr_pedidos_total.length == 0){
                    arr_pedidos_total.push({
                        year: subitem.pedido.year,
                        serie: subitem.pedido.serie,
                        idpedido: subitem.pedido._id,
                        iddetalle: subitem._id,
                        detalles: [subitem]
                    });
                }else{
                    var exist = arr_pedidos_total.filter(ped=>ped.serie == subitem.pedido.serie);
                    if(exist.length == 0){
                        arr_pedidos_total.push({
                            year: subitem.pedido.year,
                            serie: subitem.pedido.serie,
                            idpedido: subitem.pedido._id,
                            iddetalle: subitem._id,
                            detalles: [subitem]
                        });
                    }else{
                        for(var ped of arr_pedidos_total){
                            if(ped.serie == subitem.pedido.serie){
                                ped.detalles.push(subitem);
                            }
                        }
                    }
                }
                
            }

            for(var subitem of item.arr_variaciones){
                var arr_pedidos = [];
                for(var ped of arr_pedidos_total){
                    let metraje_color = 0;
                    for(var det of ped.detalles){
                        if(det.producto_variacion.toString() == subitem._id.toString()){
                            console.log(det.cantidad + ' - ' + ped.serie);
                            metraje_color = metraje_color +det.cantidad;
                        }
                    }
            
            
                    arr_pedidos.push({
                        _idpedido:ped.idpedido,
                        id_detalle:ped.iddetalle,
                        serie_pedido: ped.serie,
                        cantidad: metraje_color,
                    })
                }
            
                subitem.pedidos = arr_pedidos;
            }
            
            //COLOCAR CABECERA DE PEDIDOS EN CADA PRODUCTO
            for(var subitem of arr_pedidos_total){
                item.arr_header.push({
                    pedido: '#'+subitem.year+'-'+subitem.serie.toString().padStart(6,'000000'),
                    _id: subitem.idpedido,
                });
            }

            /* console.log(arr_pedidos_total); */
        }

        res.status(200).send({data:arr_productos});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const inf_pedido_clientes = async function(req,res){
    if(req.user){

        var id = req.params['id'];

        var pedido = await Pedido.findById({_id:id});
        var detalles = await Programacion_detalle.find({pedido:id}).populate('cliente').populate('producto').populate('producto_variacion').populate('programacion');
        var clientes = [];

        var variaciones = [];

        for(var item of detalles){
            if(variaciones.length == 0){
                variaciones.push({
                  _id: item.producto_variacion._id,
                  idproducto: item.producto._id,
                  hxd: item.producto_variacion.hxd,
                  producto: item.producto.titulo,
                  variacion_name: item.producto_variacion.variacion_name,
                  color_name: item.producto_variacion.color_name,
                  talla: item.producto_variacion.talla,
                  tipo: item.producto_variacion.tipo,
                  stock_free: 0,
                  stock_total: 0,
                  stock_venta: 0,
                  clientes: []
                });
            }else{
                var variaciones_arr = variaciones.filter(subitem=> subitem._id == item.producto_variacion._id);
                if(variaciones_arr.length == 0){
                    variaciones.push({
                        _id: item.producto_variacion._id,
                        idproducto: item.producto._id,
                        hxd: item.producto_variacion.hxd,
                        producto: item.producto.titulo,
                        variante: item.producto_variacion.variante,
                        color_name: item.producto_variacion.color_name,
                        talla: item.producto_variacion.talla,
                        tipo: item.producto_variacion.tipo,
                        stock_free: 0,
                        stock_total: 0,
                        stock_venta: 0,
                        clientes: []
                    });
                }
            }
        }

        console.log(variaciones.length);

        for(var item of variaciones){
            var arr_clientes = [];
            for(var subitem of detalles){
                if(item._id == subitem.producto_variacion._id){
                    item.stock_total = item.stock_total + subitem.cantidad;
                    item.stock_venta = item.stock_venta + subitem.cantidad;
                }

                if(arr_clientes.length == 0){
                    arr_clientes.push({
                        nombres: subitem.cliente.nombres,
                        apellidos: subitem.cliente.apellidos,
                        _id: subitem.cliente._id,
                        cantidad: 0
                    });
                }else{
                    var reg = arr_clientes.filter(cli=> cli._id.toString() == subitem.cliente._id.toString());
                    if(reg.length == 0){
                        arr_clientes.push({
                            nombres: subitem.cliente.nombres,
                            apellidos: subitem.cliente.apellidos,
                            _id: subitem.cliente._id,
                            cantidad: 0
                        }); 
                    }
                }
            }

            item.clientes = arr_clientes;
            clientes = arr_clientes;
        }

        for(var item of variaciones){
            for(var cliente of item.clientes){
                var total_cliente = 0;
                for(var subitem of detalles){
                    if(item._id == subitem.producto_variacion._id && cliente._id == subitem.cliente._id){
                        total_cliente = total_cliente + subitem.cantidad;
                    }
                }
                cliente.cantidad = total_cliente;
            }

            console.log(item);
        }

        res.status(200).send({data:variaciones,pedido,clientes});

    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

module.exports = {
    inf_pedidos,
    inf_pedidos_completo,
    inf_pedido_clientes
}