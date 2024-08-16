var express = require('express');
var PagosController = require('../controllers/PagosController');
var auth = require('../middlewares/authenticate');
var app = express.Router();

app.post('/create_cuenta',auth.decodeToken,PagosController.create_cuenta);
app.get('/get_cuentas',auth.decodeToken,PagosController.get_cuentas);
app.get('/get_cuenta/:id',auth.decodeToken,PagosController.get_cuenta);
app.put('/update_cuenta/:id',auth.decodeToken,PagosController.update_cuenta);
app.get('/get_cuentas_destacadas',auth.decodeToken,PagosController.get_cuentas_destacadas);
app.get('/get_transacciones_venta/:id',auth.decodeToken,PagosController.get_transacciones_venta);

module.exports = app;
