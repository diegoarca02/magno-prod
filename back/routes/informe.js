var express = require('express');
var InformeController = require('../controllers/InformeController');
var auth = require('../middlewares/authenticate');
var app = express.Router();

app.get('/inf_pedidos/:id',auth.decodeToken,InformeController.inf_pedidos);
app.get('/inf_pedidos_completo/:id',auth.decodeToken,InformeController.inf_pedidos_completo);
app.get('/inf_pedido_clientes/:id',auth.decodeToken,InformeController.inf_pedido_clientes);

module.exports = app;