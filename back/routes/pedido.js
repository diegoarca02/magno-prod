var express = require('express');
var PedidoController = require('../controllers/PedidoController');
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/envios'});
var app = express.Router();

var upload = require('../helpers/uploads');
const path_upload = upload('envios');

app.post('/create_pedido',auth.decodeToken,PedidoController.create_pedido);
app.post('/create_pedido_ropa',auth.decodeToken,PedidoController.create_pedido_ropa);

app.get('/get_pedidos/:estado/:page',auth.decodeToken,PedidoController.get_pedidos);
app.get('/get_pedido/:id',auth.decodeToken,PedidoController.get_pedido);
app.get('/get_pedido_serie/:serie',auth.decodeToken,PedidoController.get_pedido_serie);
app.get('/get_envios_pedido',auth.decodeToken,PedidoController.get_envios_pedido);
app.get('/get_envio_pedido/:id',auth.decodeToken,PedidoController.get_envio_pedido);


app.get('/get_pedido_serie_ropa/:serie',auth.decodeToken,PedidoController.get_pedido_serie_ropa);


app.get('/get_pedido_public/:id',PedidoController.get_pedido_public);
app.get('/send_email_pedido/:id/:email',auth.decodeToken,PedidoController.send_email_pedido);
app.get('/send_email_programacion/:id/:proveedor/:email',auth.decodeToken,PedidoController.send_email_programacion);
app.get('/eliminar_rollo_interno/:id',auth.decodeToken,PedidoController.eliminar_rollo_interno);

app.put('/update_estado_pedido/:id',auth.decodeToken,PedidoController.update_estado_pedido);
app.get('/get_detalle_pedido/:id',auth.decodeToken,PedidoController.get_detalle_pedido);
app.get('/obtener_pedidos_detalles_aprobados',auth.decodeToken,PedidoController.obtener_pedidos_detalles_aprobados);

app.post('/create_envio_detalle',[auth.decodeToken,path],PedidoController.create_envio_detalle);
app.post('/create_envio_pedido',auth.decodeToken,PedidoController.create_envio_pedido);
app.post('/create_ingreso',auth.decodeToken,PedidoController.create_ingreso);

app.get('/get_ingresos/:page',auth.decodeToken,PedidoController.get_ingresos);
app.get('/get_ingreso/:id',auth.decodeToken,PedidoController.get_ingreso);
app.get('/get_detalle_ingreso_by_color/:id',auth.decodeToken,PedidoController.get_detalle_ingreso_by_color);
app.get('/get_detalle_ingreso_by_variacion/:id',auth.decodeToken,PedidoController.get_detalle_ingreso_by_variacion);

app.get('/verify_envio/:id/:tipo',auth.decodeToken,PedidoController.verify_envio);
app.get('/get_file/:file',PedidoController.get_file);
app.get('/rollos_historico/:id/:periodo',auth.decodeToken,PedidoController.rollos_historico);
app.get('/variaciones_historico/:id/:periodo',auth.decodeToken,PedidoController.variaciones_historico);

app.get('/validar_color/:id',auth.decodeToken,PedidoController.validar_color);
app.get('/validar_variacion/:id',auth.decodeToken,PedidoController.validar_variacion);

app.get('/rollos_general/:periodo',auth.decodeToken,PedidoController.rollos_general);
app.post('/set_confirmacion_pedido',auth.decodeToken,PedidoController.set_confirmacion_pedido);
app.post('/set_cancelar_pedido',auth.decodeToken,PedidoController.set_cancelar_pedido);

app.post('/set_proveedor_pedido',auth.decodeToken,PedidoController.set_proveedor_pedido);

app.post('/set_confirmacion_pedidos',auth.decodeToken,PedidoController.set_confirmacion_pedidos);
app.post('/set_cancelar_pedidos',auth.decodeToken,PedidoController.set_cancelar_pedidos);
module.exports = app;


