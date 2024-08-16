var Rol = require('../models/Rol');
var Permisos = require('../models/Permisos');
var Colaborador = require('../models/Colaborador');

const get_only_roles = async function(req,res){
    if(req.user){
        var data = [];
        var roles = await Rol.find().sort({permiso:1});
        
        res.status(200).send({data:roles});

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_roles = async function(req,res){
    if(req.user){
        var data = [];
        var roles = await Rol.find().sort({permiso:1});
        for(var item of roles){
            var permisos = await Permisos.find({rol:item._id});
            var colaboradores = await Colaborador.find({rol:item.rol});
            data.push({
                rol: item,
                permisos,
                users: colaboradores.length
            });
        }
        res.status(200).send({data:data});

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const create_rol = async function(req,res){
    if(req.user){
        var data = req.body;

        var roles = await Rol.find({rol:data.rol});

        if(roles.length == 0){
            var rol = await Rol.create(data);
            for(var item of data.permisos){
                item.rol = rol._id;
                await Permisos.create(item);
            }
            res.status(200).send({data:rol});
        }else{
            res.status(200).send({data:undefined,message: 'El rol ya existe actualmente.'});
        }

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const edit_titulo_rol = async function(req,res){
    if(req.user){
        var data = req.body;
        var id = req.params['id'];
        var roles = await Rol.find({rol:data.rol});

        if(roles.length == 0){
            let rol = await Rol.findByIdAndUpdate({_id:id},{
                rol: data.rol
            });

            let colaboradores = await Colaborador.find({rol:rol.rol});
            for(var item of colaboradores){
                await Colaborador.findByIdAndUpdate({_id:item._id},{
                    rol: data.rol
                });
            }
            res.status(200).send({data:rol});
        }else{
            res.status(200).send({data:undefined,message: 'El título ya existe actualmente.'});
        }

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_rol = async function(req,res){
    if(req.user){
        var id = req.params['id'];

        try {
           var rol = await Rol.findById({_id:id});
           var permisos = await Permisos.find({rol:id}); 
           var colaboradores = await Colaborador.find({rol:rol.rol});

           res.status(200).send({data:true,permisos,rol,colaboradores});
        } catch (error) {
            res.status(200).send({data:undefined});
        }

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const update_permisos_rol = async function(req,res){
    if(req.user){
        var id = req.params['id'];
        var data = req.body;

        try {
            await Permisos.deleteMany({rol:id});
            for(var item of data.permisos){
                item.rol = id;
                await Permisos.create(item);
            }
            res.status(200).send({data:true});
        } catch (error) {
            console.log(error);
            res.status(200).send({data:undefined});
        }

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const delete_rol = async function(req,res){
    if(req.user){
        var id = req.params['id'];

        try {
            let rol = await Rol.findById({_id:id});
            if(rol){
                let colaboradores = await Colaborador.find({rol: rol.rol});
                await Permisos.remove({rol:id});

                for(var item of colaboradores){
                    await Colaborador.findByIdAndUpdate({_id: item._id},{
                        rol: '',
                        estado: false
                    });
                }

                await Rol.findByIdAndRemove({_id:id});
                
                res.status(200).send({data:true});
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
    get_only_roles,
    create_rol,
    get_roles,
    get_rol,
    update_permisos_rol,
    edit_titulo_rol,
    delete_rol
}