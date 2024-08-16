var Colaborador = require('../models/Colaborador');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../helpers/jwt');

var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var jwtsimple = require('jwt-simple');
const Rol = require('../models/Rol');
var Permisos = require('../models/Permisos');
const Cliente_agente = require('../models/Cliente_agente');
const WtppController = require('../controllers/WtppController');
const Colaborador_task = require('../models/Colaborador_task');
const Colaborador_permiso = require('../models/Colaborador_permiso');

var moment = require('moment');

const create_colaborador = async function(req,res){
    if(req.user){
        let data = req.body;

        var colaboradores = await Colaborador.find({email:data.email});

        if(colaboradores.length == 0){
            bcrypt.hash(data.password,null,null, async function(err,hash){
                if(err){
                    res.status(200).send({data:undefined,message:'No se puedo generar la contraseña.'});
                }else{
                    data.password = hash;
                    data.fullnames = data.nombres + ' ' + data.apellidos;
                    let colaborador = await Colaborador.create(data);
                    send_email_verificacition(colaborador._id,'Colaborador');
                    res.status(200).send({data:colaborador});
                }
            });
        }else{
            res.status(200).send({data:undefined,message:'Correo electrónico no disponible.'});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const create_colaborador_public = async function(req,res){
    let data = req.body;

    var colaboradores = await Colaborador.find({email:data.email});

    if(colaboradores.length == 0){
        bcrypt.hash(data.password,null,null, async function(err,hash){
            if(err){
                res.status(200).send({data:undefined,message:'No se puedo generar la contraseña.'});
            }else{
                data.password = hash;
                data.fullnames = data.nombres + ' ' + data.apellidos;
                let colaborador = await Colaborador.create(data);
                send_email_verificacition(colaborador._id,'Colaborador');
                res.status(200).send({data:colaborador});
            }
        });
    }else{
        res.status(200).send({data:undefined,message:'Correo electrónico no disponible.'});
    }
}

const create_colaborador_google = async function(req,res){
    let data = req.body;

    var colaboradores = await Colaborador.find({email:data.email});

    if(colaboradores.length == 0){
        bcrypt.hash(data.password,null,null, async function(err,hash){
            if(err){
                res.status(200).send({data:undefined,message:'No se puedo generar la contraseña.'});
            }else{
                data.password = hash;
                data.fullnames = data.nombres + ' ' + data.apellidos;
                let colaborador = await Colaborador.create(data);
                res.status(200).send({
                    data:colaborador,
                    tipo: 'register',
                });
            }
        });
    }else{
        if(colaboradores[0].origen == 'Google'){
            var rol = await Rol.findOne({rol:colaboradores[0].rol});
            var permisos;
            if(rol){
                permisos = await Permisos.find({rol:rol._id});
            }

            if(colaboradores[0].estado){ //VALIDAR ESTADO
                if(colaboradores[0].rol != 'Administrador'){
                    if(colaboradores[0].acceso_entrada && colaboradores[0].acceso_salida){
                        let time = moment().format('H');
                        
                        if(time >= colaboradores[0].acceso_entrada && time <= colaboradores[0].acceso_salida){
                            bcrypt.compare(data.password,colaboradores[0].password, async function(err,check){
                                if(check){
                                    res.status(200).send({
                                        data: colaboradores[0],
                                        tipo: 'login',
                                        token: jwt.createToken(colaboradores[0]),
                                        permisos,
                                        response_tipo: data.tipo
                                    });
                                }else{
                                    res.status(200).send({data:undefined,message:'Las credenciales son incorrectas.'});
                                }
                            });
                        }else{
                            res.status(200).send({data:undefined,message:'El ingreso se encuentra restringido.'});
                        }
                        
                    }else{
                        res.status(200).send({data:undefined,message:'La cuenta no esta configurada.'});
                    }
                }else{
                    bcrypt.compare(data.password,colaboradores[0].password, async function(err,check){
                        if(check){
                            res.status(200).send({
                                data: colaboradores[0],
                                tipo: 'login',
                                token: jwt.createToken(colaboradores[0]),
                                permisos,
                                response_tipo: data.tipo
                            });
                        }else{
                            res.status(200).send({data:undefined,message:'Las credenciales son incorrectas.'});
                        }
                    });
                }
            }else{
                res.status(200).send({data:undefined,message:'La cuenta no tiene acceso.'});
            }
        }else{
            res.status(200).send({data:undefined,message:'Correo electrónico no disponible.'});
        }
    }
}

const update_colaborador = async function(req,res){
    if(req.user){
        let data = req.body;
        let id = req.params['id'];

        data.fullnames = data.nombres + ' ' + data.apellidos;

        try {
            var colaboradores = await Colaborador.find({email:data.email});

            if(colaboradores.length == 0){
                let colaborador = await Colaborador.findByIdAndUpdate({_id:id},{
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    email: data.email,
                    fullnames: data.fullnames,
                    telefono: data.telefono,
                    ine: data.ine,
                    nacimiento: data.nacimiento,
                    pais: data.pais,
                    direccion: data.direccion,
                    rol: data.rol,
                    prefijo: data.prefijo,
                    almacenes: data.almacenes,
                })
            
                res.status(200).send({data:colaborador});
            }else{
                if(colaboradores[0].email == data.email){
                    let colaborador = await Colaborador.findByIdAndUpdate({_id:id},{
                        nombres: data.nombres,
                        apellidos: data.apellidos,
                        email: data.email,
                        fullnames: data.fullnames,
                        telefono: data.telefono,
                        ine: data.ine,
                        nacimiento: data.nacimiento,
                        pais: data.pais,
                        direccion: data.direccion,
                        rol: data.rol,
                        prefijo: data.prefijo,
                        almacenes: data.almacenes,
                    })
                
                    res.status(200).send({data:colaborador});
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

const update_colaborador_modal = async function(req,res){
    if(req.user){
        let data = req.body;
        let id = req.params['id'];
        try {

            let colaborador = await Colaborador.findByIdAndUpdate({_id:id},{
                nacimiento: data.nacimiento,
                prefijo: data.prefijo,
                telefono: data.telefono,
                direccion: data.direccion,
                
            })
        
            res.status(200).send({data:colaborador});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_remuneracion_colaborador = async function(req,res){
    if(req.user){
        let data = req.body;
        let id = req.params['id'];
    
        try {
            let colaborador = await Colaborador.findByIdAndUpdate({_id:id},{
                remuneracion: data.remuneracion
            })
            res.status(200).send({data:colaborador});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_acceso_colaborador = async function(req,res){
    if(req.user){
        let data = req.body;
        let id = req.params['id'];
    
        try {
            let colaborador = await Colaborador.findByIdAndUpdate({_id:id},{
                acceso_entrada: data.acceso_entrada,
                acceso_salida: data.acceso_salida
            })
            res.status(200).send({data:colaborador});
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const set_status_colaborador = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;
        let nuevo_estado;
    
        if(data.estado){
            nuevo_estado = false;
            let reg = await Colaborador.findById({_id:id});
            let estado_clicks = reg.estado_clicks;

            if(reg.estado_clicks == 0 || !reg.estado_clicks) estado_clicks = 1;

            let colaborador = await Colaborador.findByIdAndUpdate({_id:id},{
                estado: nuevo_estado,
                estado_clicks: estado_clicks
            });
            res.status(200).send({data:colaborador});
        }else if(!data.estado){
            nuevo_estado = true;
            let reg = await Colaborador.findById({_id:id});
            let estado_clicks = reg.estado_clicks;

            if(reg.estado_clicks == 0 || !reg.estado_clicks) estado_clicks = 1;
    
            if(reg.rol != 'En espera'){
                let colaborador = await Colaborador.findByIdAndUpdate({_id:id},{
                    estado: nuevo_estado,
                    estado_clicks: estado_clicks
                });
                res.status(200).send({data:colaborador});
            }else{
                res.status(200).send({data:undefined,message:'Para activarse debe tener rol.'});
            }
        }

        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const reset_colaborador_password = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        bcrypt.hash('magno',null,null, async function(err,hash){
            let colaborador = await Colaborador.findByIdAndUpdate({_id:id},{
                password: hash
            });
            res.status(200).send({data:colaborador});
        });
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_colaboradores_admin = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        let colaboradores;
        if(filtro == 'Todos'){
            colaboradores = await Colaborador.find().sort({createdAt:-1});
            res.status(200).send({data:colaboradores});
        }else{
            colaboradores = await Colaborador.find({
                $or: [
                    {nombres: new RegExp(filtro,'i')},
                    {apellidos: new RegExp(filtro,'i')},
                    {telefono: new RegExp(filtro,'i')},
                    {email: new RegExp(filtro,'i')},
                    {fullnames: new RegExp(filtro,'i')},
                    {rol: new RegExp(filtro,'i')},
                ]
            }).sort({createdAt:-1});
            res.status(200).send({data:colaboradores});
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_colaboradores_cliente_admin = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let filtro = req.params['filtro'];
        let colaboradores;

        let data = [];
        let agentes = await Cliente_agente.find({cliente:id});

        console.log(agentes);

        if(filtro == 'Todos'){
            colaboradores = await Colaborador.find().sort({nombres:1});
        }else{
            colaboradores = await Colaborador.find({
                $or: [
                    {nombres: new RegExp(filtro,'i')},
                    {apellidos: new RegExp(filtro,'i')},
                    {telefono: new RegExp(filtro,'i')},
                    {email: new RegExp(filtro,'i')},
                    {fullnames: new RegExp(filtro,'i')},
                    {rol: new RegExp(filtro,'i')},
                ]
            }).sort({nombres:1});
        }

        for(var item of colaboradores){
            let exist = agentes.filter(subitem=> subitem.colaborador.toString() == item._id.toString());
            console.log(exist.length);
            if(exist.length == 0) data.push(item);
        }

        res.status(200).send({data:data});

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_colaborador_admin = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let colaborador = await Colaborador.findById({_id:id});
            res.status(200).send({data:colaborador});
        } catch (error) {
            res.status(200).send({data:undefined,message: 'NoAccess'}); 
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const signin_colaborador = async function(req,res){

    let data = req.body;  
    var colaboradores;

    try {

        if (data.tipo == 'Telefono') {
            colaboradores = await Colaborador.find({telefono: data.username.trim()});
        } else if(data.tipo == 'Email'){
            colaboradores = await Colaborador.find({email: data.username.trim()});
        }


        if(colaboradores.length >= 1){
            var rol = await Rol.findOne({rol:colaboradores[0].rol});
            var permisos = await Permisos.find({rol:rol._id}); 

            if(colaboradores[0].estado){ //VALIDAR ESTADO
                if(colaboradores[0].rol != 'Administrador'){
                    if(colaboradores[0].acceso_entrada && colaboradores[0].acceso_salida){
                        let time = moment().format('HH:mm');
                        const momentEntrada = moment(colaboradores[0].acceso_entrada, 'HH:mm');
                        const momentSalida = moment(colaboradores[0].acceso_salida, 'HH:mm');
                        if(moment(time, 'HH:mm').isBetween(momentEntrada, momentSalida)){
                            bcrypt.compare(data.password,colaboradores[0].password, async function(err,check){
                                if(check){

                                    if(data.tipo == 'Telefono'){ //validar login con telefono
                                        let codigo = Math.floor(Math.random() * (99999 - 10000) + 10000);
                                        await Colaborador.findByIdAndUpdate({_id:colaboradores[0]._id},{
                                            codigo: codigo
                                        });
                                        WtppController.send_codigo_login_wtpp(colaboradores[0]._id,codigo);
                                    }

                                    res.status(200).send({
                                        data: colaboradores[0],
                                        token: jwt.createToken(colaboradores[0]),
                                        permisos,
                                        response_tipo: data.tipo
                                    });
                                }else{
                                    res.status(200).send({data:undefined,message:'Las credenciales son incorrectas.'});
                                }
                            });
                        }else{
                            res.status(200).send({data:undefined,message:'El ingreso se encuentra restringido.'});
                        }
                        
                    }else{
                        res.status(200).send({data:undefined,message:'La cuenta no esta configurada.'});
                    }
                }else{
                    bcrypt.compare(data.password,colaboradores[0].password, async function(err,check){
                        if(check){

                            if(data.tipo == 'Telefono'){ //validar login con telefono
                                let codigo = Math.floor(Math.random() * (99999 - 10000) + 10000);
                                await Colaborador.findByIdAndUpdate({_id:colaboradores[0]._id},{
                                    codigo: codigo
                                });
                                WtppController.send_codigo_login_wtpp(colaboradores[0]._id,codigo);
                            }

                            res.status(200).send({
                                data: colaboradores[0],
                                token: jwt.createToken(colaboradores[0]),
                                permisos,
                                response_tipo: data.tipo
                            });
                        }else{
                            res.status(200).send({data:undefined,message:'Las credenciales son incorrectas.'});
                        }
                    });
                }
            }else{
                res.status(200).send({data:undefined,message:'La cuenta no tiene acceso.'});
            }
        }else{
            res.status(200).send({data:undefined,message:'Las credenciales son incorrectas.'});
        }
    } catch (error) {
        console.log(error);
    }
}

const validar_codigo_colaborador = async function(req,res){
    try {
        let data = req.body;
        var colaboradores = await Colaborador.find({_id: data._id,codigo:data.codigo});
        console.log('Validando codigo');
        if(colaboradores.length >= 1){
            var rol = await Rol.findOne({rol:colaboradores[0].rol});
            var permisos = await Permisos.find({rol:rol._id}); 

            res.status(200).send({
                data: colaboradores[0],
                token: jwt.createToken(colaboradores[0]),
                permisos
            });
        }else{
            res.status(200).send({data:undefined,message:'El código no es el correcto.'});
        }
    } catch (error) {
        res.status(200).send({data:undefined,message:'No se pudo verificar el código.'});
    }
}

const verify_token = async function(req,res){
    if(req.user){
        try {
            let user = await Colaborador.findById({_id:req.user.sub});
            if(user.estado){
                let permisos = await Colaborador_permiso.find({colaborador:req.user.sub});
                console.log(permisos);
                if(user.rol != 'Administrador'){
                    let time = moment().format('HH:mm');
                    const momentEntrada = moment(user.acceso_entrada, 'HH:mm');
                    const momentSalida = moment(user.acceso_salida, 'HH:mm');
                       
                    if(user.acceso_entrada && user.acceso_salida){
                   
                        if(moment(time, 'HH:mm').isBetween(momentEntrada, momentSalida)){

                            res.status(200).send({data:user,permisos});
                        }else{
                            res.status(200).send({data:undefined});
                        }
                    }else{
                        res.status(200).send({data:undefined});
                    }
                }else{
                    res.status(200).send({data:user,permisos});
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

const update_password = async function(req,res){
    if(req.user){
        
        let id = req.params['id'];
        let data = req.body;

        bcrypt.hash(data.password,null,null, async function(err,hash){
            let password = hash;
            let colaborador = await Colaborador.findByIdAndUpdate({_id:id},{
                password: password,
            });
            res.status(200).send({data:colaborador});
        })
    }else{
        res.status(500).send({message: 'NoAccess'});
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

        let colaborador = await Colaborador.findById({_id:id});
        email = colaborador.email;
        var token = jwt.createToken(colaborador);   
        let rest_html = ejs.render(html, {nombres: colaborador.nombres,token:token,tipo:tipo });

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

const get_agentes_admin = async function(req,res){
    if(req.user){
        try {
            let agentes = await Colaborador.find({rol:"Agente",estado:true});
            res.status(200).send({data:agentes});
        } catch (error) {
            res.status(200).send({data:undefined,message: 'NoAccess'}); 
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const actualizar_avatar_colaborador = async function(req,res){
    if(req.user){
        let data = req.body;
        try {
            var avatar_name = req.files[0].location;

            let colaborador = await Colaborador.findById({_id:req.user.sub});
            await Colaborador.findByIdAndUpdate({_id:req.user.sub},{
                avatar: avatar_name
            })

            res.status(200).send({data:avatar_name});
        } catch (error) {
            res.status(200).send({message:'Ocurrio un error en el servidor',data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const mostrar_avatar_colaborador = async function(req,res){
    var img = req.params['img'];

    fs.stat('./uploads/avatars/'+img, function(err){
        if(!err){
            let path_img = './uploads/avatars/'+img;
            res.status(200).sendFile(path.resolve(path_img));
        }else{
            let path_img = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_img));
        }
    })
}
 const reenviar_codigo_login = async function(req,res){
    var id = req.params['id'];
    let codigo = Math.floor(Math.random() * (99999 - 10000) + 10000);
    let user = await Colaborador.findByIdAndUpdate({_id:id},{
        codigo: codigo
    });
    WtppController.send_codigo_login_wtpp(id,codigo);
    res.status(200).send({data:user});
}

const obtener_tareas_colaborador = async function(req,res){
    if(req.user){
        try {
            let periodo = req.params['periodo'];
            let estado = req.params['estado'];

            var año = parseInt(periodo.split('-')[0]);
            var mes = parseInt(periodo.split('-')[1]);

            var primerDia = new Date(año, mes - 1, 1);
            var ultimoDia = new Date(año, mes, 0); 

            var arr_dias = [];
            var data_dias = [];
            for (var i = primerDia.getDate(); i <= ultimoDia.getDate(); i++) {
                var dia = moment(new Date(año, mes - 1, i)).format('YYYY-MM-DD');
                arr_dias.push({
                    dia: dia,
                    tareas: [],
                    realizados: 0,
                    porcent_pendientes: 0,
                });
            }

            if(estado == 'Todos'){
                for(var item of arr_dias){
                    let tareas = await Colaborador_task.find({
                        colaborador:req.user.sub,
                        date_realizar: {
                            $gte: new Date(item.dia+'T00:00:00'),
                            $lt: new Date(item.dia+'T23:59:59')
                        }
                    }).populate('colaborador').sort({createdAt:-1});
                    item.tareas.push(...tareas);
                    console.log("TAREAS - "+tareas.length);
                }
                
             
            }else{
                let _estado;
                if(estado == 'Pendientes') _estado = false;
                else if(estado == 'Realizados') _estado = true;

                for(var item of arr_dias){
                    let tareas = await Colaborador_task.find({
                        colaborador:req.user.sub,
                        estado: _estado,
                        date_realizar: {
                            $gte: new Date(item.dia+'T00:00:00'),
                            $lt: new Date(item.dia+'T23:59:59')
                        }
                    }).populate('colaborador').sort({createdAt:-1});
                    item.tareas.push(...tareas);
                    console.log("TAREAS - "+tareas.length);
                }

            }

            for(var item of arr_dias){
                if(item.tareas.length >= 1){
                    data_dias.push(item);
                }
            }

            for(var item of data_dias){
                item.realizados = item.tareas.filter(subitem=> subitem.estado);
                item.tareas.sort((a, b) => {
                    let dateA = new Date(a.fecha_programada);
                    let dateB = new Date(b.fecha_programada);
                    return dateA + dateB;
                });
                item.porcent_pendientes = (item.realizados.length/item.tareas.length)*100;
                
            }
            

            res.status(200).send({data:data_dias});
        } catch (error) {
            console.log(error);
            res.status(200).send({message:'Ocurrio un error en el servidor',data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const crear_tarea_colaborador = async function(req,res){
    if(req.user){
        let data = req.body;
        try {
            data.colaborador = req.user.sub;
            let task = await Colaborador_task.create(data);
            res.status(200).send({data:task});
        } catch (error) {
            console.log(error);
            res.status(200).send({message:'Ocurrio un error en el servidor',data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const marcar_tarea_colaborador = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let tarea = await Colaborador_task.findByIdAndUpdate({_id:id},{
                estado:'Realizado',
                date_marca: Date.now()
            });
            res.status(200).send({data:tarea});
        } catch (error) {
            res.status(200).send({message:'Ocurrio un error en el servidor',data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const posponer_tarea_colaborador = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let data = req.body;
            let tarea = await Colaborador_task.findByIdAndUpdate({_id:id},{
                pospuesto:true,
                date_realizar: data.date_realizar
            });
            res.status(200).send({data:tarea});
        } catch (error) {
            res.status(200).send({message:'Ocurrio un error en el servidor',data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const cancelar_tarea_colaborador = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let tarea = await Colaborador_task.findByIdAndUpdate({_id:id},{
                date_realizar: new Date().getTime(),
                estado: 'Cancelado'
            });
            res.status(200).send({data:tarea});
        } catch (error) {
            res.status(200).send({message:'Ocurrio un error en el servidor',data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_tareas_pendientes_colaborador = async function(req,res){
    if(req.user){
        try {
            let tareas_completas = await Colaborador_task.find({colaborador:req.user.sub,estado:false});
            let tareas = await Colaborador_task.find({colaborador:req.user.sub,$ne: {estado: 'Pendiente'}}).sort({createdAt:-1});
            console.log(req.user.sub);
            console.log(tareas.length + ' Tareas');
            res.status(200).send({data:tareas,total: tareas_completas.length});
        } catch (error) {
            res.status(200).send({message:'Ocurrio un error en el servidor',data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const obtener_permisos_colaborador = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        try {
            let colaborador = await Colaborador.findById({_id:id});
            let permisos = await Colaborador_permiso.find({colaborador:id});
            if(colaborador == undefined){
                res.status(200).send({data:undefined});
            }else{
                res.status(200).send({data:colaborador,permisos});
            }
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const update_permiso_colaborador = async function(req,res){
    if(req.user){
        
        let data = req.body;
      
        let permisos = await Colaborador_permiso.find({permiso:data.permiso,colaborador:data.colaborador});
        let permiso;

        if(permisos.length == 0){
            permiso = await Colaborador_permiso.create({
                colaborador: data.colaborador,
                permiso: data.permiso,
            });
        }else{
            permiso = await Colaborador_permiso.findByIdAndRemove({_id: permisos[0]._id});
        }

        res.status(200).send({data:permiso});
        
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}


module.exports = {
    create_colaborador,
    get_colaboradores_admin,
    get_colaborador_admin,
    signin_colaborador,
    update_colaborador,
    update_colaborador_modal,
    set_status_colaborador,
    reset_colaborador_password,
    update_remuneracion_colaborador,
    verify_token,
    update_password,
    get_agentes_admin,
    actualizar_avatar_colaborador,
    mostrar_avatar_colaborador,
    get_colaboradores_cliente_admin,
    update_acceso_colaborador,
    validar_codigo_colaborador,
    reenviar_codigo_login,
    create_colaborador_public,
    create_colaborador_google,
    obtener_tareas_colaborador,
    crear_tarea_colaborador,
    marcar_tarea_colaborador,
    posponer_tarea_colaborador,
    obtener_tareas_pendientes_colaborador,
    cancelar_tarea_colaborador,
    obtener_permisos_colaborador,
    update_permiso_colaborador
}
