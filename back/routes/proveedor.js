var express = require('express');
var ProveedorController = require('../controllers/ProveedorController');
/* var auth = require('../middlewares/authenticate-admin'); */
var auth = require('../middlewares/authenticate');
var app = express.Router();

app.post('/create_proveedor',auth.decodeToken,ProveedorController.create_proveedor);
app.get('/get_proveedores/:filtro',auth.decodeToken,ProveedorController.get_proveedores);
app.put('/set_status_proveedor/:id',auth.decodeToken,ProveedorController.set_status_proveedor);
app.get('/get_proveedor_admin/:id',auth.decodeToken,ProveedorController.get_proveedor_admin);
app.put('/update_proveedor/:id',auth.decodeToken,ProveedorController.update_proveedor);
app.get('/get_cuentas_proveedor/:id',auth.decodeToken,ProveedorController.get_cuentas_proveedor);
app.post('/create_cuenta_proveedor',auth.decodeToken,ProveedorController.create_cuenta_proveedor);
app.delete('/delete_cuenta_proveedor/:id',auth.decodeToken,ProveedorController.delete_cuenta_proveedor);


module.exports = app;
