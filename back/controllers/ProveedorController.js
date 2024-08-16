var Proveedor = require('../models/Proveedor');
var Proveedor_cuenta = require('../models/Proveedor_cuenta');

var jwt = require('../helpers/jwt-proveedor');

var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var jwtsimple = require('jwt-simple');

const create_proveedor = async function(req,res){
    if(req.user){
        var data = req.body;

        var proveedores = await Proveedor.find({razon_social:data.razon_social});
        
        if(proveedores.length == 0){
            var proveedor = await Proveedor.create(data);
            if(data.cuentas.length >= 1){
                for(var item of data.cuentas){
                    item.proveedor = proveedor._id;
                    await Proveedor_cuenta.create(item);
                }
            }

            send_email_verificacition(proveedor._id,'Proveedor');
            res.status(200).send({data:proveedor});
        }else{
            res.status(200).send({data:undefined,message: 'La razón social no esta disponible.'});
        }

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const get_proveedores = async function(req,res){
    if(req.user){
        let filtro = req.params['filtro'];
        if(filtro == 'Todos'){
            let proveedores = await Proveedor.find().sort({createdAt:-1});;
            res.status(200).send({data:proveedores});
        }else{
            let proveedores = await Proveedor.find({
                $or: [
                    {razon_social: new RegExp(filtro,'i')},
                    {encargado: new RegExp(filtro,'i')},
                    {telefono: new RegExp(filtro,'i')},
                    {email: new RegExp(filtro,'i')},
                ]
            }).sort({razon_social:1});
            res.status(200).send({data:proveedores});
        }

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const set_status_proveedor = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let data = req.body;
        let nuevo_status;
    
        console.log(data.status);
        if(data.status){
            nuevo_status = false;
        }else if(!data.status){
            nuevo_status = true;
        }
    
        let proveedor = await Proveedor.findByIdAndUpdate({_id:id},{
            status: nuevo_status
        });
        res.status(200).send({data:proveedor});
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
    
}

const get_proveedor_admin = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let proveedor = await Proveedor.findById({_id:id});
            res.status(200).send({data:proveedor});
        } catch (error) {
            res.status(200).send({data:undefined,message: 'NoAccess'}); 
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const update_proveedor = async function(req,res){
    if(req.user){
        let data = req.body;
        let id = req.params['id'];

        try {
            var proveedores = await Proveedor.find({razon_social:data.razon_social});

            if(proveedores.length == 0){
                let proveedor = await Proveedor.findByIdAndUpdate({_id:id},{
                    razon_social: data.razon_social,
                    email: data.email,
                    telefono: data.telefono,
                    encargado: data.encargado,
                    prefijo: data.prefijo,
                    direccion: data.direccion,
                    estado: data.estado,
                    ciudad: data.ciudad,
                })
            
                res.status(200).send({data:proveedor});
            }else{
                if(proveedores[0].email == data.email || proveedores[0].razon_social == data.razon_social){
                    let proveedor = await Proveedor.findByIdAndUpdate({_id:id},{
                        razon_social: data.razon_social,
                        email: data.email,
                        telefono: data.telefono,
                        encargado: data.encargado,
                        prefijo: data.prefijo,
                        direccion: data.direccion,
                        estado: data.estado,
                        ciudad: data.ciudad,
                    })
                
                    res.status(200).send({data:proveedor});
                }else{
                    res.status(200).send({data:undefined,message:'Razón social no disponible.'});
                }
            }
        } catch (error) {
            res.status(200).send({data:undefined});
        }
    }else{
        res.status(500).send({message: 'NoAccess'});
    }
}

const get_cuentas_proveedor = async function(req,res){
    if(req.user){
        try {
            let id = req.params['id'];
            let cuentas = await Proveedor_cuenta.find({proveedor:id});
            res.status(200).send({data:cuentas});
        } catch (error) {
            res.status(200).send({data:undefined,message: 'NoAccess'}); 
        }
    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const create_cuenta_proveedor = async function(req,res){
    if(req.user){
        var data = req.body;

        let cuenta = await Proveedor_cuenta.create(data);
        res.status(200).send({data:cuenta});

    }else{
        res.status(500).send({message: 'NoAccess'}); 
    }
}

const delete_cuenta_proveedor = async function(req,res){
    if(req.user){
        let id = req.params['id'];
        let reg = await Proveedor_cuenta.findByIdAndRemove({_id:id})
        res.status(200).send({data:reg});
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
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: 'diegoarca02@gmail.com',
            pass: 'ogfvvlxksebtrkfj'
        }
    }));


    readHTMLFile(process.cwd() + '/mails/email-verification.html', async (err, html)=>{
        let email;

        let proveedor = await Proveedor.findById({_id:id});
        email = proveedor.email;
        var token = jwt.createToken(proveedor);   
        let rest_html = ejs.render(html, {nombres: proveedor.razon_social,token:token,tipo:tipo });

        var template = handlebars.compile(rest_html);
        var htmlToSend = template({op:true});

        var mailOptions = {
            from: '"Magno" <diegoarca02@gmail.com>',
            to: email,
            subject: 'Verificación de correo eletrónico.',
            html: htmlToSend
        };
      
        transporter.sendMail(mailOptions, async function(error, info){
            if (!error) {
                console.log(info);
            }
        });
    
    });
}


module.exports = {
    create_proveedor,
    get_proveedores,
    set_status_proveedor,
    get_proveedor_admin,
    update_proveedor,
    get_cuentas_proveedor,
    create_cuenta_proveedor,
    delete_cuenta_proveedor,
}