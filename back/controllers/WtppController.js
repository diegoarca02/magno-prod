var Message_wtpp = require('../models/Message_wtpp');
var Venta= require('../models/Venta');
var GLOBAL = require('../GLOBAL');
var moment = require('moment');
const Colaborador = require('../models/Colaborador');
const Programacion = require('../models/Programacion');

const send_message_wtpp = async function(req,res){
    let body = {
        action: 'pafe_ajax_form_builder',
        post_id: 28278,
        form_id: 14835887, 
        fields: [
            {
                "label":"Nombre y Apellido",
                "name":"Nombre",
                "image_upload":false,
                "value_not_prefix":"Alonso",
                "value":"Alonso",
                "type":"text",
                "repeater_id":"",
                "repeater_id_one":"",
                "repeater_label":"",
                "repeater_index":-1,
                "repeater_length":0
            },
            {
                "label":"Email",
                "name":"fjabafg",
                "image_upload":false,
                "value_not_prefix":"alonso2987@gmail.com",
                "value":"alonso2987@gmail.com",
                "type":"email",
                "repeater_id":"",
                "repeater_id_one":"",
                "repeater_label":"",
                "repeater_index":-1,
                "repeater_length":0
            },{
                "label":"Categoria",
                "name":"gacfegh",
                "image_upload":true,
                "value_not_prefix":"linajeperuano",
                "value":"linajeperuano",
                "repeater_id":"",
                "repeater_id_one":"",
                "repeater_label":"",
                "repeater_index":-1,
                "repeater_length":0
            }
        ],
        remote_ip: '179.6.100.11',
    };
    const response = await fetch('https://premioinspira2023.pe/wp-admin/admin-ajax.php',{
        method: 'post',
        body: body,
        headers: {
            'Content-Type' : 'multipart/form-data',
        }
    });
    console.log(response);
    const data = await response.json();
    res.status(200).send(response);
}

const send_resumen_venta_wtpp = async function(id){
    let venta = await Venta.findOne({_id:id}).populate('cliente');
    
    if(venta){
        let date_venta = moment(venta.createdAt).format('YYYY-MM-DD');
        let serie_venta = venta.year+"-"+venta.serie.toString().padStart(6,'000000');

        
        let txt_msm = {
            to: venta.cliente.prefijo+''+venta.cliente.telefono, 
            from: GLOBAL.GLOBAL.channel_wtpp,
            type: "text",
            content: {
                text: "Hola " + venta.cliente.nombres + ' ' + venta.cliente.apellidos + ",\nLe confirmamos la orden de venta que hemos preparado para ti. A continuación, encontrarás los detalles:\n\n" +
                  "*Cliente:* " + venta.cliente.nombres + ' ' + venta.cliente.apellidos + "\n" +
                  "*Fecha de la Orden:* " + date_venta + "\n" +
                  "*Número de Orden:* " + serie_venta + "\n\n" + 
                  "*¡Saludos cordiales!*"
              }
        }

        let doc_msm = {
            to: venta.cliente.prefijo+''+venta.cliente.telefono, 
            from: GLOBAL.GLOBAL.channel_wtpp,
            type: "image",
            content: {
                image: {
                    url: venta.file
                }
            },
        }

        const response1 = await fetch('https://conversations.messagebird.com/v1/send',{
            method: 'post',
            body: JSON.stringify(txt_msm),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : 'AccessKey 9JSzfMjLWvJ51W8UErxlVnMpl',
            }
        });

        const response2 = await fetch('https://conversations.messagebird.com/v1/send',{
            method: 'post',
            body: JSON.stringify(doc_msm),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : 'AccessKey 9JSzfMjLWvJ51W8UErxlVnMpl',
            }
        });

        console.log(venta.file);
        const data = await response2.json();
        console.log(data);
    }
}

const send_confirmacion_venta_wtpp = async function(id){

    let venta = await Venta.findOne({_id:id}).populate('cliente');

    if(venta){
        let date_venta = moment(venta.createdAt).format('YYYY-MM-DD');
        let serie_venta = venta.year+"-"+venta.serie.toString().padStart(6,'000000');

        let txt_msm = {
            to: venta.cliente.prefijo+''+venta.cliente.telefono, 
            from: GLOBAL.GLOBAL.channel_wtpp,
            type: "text",
            content: {
                text: "Estimado/a " + venta.cliente.nombres + " " + venta.cliente.apellidos + ",\n\nLe confirmamos la aprobación de su venta. A continuación, encontrará los detalles de la transacción:\n\n" +
                  "*Fecha de la Orden:* "+date_venta+"\n" + // Fecha de la Orden en negrita
                  "*Número de Orden:* "+serie_venta+"\n" + // Número de Orden en negrita
                  "*Total de la Orden:* $"+venta.monto_total+"\n" + // Total de la Orden en negrita
                  "\n*Saludos cordiales.*" // Saludos cordiales en negrita
              }
        }
    
        const response1 = await fetch('https://conversations.messagebird.com/v1/send',{
            method: 'post',
            body: JSON.stringify(txt_msm),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : 'AccessKey 9JSzfMjLWvJ51W8UErxlVnMpl',
            }
        });
    
        const data = await response1.json();
    }

}

const send_envio_venta_wtpp = async function(id){

    let venta = await Venta.findOne({_id:id}).populate('cliente');

    if(venta){
        let date_venta = moment(venta.createdAt).format('YYYY-MM-DD');
        let serie_venta = venta.year+"-"+venta.serie.toString().padStart(6,'000000');

        let txt_msm = {
            to: venta.cliente.prefijo+''+venta.cliente.telefono, 
            from: GLOBAL.GLOBAL.channel_wtpp,
            type: "text",
            content: {
                text: "Estimado/a " + venta.cliente.nombres + " " + venta.cliente.apellidos + ",\n\nTu paquete está en camino y deberías recibirlo pronto. A continuación, encontrarás los detalles de la transacción:\n\n" +
                  "*Fecha de la Orden:* " + date_venta + "\n" + // Fecha de la Orden en negrita
                  "*Número de Orden:* " + serie_venta + "\n" + // Número de Orden en negrita
                  "*Tracking:* " + venta.tracking + "\n" + // Tracking en negrita
                  "*Total de la Orden:* $" + venta.monto_total + "\n" + // Total de la Orden en negrita
                  "\n*Saludos cordiales.*" // Saludos cordiales en negrita
            }
        }
    
        const response1 = await fetch('https://conversations.messagebird.com/v1/send',{
            method: 'post',
            body: JSON.stringify(txt_msm),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : 'AccessKey 9JSzfMjLWvJ51W8UErxlVnMpl',
            }
        });
    
        const data = await response1.json();
    }

}

const send_recepcion_venta_wtpp = async function(id){

    let venta = await Venta.findOne({_id:id}).populate('cliente');

    if(venta){
        let date_venta = moment(venta.createdAt).format('YYYY-MM-DD');
        let serie_venta = venta.year+"-"+venta.serie.toString().padStart(6,'000000');

        let txt_msm = {
            to: venta.cliente.prefijo+''+venta.cliente.telefono, 
            from: GLOBAL.GLOBAL.channel_wtpp,
            type: "text",
            content: {
                text: "Estimado/a " + venta.cliente.nombres + " " + venta.cliente.apellidos + ",\n\nQueremos confirmar la recepción exitosa de tu pedido. A continuación, encontrarás los detalles de la transacción:\n\n" +
                  "*Fecha de la Orden:* " + date_venta + "\n" + // Fecha de la Orden en negrita
                  "*Número de Orden:* " + serie_venta + "\n" + // Número de Orden en negrita
                  "\n*Saludos cordiales.*" // Saludos cordiales en negrita
              }
        }
    
        const response1 = await fetch('https://conversations.messagebird.com/v1/send',{
            method: 'post',
            body: JSON.stringify(txt_msm),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : 'AccessKey 9JSzfMjLWvJ51W8UErxlVnMpl',
            }
        });
    
        const data = await response1.json();
    }

}

const send_codigo_login_wtpp = async function(id,codigo){

    let colaborador = await Colaborador.findOne({_id:id});

    if(colaborador){
        let txt_msm = {
            to: colaborador.prefijo+''+colaborador.telefono, 
            from: GLOBAL.GLOBAL.channel_wtpp,
            type: "text",
            content:{text: "Tú código de acceso es: " + codigo}
        }

        console.log(txt_msm);
    
        const response1 = await fetch('https://conversations.messagebird.com/v1/send',{
            method: 'post',
            body: JSON.stringify(txt_msm),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : 'AccessKey 9JSzfMjLWvJ51W8UErxlVnMpl',
            }
        });
    
        const data = await response1.json();
    }

}

const send_resumen_programacion_wtpp = async function(id){
    let programacion = await Programacion.findOne({_id:id}).populate('cliente');
    
    if(programacion){
        let date_programacion = moment(programacion.createdAt).format('YYYY-MM-DD');
        let serie_programacion = new Date(programacion.createdAt).getFullYear()+"-"+programacion.serie.toString().padStart(6,'000000');

        
        let txt_msm = {
            to: programacion.cliente.prefijo+''+programacion.cliente.telefono, 
            from: GLOBAL.GLOBAL.channel_wtpp,
            type: "text",
            content: {
                text: "Hola " + programacion.cliente.nombres + ' ' + programacion.cliente.apellidos + ",\nLe confirmamos el pedido de programación que hemos registrado para ti. A continuación, encontrarás los detalles:\n\n" +
                  "*Cliente:* " + programacion.cliente.nombres + ' ' + programacion.cliente.apellidos + "\n" +
                  "*Fecha de la Orden:* " + date_programacion + "\n" +
                  "*Número de Orden:* " + serie_programacion + "\n\n" + 
                  "*¡Saludos cordiales!*"
              }
        }

        let doc_msm = {
            to: programacion.cliente.prefijo+''+programacion.cliente.telefono, 
            from: GLOBAL.GLOBAL.channel_wtpp,
            type: "image",
            content: {
                image: {
                    url: programacion.file
                }
            },
        }

        const response1 = await fetch('https://conversations.messagebird.com/v1/send',{
            method: 'post',
            body: JSON.stringify(txt_msm),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : 'AccessKey 9JSzfMjLWvJ51W8UErxlVnMpl',
            }
        });

        const response2 = await fetch('https://conversations.messagebird.com/v1/send',{
            method: 'post',
            body: JSON.stringify(doc_msm),
            headers: {
                'Content-Type' : 'application/json',
                'Authorization' : 'AccessKey 9JSzfMjLWvJ51W8UErxlVnMpl',
            }
        });

        console.log(programacion.file);
        const data = await response2.json();
        console.log(data);
    }
}

module.exports = {
    send_resumen_venta_wtpp,
    send_confirmacion_venta_wtpp,
    send_envio_venta_wtpp,
    send_recepcion_venta_wtpp,
    send_codigo_login_wtpp,
    send_resumen_programacion_wtpp,
    send_message_wtpp
}