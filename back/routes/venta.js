var express = require('express');
var VentaController = require('../controllers/VentaController');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/ventas'});
var path_pago = multiparty({uploadDir: './uploads/pagos'});
var path_programacion = multiparty({uploadDir: './uploads/invoices/programaciones'});
var path_venta = multiparty({uploadDir: './uploads/invoices/ventas'});
var auth = require('../middlewares/authenticate');
var app = express.Router();

var upload = require('../helpers/uploads');
const path_upload = upload('ventas');
const path_upload_pagos = upload('pagos');
const path_upload_doc_ventas = upload('documentos-venta');
const path_upload_envios = upload('envios');

app.post('/create_venta',[auth.decodeToken,path_upload],VentaController.create_venta);
app.get('/get_programacion/:id',auth.decodeToken,VentaController.get_programacion);
app.get('/get_ventas_confirmadas',auth.decodeToken,VentaController.get_ventas_confirmadas);
app.get('/get_detalles_venta/:id',auth.decodeToken,VentaController.get_detalles_venta);

app.post('/create_programaciones',[auth.decodeToken,path_upload],VentaController.create_programaciones);
app.put('/update_file_venta/:id',[auth.decodeToken,path_upload],VentaController.update_file_venta);
app.put('/update_file_entrega_envio/:id',[auth.decodeToken,path_upload],VentaController.update_file_entrega_envio);
app.put('/update_firma_envio/:id',auth.decodeToken,VentaController.update_firma_envio);
app.put('/confirmar_estado_venta/:id',auth.decodeToken,VentaController.confirmar_estado_venta);

app.put('/update_file_envio_venta/:id',[auth.decodeToken,path_upload_envios],VentaController.update_file_envio_venta);
app.put('/update_total_venta/:id',auth.decodeToken,VentaController.update_total_venta);

app.put('/update_file_programacion/:id',[auth.decodeToken,path_upload],VentaController.update_file_programacion);
app.get('/cancelar_programacion/:id',[auth.decodeToken],VentaController.cancelar_programacion);
app.get('/cancelar_detalle_programacion/:id',[auth.decodeToken],VentaController.cancelar_detalle_programacion);
app.get('/confirmar_programacion/:id',[auth.decodeToken],VentaController.confirmar_programacion);
app.get('/download_cfdi/:id',VentaController.download_cfdi);
app.get('/cancelar_pago/:id',auth.decodeToken,VentaController.cancelar_pago);

app.get('/get_ventas/:estado/:page',auth.decodeToken,VentaController.get_ventas);
app.get('/get_ventas_envios/:estado/:page',auth.decodeToken,VentaController.get_ventas_envios);

app.get('/get_programaciones_range/:estado/:page',auth.decodeToken,VentaController.get_programaciones_range);

app.get('/get_last_ventas',auth.decodeToken,VentaController.get_last_ventas);
app.get('/get_venta/:id',auth.decodeToken,VentaController.get_venta);
app.get('/get_venta_guest/:id',auth.decodeToken,VentaController.get_venta_guest);
app.get('/get_venta_cobranza/:id',auth.decodeToken,VentaController.get_venta_cobranza);

app.put('/update_estado_venta/:id',auth.decodeToken,VentaController.update_estado_venta);
app.post('/add_doc_venta/:id/:tipo',[auth.decodeToken,path_upload_doc_ventas],VentaController.add_doc_venta);
app.get('/resources/sales/:img',VentaController.get_doc_venta);
app.post('/create_doc_envio',auth.decodeToken,VentaController.create_doc_envio);
app.get('/remove_detalle_venta/:id/:venta',auth.decodeToken,VentaController.remove_detalle_venta);
app.put('/add_detalle_venta/:id',auth.decodeToken,VentaController.add_detalle_venta);

app.get('/get_productos_programaciones_pedido/:filtro/:tipo',auth.decodeToken,VentaController.get_productos_programaciones_pedido);
app.get('/get_ventas_serie/:filtro',auth.decodeToken,VentaController.get_ventas_serie);
app.get('/get_venta_pagos/:id',auth.decodeToken,VentaController.get_venta_pagos);
app.post('/crear_pago',[auth.decodeToken,path_upload_pagos],VentaController.crear_pago);

app.get('/cancelar_venta/:id',auth.decodeToken,VentaController.cancelar_venta);
app.get('/get_pagos/:page',auth.decodeToken,VentaController.get_pagos);
app.get('/get_detalle_ingreso_by_color_venta/:id',auth.decodeToken,VentaController.get_detalle_ingreso_by_color_venta);
app.get('/get_detalle_ingreso_by_variacion_venta/:id',auth.decodeToken,VentaController.get_detalle_ingreso_by_variacion_venta);


app.get('/aprobar_pago/:id',auth.decodeToken,VentaController.aprobar_pago);
app.get('/get_image_comprobante/:img',VentaController.get_image_comprobante);
app.get('/get_programacion_nota/:file',VentaController.get_programacion_nota);
app.get('/get_venta_nota/:file',VentaController.get_venta_nota);


app.post('/create_cupon',auth.decodeToken,VentaController.create_cupon);
app.get('/get_cupones/:codigo?/:estado',auth.decodeToken,VentaController.get_cupones);
app.get('/get_cupon/:codigo',auth.decodeToken,VentaController.get_cupon);
app.get('/cancelar_comprador_cupon/:id',auth.decodeToken,VentaController.cancelar_comprador_cupon);

app.get('/obtener_ventas_en_camino',auth.decodeToken,VentaController.obtener_ventas_en_camino);
app.post('/actualizar_prioridades_ventas',auth.decodeToken,VentaController.actualizar_prioridades_ventas);
app.get('/timbrar_borrador_pago/:id',auth.decodeToken,VentaController.timbrar_borrador_pago);
app.post('/unidades_disponibles_productos',auth.decodeToken,VentaController.unidades_disponibles_productos);

app.get('/confirmar_entrega_venta/:id',auth.decodeToken,VentaController.confirmar_entrega_venta);
app.get('/get_envios_venta/:id',auth.decodeToken,VentaController.get_envios_venta);
app.get('/get_envios_procesados',auth.decodeToken,VentaController.get_envios_procesados);


module.exports = app;


