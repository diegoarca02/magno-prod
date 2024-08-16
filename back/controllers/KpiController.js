var Pago = require('../models/Pago');
var Colaborador = require('../models/Colaborador');
var Producto = require('../models/Producto');
var Venta_detalle = require('../models/Venta_detalle');
var moment = require('moment');
var Pedido_detalle = require('../models/Pedido_detalle');
var Producto_color = require('../models/Producto_color');
const Ingreso_detalle = require('../models/Ingreso_detalle');


const get_cobranza_semanal = async function(req,res){
    if(req.user){
        let month = req.params['month'];
        let year = req.params['year'];

        var pagos = await Pago.find({month: month, year:year,estado: 'Aprobado'});
        var sem_uno = 0;
        var sem_dos = 0;
        var sem_tres = 0;
        var sem_cuatro = 0;

        for(var item of pagos){
            if(item.day >= 1 && item.day <= 7){
                sem_uno = sem_uno + item.monto;
            }else if(item.day >= 8 && item.day <= 14){
                sem_dos = sem_dos + item.monto;
            }else if(item.day >= 15 && item.day <= 21){
                sem_tres = sem_tres + item.monto;
            }else if(item.day >= 15 && item.day <= 31){
                sem_cuatro = sem_cuatro + item.monto;
            }
        }

        res.status(200).send({sem_uno,sem_dos,sem_tres,sem_cuatro});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_cobranza_cliente = async function(req,res){
    if(req.user){
        let inicio = req.params['inicio'];
        let hasta = req.params['hasta'];
        let cliente = req.params['cliente'];
        var arr_mes = [];

        //CALCULAR N DIAS ENTRE LAS FECHAS
        var fecha1 = moment(inicio+'T00:00:00');
        var fecha2 = moment(hasta+'T23:59:59');

        var dateStart = moment(fecha1);
        var dateEnd = moment(fecha2);
        var timeValues = [];

        while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
            timeValues.push(dateStart.format('YYYY-MM'));
            dateStart.add(1,'month');
        }

        for(var item of timeValues){
            let str_date = item.split('-');
            let year = parseInt(str_date[0]);
            let month = parseInt(str_date[1]);
            
            let pagos = await Pago.find({month: month, year:year,estado: 'Aprobado',cliente:cliente});
            arr_mes.push({
                mes:month,
                year:year,
                pagos:pagos,
                sem_uno: 0,
                sem_dos: 0,
                sem_tres: 0,
                sem_cuatro: 0
            });  
       }



        //CREAR MESES


        for(var item of arr_mes){
            for(var subitem of item.pagos){
                if(subitem.day >= 1 && subitem.day <= 7){
                    item.sem_uno = item.sem_uno + subitem.monto;
                }else if(subitem.day >= 8 && subitem.day <= 14){
                    item.sem_dos = item.sem_dos + subitem.monto;
                }else if(subitem.day >= 15 && subitem.day <= 21){
                    item.sem_tres = item.sem_tres + subitem.monto;
                }else if(subitem.day >= 15 && subitem.day <= 31){
                    item.sem_cuatro = item.sem_cuatro + subitem.monto;
                }
            }
        }


        res.status(200).send({data:arr_mes});
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_pagos_mensuales_cliente = async function(req,res){
    if(req.user){
        let month = req.params['month'];
        let year = req.params['year'];
        let cliente = req.params['cliente'];

        var pagos = await Pago.find({month: month, year:year,estado: 'Aprobado',cliente:cliente}).sort({createdAt:1});

        var arr_pagos = [];

        var index = 0;
        for(var item of pagos){
            if(arr_pagos.length == 0){
                arr_pagos.push({
                    monto:item.monto,
                    createdAt: item.createdAt,
                    str_fecha: moment(item.createdAt).format('YYYY-MM-DD'),
                    metodo:item.metodo,
                    aprobacion:item.aprobacion,
                    dias: 0,
                    index: index
                });
            }else{
                index++;
                var date_uno = moment(pagos[index-1].createdAt).format('YYYY-MM-DD');
                var date_dos_ = moment(pagos[index].createdAt).format('YYYY-MM-DD');
                var date_dos = moment(date_dos_);
                var dias_diff = date_dos.diff(date_uno, 'days');
                arr_pagos.push({
                    monto:item.monto,
                    createdAt: item.createdAt,
                    str_fecha: moment(item.createdAt).format('YYYY-MM-DD'),
                    metodo:item.metodo,
                    aprobacion:item.aprobacion,
                    dias: dias_diff,
                    index: index
                });
            }
        }

        res.status(200).send({data:arr_pagos});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_cobranza_million = async function(req,res){
    if(req.user){
        let inicio = req.params['inicio'];
        let hasta = req.params['hasta'];
        var arr_mes = [];

        //CALCULAR N DIAS ENTRE LAS FECHAS
        var fecha1 = moment(inicio+'T00:00:00');
        var fecha2 = moment(hasta+'T23:59:59');


        var dateStart = moment(fecha1);
        var dateEnd = moment(fecha2);
        var timeValues = [];

        while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
            timeValues.push(dateStart.format('YYYY-MM'));
            dateStart.add(1,'month');
        }

       for(var item of timeValues){
            let str_date = item.split('-');
            let year = parseInt(str_date[0]);
            let month = parseInt(str_date[1]);
            
            let pagos = await Pago.find({month: month, year:year,estado: 'Aprobado'});
            arr_mes.push({
                mes:month,
                year:year,
                pagos:pagos,
                sem_uno: 0,
                sem_dos: 0,
                sem_tres: 0,
                sem_cuatro: 0
            });  
       }

   
        //CREAR MESES


        for(var item of arr_mes){
            for(var subitem of item.pagos){
                if(subitem.day >= 1 && subitem.day <= 7){
                    item.sem_uno = item.sem_uno + subitem.monto;
                }else if(subitem.day >= 8 && subitem.day <= 14){
                    item.sem_dos = item.sem_dos + subitem.monto;
                }else if(subitem.day >= 15 && subitem.day <= 21){
                    item.sem_tres = item.sem_tres + subitem.monto;
                }else if(subitem.day >= 22 && subitem.day <= 31){
                    item.sem_cuatro = item.sem_cuatro + subitem.monto;
                }
            }
        }


        res.status(200).send({data:arr_mes});
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_ventas_productos = async function(req,res){
    if(req.user){
        let inicio = req.params['inicio'];
        let hasta = req.params['hasta'];
        var arr_mes = [];

        //CALCULAR N DIAS ENTRE LAS FECHAS
        var fecha1 = moment(inicio+'T00:00:00');
        var fecha2 = moment(hasta+'T23:59:59');

        var dateStart = moment(fecha1);
        var dateEnd = moment(fecha2);
        var timeValues = [];

        while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
            timeValues.push(dateStart.format('YYYY-MM'));
            dateStart.add(1,'month');
        }

        var productos = await Producto.find({estado:'Publicado'});
        var arr_productos = [];
        var arr_productos_general = [];

        for(var item of productos){
            arr_productos.push({
                titulo: item.titulo,
                _id: item._id,
                total: 0
            });

            arr_productos_general.push({
                titulo: item.titulo,
                _id: item._id,
                total: 0
            });
        }

        for(var item of timeValues){
            let str_date = item.split('-');
            let year = parseInt(str_date[0]);
            let month = parseInt(str_date[1]);
            
            
            arr_mes.push({
                mes:month,
                year:year,
                ventas:[],
                sem_uno: arr_productos,
                sem_dos: arr_productos,
                sem_tres: arr_productos,
                sem_cuatro: arr_productos
            });  
        }

     
        //CREAR MESES

        for(var item of arr_mes){
            let reg = await Venta_detalle.find({year:item.year,month:item.mes}).populate('producto').populate('venta');
            let ventas = [];
            for(var subitem of reg){
                if(subitem.venta.estado != 'Cancelado' && subitem.venta.estado != 'Procesado') ventas.push(subitem);
            }
            item.ventas = ventas;
        }

        for(var item of arr_productos_general){
            let ventas = await Venta_detalle.find({producto:item._id, createdAt: {
                $gte: new Date(inicio+'T00:00:00'),
                $lt: new Date(hasta+'T23:59:59')
            }}).populate('producto');
            console.log(ventas.length);
            for(var subitem of ventas){
                let subtotal = (subitem.cantidad * subitem.precio).toFixed(2);
                item.total = item.total + parseFloat(subtotal);
            }
        }

        res.status(200).send({data:arr_mes, general:arr_productos_general});
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_pagos_productos = async function(req,res){
    if(req.user){
        let inicio = req.params['inicio'];
        let hasta = req.params['hasta'];
        var arr_mes = [];

        //CALCULAR N DIAS ENTRE LAS FECHAS
        var fecha1 = moment(inicio+'T00:00:00');
        var fecha2 = moment(hasta+'T23:59:59');

        var dateStart = moment(fecha1);
        var dateEnd = moment(fecha2);
        var timeValues = [];

        while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
            timeValues.push(dateStart.format('YYYY-MM'));
            dateStart.add(1,'month');
        }

        var productos = await Producto.find({estado:'Publicado'});
        var arr_productos = [];
        var arr_productos_general = [];

        for(var item of productos){
            arr_productos.push({
                titulo: item.titulo,
                _id: item._id,
                total: 0
            });

            arr_productos_general.push({
                titulo: item.titulo,
                _id: item._id,
                total: 0
            });
        }

        for(var item of timeValues){
            let str_date = item.split('-');
            let year = parseInt(str_date[0]);
            let month = parseInt(str_date[1]);
            
            
            arr_mes.push({
                mes:month,
                year:year,
                ventas:[],
                sem_uno: arr_productos,
                sem_dos: arr_productos,
                sem_tres: arr_productos,
                sem_cuatro: arr_productos
            });  
        }

     
        //CREAR MESES

        for(var item of arr_mes){
            let reg = await Pago_sub.find({year:item.year,month:item.mes}).populate('producto');
            let pagos = [];
            for(var subitem of reg){
                if(subitem.estado == 'Aprobado') pagos.push(subitem);
            }
            item.pagos = pagos;
        }

        for(var item of arr_productos_general){
            let pagos = await Pago_sub.find({producto:item._id, estado: 'Aprobado', createdAt: {
                $gte: new Date(inicio+'T00:00:00'),
                $lt: new Date(hasta+'T23:59:59')
            }}).populate('producto');
            for(var subitem of pagos){
                item.total = item.total + parseFloat(subitem.monto);
            }
        }

        res.status(200).send({data:arr_mes, general:arr_productos_general});
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_pagos_agente = async function(req,res){
    if(req.user){
        let inicio = req.params['inicio'];
        let hasta = req.params['hasta'];
        var arr_mes = [];

        //CALCULAR N DIAS ENTRE LAS FECHAS
        var fecha1 = moment(inicio+'T00:00:00');
        var fecha2 = moment(hasta+'T23:59:59');

        var dateStart = moment(fecha1);
        var dateEnd = moment(fecha2);
        var timeValues = [];

        while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
            timeValues.push(dateStart.format('YYYY-MM'));
            dateStart.add(1,'month');
        }

        var colaboradores = await Colaborador.find({estado:true,rol:'Administrador'});
        var arr_colaborador = [];
        var arr_colaborador_general = [];

        for(var item of colaboradores){
            arr_colaborador.push({
                nombres: item.nombres.split(' ')[0],
                apellidos: item.apellidos.split(' ')[0],
                _id: item._id,
                total: 0
            });

            arr_colaborador_general.push({
                nombres: item.nombres.split(' ')[0],
                apellidos: item.apellidos.split(' ')[0],
                _id: item._id,
                total: 0
            });
        }

        for(var item of timeValues){
            let str_date = item.split('-');
            let year = parseInt(str_date[0]);
            let month = parseInt(str_date[1]);
            
            
            arr_mes.push({
                mes:month,
                year:year,
                ventas:[],
                sem_uno: arr_colaborador,
                sem_dos: arr_colaborador,
                sem_tres: arr_colaborador,
                sem_cuatro: arr_colaborador
            });  
        }

     
        //CREAR MESES

        for(var item of arr_mes){
            let reg = await Pago_sub.find({year:item.year,month:item.mes}).populate('producto');
            let pagos = [];
            for(var subitem of reg){
                if(subitem.estado == 'Aprobado') pagos.push(subitem);
            }
            item.pagos = pagos;
        }

        for(var item of arr_colaborador_general){
            let pagos = await Pago_sub.find({colaborador:item._id, estado: 'Aprobado', createdAt: {
                $gte: new Date(inicio+'T00:00:00'),
                $lt: new Date(hasta+'T23:59:59')
            }}).populate('producto');
            for(var subitem of pagos){
                item.total = item.total + parseFloat(subitem.monto);
            }
        }

        res.status(200).send({data:arr_mes, general:arr_colaborador_general});
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_ventas_agente = async function(req,res){
    if(req.user){
        let inicio = req.params['inicio'];
        let hasta = req.params['hasta'];
        var arr_mes = [];

        //CALCULAR N DIAS ENTRE LAS FECHAS
        var fecha1 = moment(inicio+'T00:00:00');
        var fecha2 = moment(hasta+'T23:59:59');

        var dateStart = moment(fecha1);
        var dateEnd = moment(fecha2);
        var timeValues = [];

        while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
            timeValues.push(dateStart.format('YYYY-MM'));
            dateStart.add(1,'month');
        }

        var colaboradores = await Colaborador.find({estado:true,rol:'Administrador'});
        var arr_colaborador = [];
        var arr_colaborador_general = [];

        for(var item of colaboradores){
            arr_colaborador.push({
                nombres: item.nombres.split(' ')[0],
                apellidos: item.apellidos.split(' ')[0],
                _id: item._id,
                total: 0
            });

            arr_colaborador_general.push({
                nombres: item.nombres.split(' ')[0],
                apellidos: item.apellidos.split(' ')[0],
                _id: item._id,
                total: 0
            });
        }

        for(var item of timeValues){
            let str_date = item.split('-');
            let year = parseInt(str_date[0]);
            let month = parseInt(str_date[1]);
            
            
            arr_mes.push({
                mes:month,
                year:year,
                ventas:[],
                sem_uno: arr_colaborador,
                sem_dos: arr_colaborador,
                sem_tres: arr_colaborador,
                sem_cuatro: arr_colaborador
            });  
        }

     
        //CREAR MESES

        for(var item of arr_mes){
            let reg = await Venta_detalle.find({year:item.year,month:item.mes}).populate('producto').populate('venta');
            let ventas = [];
            for(var subitem of reg){
                if(subitem.venta.estado != 'Cancelado' && subitem.venta.estado != 'Procesado') ventas.push(subitem);
            }
            item.ventas = ventas;
        }

        for(var item of arr_colaborador_general){
            let ventas = await Venta_detalle.find({colaborador:item._id, createdAt: {
                $gte: new Date(inicio+'T00:00:00'),
                $lt: new Date(hasta+'T23:59:59')
            }}).populate('producto');
            console.log(ventas.length);
            for(var subitem of ventas){
                let subtotal = (subitem.cantidad * subitem.precio).toFixed(2);
                item.total = item.total + parseFloat(subtotal);
            }
        }

        res.status(200).send({data:arr_mes, general:arr_colaborador_general});
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const kpi_inventario = async function(req,res){
    let productos = await Producto.find({estado:'Publicado'});
    let arr_producto_colores = [];

    var totales_cantidad = 0;
    var totales_subtotal = 0;

    for(var item of productos){
        let colores = await Producto_color.find({producto: item._id});
        for(var subitem of colores){
            if(subitem.precio_venta){
                let rollos = await Ingreso_detalle.find({estado: true, producto_color: subitem._id}).populate('producto').populate('ingreso');
                let cantidad = 0;

                for(var i_rollo of rollos){
                    if(i_rollo.ingreso.umedida_cantidad == 'Yrd') totales_cantidad = totales_cantidad + i_rollo.cantidad;
                    else totales_cantidad = totales_cantidad + (i_rollo.cantidad*1.09361);

                    if(i_rollo.ingreso.umedida_cantidad == 'Yrd') cantidad = cantidad + i_rollo.cantidad;
                    else cantidad = cantidad + (i_rollo.cantidad*1.09361);
                } 

                totales_subtotal = totales_subtotal + (subitem.precio_venta *  cantidad)
            }
        }
    }

    console.log(totales_cantidad);

    for(var item of productos){
        let colores = await Producto_color.find({producto: item._id});
        for(var subitem of colores){
            if(subitem.precio_venta){
                let rollos = await Ingreso_detalle.find({estado: true, producto_color: subitem._id}).populate('producto').populate('ingreso');
                let cantidad = 0;

                for(var i_rollo of rollos){
                    if(i_rollo.ingreso.umedida_cantidad == 'Yrd') cantidad = cantidad + i_rollo.cantidad;
                    else cantidad = cantidad + (i_rollo.cantidad*1.09361);
                }
                
                let subtotal = subitem.precio_venta *  cantidad;
                let porcent_cantidad = (cantidad*100)/totales_cantidad;
                let porcent_subtotal = (subtotal*100)/totales_subtotal;

                if(rollos.length >= 1){
                    arr_producto_colores.push({
                        producto: item.titulo,
                        hxd: subitem.hxd,
                        color: subitem.variante,
                        cantidad: cantidad,
                        porcent_cantidad: porcent_cantidad.toFixed(2),
                        precio_venta: subitem.precio_venta,
                        subtotal: subtotal,
                        porcent_subtotal: parseFloat(porcent_subtotal.toFixed(2)),
                        porcent_clasificacion: 0,
                        clasificacion: '',
                        porcent_total: 0
                    });
                }


            }
        }
    }

    //ORDENAR
    arr_producto_colores.sort((a, b) => {
        const nameA = a.porcent_subtotal; // ignore upper and lowercase
        const nameB = b.porcent_subtotal; // ignore upper and lowercase
        if (nameA > nameB) {
          return -1;
        }
        if (nameA < nameB) {
          return 1;
        }
      
        // names must be equal
        return 0;
    });

    let subtotal_a = 0;
    for(var item of arr_producto_colores){
        if(subtotal_a <= 75){
            subtotal_a = subtotal_a + item.porcent_subtotal;
            item.clasificacion = 'A'
        }
    }

    let subtotal_b = 0;
    for(var item of arr_producto_colores){
        if(!item.clasificacion){
            if(subtotal_b <= 20){
                subtotal_b = subtotal_b + item.porcent_subtotal;
                item.clasificacion = 'B'
            }
        }
    }

    let subtotal_c = 0;
    for(var item of arr_producto_colores){
        if(!item.clasificacion){
            if(subtotal_c <= 20){
                subtotal_c = subtotal_c + item.porcent_subtotal;
                item.clasificacion = 'C'
            }
        }
    }

    for(var item of arr_producto_colores){
        if(item.clasificacion == 'A') item.porcent_clasificacion = subtotal_a;
        if(item.clasificacion == 'B') item.porcent_clasificacion = subtotal_b;
        if(item.clasificacion == 'C') item.porcent_clasificacion = subtotal_c;
    }

    let porcent = 0;
    for(var item of arr_producto_colores){
        item.porcent_total = porcent + item.porcent_subtotal;
        porcent = item.porcent_total; 

        
    }
    
     totales_subtotal
    res.status(200).send({
        data:arr_producto_colores,
        totales: {
            totales_cantidad,
            totales_subtotal,
        }
    });

}

module.exports = {
    get_cobranza_semanal,
    get_cobranza_cliente,
    get_pagos_mensuales_cliente,
    get_cobranza_million,
    get_ventas_productos,
    get_pagos_productos,
    get_pagos_agente,
    get_ventas_agente,
    kpi_inventario
}