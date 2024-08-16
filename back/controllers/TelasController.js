const Color = require('../models/Color');
const Producto_color = require('../models/Producto_color');
var bcrypt = require('bcrypt-nodejs');
var Producto = require('../models/Producto');
var Producto_variacion = require('../models/Producto_variacion');
const Color_etiqueta = require('../models/Color_etiqueta');

const create_color = async function(req,res){
    if(req.user){
        var data = req.body;
        try {
            console.log(data);
            var color_ = await Color.find({color:data.color.trim()});

            if(color_.length == 0){
                if(data.password){
                    bcrypt.hash(data.password,null,null, async function(err,hash){
                        if(err){
                            res.status(200).send({data:undefined,message:'No se puedo generar la contraseña.'});
                        }else{
                            data.color = data.color.trim();
                            data.str_password =  data.password;
                            data.password = hash;
                            console.log(data);
                            var color = await Color.create(data);
                            res.status(200).send({data:color});
                        }
                    });
                }else{
                    data.color = data.color.trim();
                    var color = await Color.create(data);
                    res.status(200).send({data:color});
                }
            }else{
                res.status(200).send({data:undefined,message:'El color no esta disponible.'});
            }
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined,message:'No se pudo agregar el valor.'});
        }

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const create_color_producto = async function(req,res){
    if(req.user){
        var data = req.body;
        try {
            console.log(data);
            let color_data = await Color.find({color: data.color});

            if(color_data.length == 0){
               if(data.password){
                    bcrypt.hash(data.password,null,null, async function(err,hash){
                        if(err){
                            res.status(200).send({data:undefined,message:'No se puedo generar la contraseña.'});
                        }else{
                            data.password = hash;
                            data.primario = false;
                            var color = await Color.create(data);
        
                            //AGREGAR COLOR A PRODUCTO
                            let color_producto = {}; 
                            let producto = await Producto.findById({_id:data.producto});
        
                            color_producto.sku = producto.tipo.substr(0,3).toUpperCase()+producto.categoria.substr(0,3).toUpperCase()+producto.subcategoria.substr(0,3).toUpperCase()+data.color.substr(0,3).toUpperCase();
                            color_producto.variante = data.color.trim();
                            color_producto.hxd = data.hxd;
                            color_producto.color = color._id;
                            color_producto.producto = data.producto;
                            color_producto.password = hash;
                            color_producto.str_password = data.password;
                            await Producto_color.create(color_producto);
        
                            res.status(200).send({data:color});
                        }
                    });
               }else{
                data.primario = false;
                data.color = data.color.trim();
                var color = await Color.create(data);

                //AGREGAR COLOR A PRODUCTO
                let color_producto = {}; 
                let producto = await Producto.findById({_id:data.producto});

                color_producto.sku = producto.tipo.substr(0,3).toUpperCase()+producto.categoria.substr(0,3).toUpperCase()+producto.subcategoria.substr(0,3).toUpperCase()+data.color.substr(0,3).toUpperCase();
                color_producto.variante = data.color.trim();
                color_producto.hxd = data.hxd;
                color_producto.color = color._id;
                color_producto.producto = data.producto;
                await Producto_color.create(color_producto);

                res.status(200).send({data:color});
               }
            }else{
                res.status(200).send({data:undefined,message:'El color ya existe.'});
            }
            
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined,message:'No se pudo agregar el valor.'});
        }

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const add_colores_primarios_producto = async function(req,res){
    if(req.user){
        let id = req.params['id'];

        let colores_primarios = await Color.find({primario:true});
        let colores_productos = await Producto_color.find({producto:id});
        let producto = await Producto.findById({_id:id});
        let count_omitidos = 0;
        
        console.log(colores_productos);

        for(var item of colores_primarios){
            var reg = colores_productos.filter(subitem=>subitem.color.toString() == item._id.toString());
            console.log(item._id);
            console.log(reg.length + ' N');
            if(reg.length == 0){
                let sku = producto.tipo.substr(0,3).toUpperCase()+producto.categoria.substr(0,3).toUpperCase()+producto.subcategoria.substr(0,3).toUpperCase()+item.color.substr(0,3).toUpperCase();
                
                await Producto_color.create({
                    hxd : item.hxd,
                    precio_venta: 0,
                    variante: item.color.trim(),
                    color: item._id,
                    producto: id,
                    sku: sku,
                    hidden: false,
                });
            }else{
                count_omitidos++;
            }
        }
        res.status(200).send({data:true,count_omitidos});

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const update_password_color = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var data = req.body;
        console.log(data);
        try {
            bcrypt.hash(data.password,null,null, async function(err,hash){
                if(err){
                    res.status(200).send({data:undefined,message:'No se puedo generar la contraseña.'});
                }else{
                    let color = await Color.findByIdAndUpdate({_id:id},{
                        password: hash,
                        str_password: data.password 
                    });
                    res.status(200).send({data:color});
                }
            });
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined,message:'No se pudo agregar el valor.'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_colores = async function(req,res){
    if(req.user){
        var arr_colores = [];
        var colores = await Color.find().sort({color:1});

        for(var item of colores){
            var productos = await Producto_variacion.find({color: item._id,delete:false}).populate('producto');
            var etiquetas = await Color_etiqueta.find({color: item._id});
            let total_prioridad = 0;
            for(var subitem of etiquetas){
                total_prioridad = total_prioridad + subitem.prioridad;
            }

            arr_colores.push({
                color: item,
                productos,
                etiquetas,
                total_prioridad
            });
        }

        arr_colores.sort((a, b) => b.total_prioridad - a.total_prioridad);

        res.status(200).send({data:arr_colores});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_colores_filter = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        var colores = [];
        
        if(filtro == 'Todos'){
            colores = await Color.find().sort({createdAt:-1});
        }else{
            colores = await Color.find(
                {
                  color: {
                    $regex: new RegExp(filtro, 'i'), // Busca "BLACK" en cualquier parte (insensible a mayúsculas y minúsculas)
                  },
                },
                null,
                { sort: { color: 1 } } // Ordena alfabéticamente por color
              ).sort({ createdAt: -1 });
        }
        res.status(200).send({data:colores});
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_color = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        try {
            var color = await Color.findById({_id:id});
            var productos = await Producto_variacion.find({color: id}).populate('producto');
            if(color){
                res.status(200).send({
                    data:color,
                    productos
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

const get_etiquetas_color = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        try {
            let etiquetas = await Color_etiqueta.find({color: id});
            res.status(200).send({data:etiquetas});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}


const update_color = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        var data = req.body;
        try {
            var color = await Color.findById({_id:id});
            
            if(color.password){
                bcrypt.compare(data.password_access,color.password, async function(err,check){
                    if(check){
                        var color = await Color.findByIdAndUpdate({_id:id},{
                            color:data.color.trim(),
                            hxd: data.hxd,
                            primario: data.primario
                        });
                        res.status(200).send({data:color});
                    }else{
                        res.status(200).send({data:undefined,message:'La clave es incorrecta.'});
                    }
                });
            }else{
                var color = await Color.findByIdAndUpdate({_id:id},{
                    color:data.color.trim(),
                    hxd: data.hxd,
                    primario: data.primario
                });
                res.status(200).send({data:color});
            }

            await Producto_variacion.updateMany({color:id,tipo:'Tela'},{
                color_name: data.color.trim(),
                variacion_name: data.color.trim(),
            });

            await Producto_variacion.updateMany({color:id,tipo:'Ropa'},{
                color_name: data.color.trim(),
            });

            await Producto_variacion.updateMany({color:id,tipo:'Acero'},{
                color_name: data.color.trim(),
            });
            
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined,message:'El color no se pudo actualizar.'});
        }

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

module.exports = {
    create_color,
    get_colores,
    get_color,
    get_etiquetas_color,
    update_color,
    get_colores_filter,
    create_color_producto,
    update_password_color,
    add_colores_primarios_producto
}