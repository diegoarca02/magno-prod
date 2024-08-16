var express = require('express');
var ClienteController = require('../controllers/ClienteController');
/* var auth = require('../middlewares/authenticate-admin'); */
var auth = require('../middlewares/authenticate');
var app = express.Router();

app.post('/create_cliente',auth.decodeToken,ClienteController.create_cliente);
app.post('/create_cliente_facturacion',auth.decodeToken,ClienteController.create_cliente_facturacion);

app.get('/get_clientes_admin/:filtro',auth.decodeToken,ClienteController.get_clientes_admin);
app.get('/get_clientes_facturacion_cliente/:id',auth.decodeToken,ClienteController.get_clientes_facturacion_cliente);
app.get('/get_clientes_facturacion_empresa/:id',auth.decodeToken,ClienteController.get_clientes_facturacion_empresa);
app.delete('/delete_cliente_facturacion/:id',auth.decodeToken,ClienteController.delete_cliente_facturacion);


app.get('/get_clientes_facturacion',auth.decodeToken,ClienteController.get_clientes_facturacion);
app.post('/add_cliente_facturacion',auth.decodeToken,ClienteController.add_cliente_facturacion)
app.get('/get_empresa_rs_admin/:filtro',auth.decodeToken,ClienteController.get_empresa_rs_admin);
app.get('/get_empresa_clientes/:filtro',auth.decodeToken,ClienteController.get_empresa_clientes);
app.get('/get_empresa_clientes_todos/:filtro',auth.decodeToken,ClienteController.get_empresa_clientes_todos);
app.get('/get_clientes_latest',auth.decodeToken,ClienteController.get_clientes_latest);
app.get('/get_pagos_clientes/:id',auth.decodeToken,ClienteController.get_pagos_clientes);
app.get('/get_ventas_clientes/:id',auth.decodeToken,ClienteController.get_ventas_clientes);

app.get('/get_creditos_cliente/:id',auth.decodeToken,ClienteController.get_creditos_cliente);
app.get('/get_solicitudes_cliente/:id',auth.decodeToken,ClienteController.get_solicitudes_cliente);


app.get('/get_cliente_cobranza_admin/:id/:tipo',auth.decodeToken,ClienteController.get_cliente_cobranza_admin);
app.get('/get_cliente_admin/:id',auth.decodeToken,ClienteController.get_cliente_admin);
app.put('/update_cliente/:id',auth.decodeToken,ClienteController.update_cliente);
app.put('/update_cliente_umedida/:id',auth.decodeToken,ClienteController.update_cliente_umedida);

app.get('/verification_email_cliente/:tipo/:token',ClienteController.verification_email_cliente);
app.get('/get_ubicaciones_clientes/:id/:tipo',auth.decodeToken,ClienteController.get_ubicaciones_clientes);
app.get('/get_ubicaciones_empresa/:id',auth.decodeToken,ClienteController.get_ubicaciones_empresa);

app.post('/create_ubicacion_clientes',auth.decodeToken,ClienteController.create_ubicacion_clientes);
app.post('/create_ubicacion_empresa',auth.decodeToken,ClienteController.create_ubicacion_empresa);

app.put('/update_ubicacion_cliente/:id',auth.decodeToken,ClienteController.update_ubicacion_cliente);
app.post('/update_cliente_credito',auth.decodeToken,ClienteController.update_cliente_credito);
app.post('/update_reduccion_cliente_credito',auth.decodeToken,ClienteController.update_reduccion_cliente_credito);

app.get('/get_credito_cliente/:id/:tipo',auth.decodeToken,ClienteController.get_credito_cliente);
app.get('/obtener_solicitudes_abiertas',auth.decodeToken,ClienteController.obtener_solicitudes_abiertas);

app.get('/get_ubicacion_cliente/:id',auth.decodeToken,ClienteController.get_ubicacion_cliente);
app.get('/delete_ubicacion_cliente/:id',auth.decodeToken,ClienteController.delete_ubicacion_cliente);
app.put('/set_status_cliente/:id',auth.decodeToken,ClienteController.set_status_cliente);

app.get('/get_empresas_admin/:filtro',auth.decodeToken,ClienteController.get_empresas_admin);
app.get('/get_data_empresa/:id',auth.decodeToken,ClienteController.get_data_empresa);
app.post('/add_cliente_empresa_rs',auth.decodeToken,ClienteController.add_cliente_empresa_rs);
app.post('/add_empresa_rs',auth.decodeToken,ClienteController.add_empresa_rs);
app.put('/set_status_empresa/:id',auth.decodeToken,ClienteController.set_status_empresa);
app.get('/set_solicitud_credito/:id/:estado',auth.decodeToken,ClienteController.set_solicitud_credito);

app.get('/update_tiempo_credito_cliente/:id/:tipo/:limit_days',auth.decodeToken,ClienteController.update_tiempo_credito_cliente);
app.get('/obtener_envios_notas/:id',auth.decodeToken,ClienteController.obtener_envios_notas);
app.get('/obtener_clientes_notas',auth.decodeToken,ClienteController.obtener_clientes_notas);
app.get('/obtener_deudas_comprador/:id',auth.decodeToken,ClienteController.obtener_deudas_comprador);

app.delete('/remove_cliente_agente/:id',auth.decodeToken,ClienteController.remove_cliente_agente);
app.post('/agregar_cliente_agente',auth.decodeToken,ClienteController.agregar_cliente_agente);


module.exports = app;
