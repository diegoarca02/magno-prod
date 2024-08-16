'use strict'

var express = require('express');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var port = process.env.PORT || 4201;
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server); 

var route_colaborador = require('./routes/colaborador');
var route_cliente = require('./routes/cliente');
var route_rol = require('./routes/rol');
var route_producto = require('./routes/producto');
var route_proveedor = require('./routes/proveedor');
var route_pedido = require('./routes/pedido');
var route_venta = require('./routes/venta');
var route_kpi = require('./routes/kpi');
var route_informe = require('./routes/informe');
var route_tela = require('./routes/tela');
var route_messages = require('./routes/messages');
var route_cuenta = require('./routes/cuenta');

io.on("connection", (socket) => {
    // ...
    console.log('socket connected MAYO');
    socket.on('send-create-producto',function(data){
        io.emit('emit-create-producto',data);
    });

    socket.on('send-cliente-atendido',function(data){
        io.emit('emit-cliente-atendido',data);
    });

    socket.on('send-update-unidades',function(data){
        io.emit('emit-update-unidades',data);
    });

    socket.on('send-update-pago',function(data){
        io.emit('emit-update-pago',data);
    });
});

mongoose.connect('mongodb://127.0.0.1:27017/magno_',{useUnifiedTopology: true, useNewUrlParser: true}, (err,res)=>{
    if(err){  
        throw err;
        console.log(err);
    }else{
        console.log("Corriendo....");
        server.listen(port, function(){
            console.log("Servidor " + port );
        });
    }
});

app.use(bodyparser.urlencoded({limit: '150mb',extended:true}));
app.use(bodyparser.json({limit: '150mb', extended: true}));

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*'); 
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET, PUT, POST, DELETE, OPTIONS');
    res.header('Allow','GET, PUT, POST, DELETE, OPTIONS');
    next();
});

app.use('/api',route_colaborador);
app.use('/api',route_cliente);
app.use('/api',route_rol);
app.use('/api',route_producto);
app.use('/api',route_proveedor);
app.use('/api',route_pedido);
app.use('/api',route_venta);
app.use('/api',route_kpi);
app.use('/api',route_informe);
app.use('/api',route_tela);
app.use('/api',route_messages);
app.use('/api',route_cuenta);

module.exports = app;


