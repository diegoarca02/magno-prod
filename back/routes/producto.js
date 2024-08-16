var express = require('express');
var ProductoController = require('../controllers/ProductoController');
var auth = require('../middlewares/authenticate');
var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/galeria'});
var app = express.Router();

var upload = require('../helpers/uploads');
const path_upload = upload('productos');

app.post('/create_producto',[auth.decodeToken,path_upload],ProductoController.create_producto);
app.post('/create_ropa',[auth.decodeToken,path],ProductoController.create_ropa);
app.post('/importar_productos',auth.decodeToken,ProductoController.importar_productos);
app.post('/importar_colores',auth.decodeToken,ProductoController.importar_colores);
app.post('/importar_rollos',auth.decodeToken,ProductoController.importar_rollos);
app.get('/get_productos/:filtro/:page',auth.decodeToken,ProductoController.get_productos);
app.get('/get_productos_papelera/:filtro',auth.decodeToken,ProductoController.get_productos_papelera);
app.get('/get_ropas/:filtro',auth.decodeToken,ProductoController.get_ropas);
app.get('/get_productos_programaciones/:filtro',auth.decodeToken,ProductoController.get_productos_programaciones);
app.get('/get_productos_programaciones_ropas/:filtro',auth.decodeToken,ProductoController.get_productos_programaciones_ropas);
app.get('/get_productos_ventas/:filtro',auth.decodeToken,ProductoController.get_productos_ventas);
app.get('/get_productos_ventas_con_precios/:tipo/:filtro',auth.decodeToken,ProductoController.get_productos_ventas_con_precios);
app.get('/get_producto_ventas_con_precios/:id',auth.decodeToken,ProductoController.get_producto_ventas_con_precios);


app.get('/get_productos_ropas/:filtro',auth.decodeToken,ProductoController.get_productos_ropas);
app.get('/get_productos_cantidades/:filtro',auth.decodeToken,ProductoController.get_productos_cantidades);
app.get('/get_ropas_cantidades/:filtro',auth.decodeToken,ProductoController.get_ropas_cantidades);

app.post('/get_productos_cantidades_filter_advanced',auth.decodeToken,ProductoController.get_productos_cantidades_filter_advanced);
app.put('/update_precio_producto_color/:id',auth.decodeToken,ProductoController.update_precio_producto_color);
app.put('/update_precio_ropa_variacion/:id',auth.decodeToken,ProductoController.update_precio_ropa_variacion);
app.get('/get_ropa_tallas/:id',auth.decodeToken,ProductoController.get_ropa_tallas);

app.put('/update_precio_global_color/:id',auth.decodeToken,ProductoController.update_precio_global_color);

app.put('/update_valores_producto_color/:id',auth.decodeToken,ProductoController.update_valores_producto_color);
app.put('/update_valores_ropa_variacion/:id',auth.decodeToken,ProductoController.update_valores_ropa_variacion);


app.get('/resources/products/:img',ProductoController.get_image_producto);
app.get('/get_producto/:id',auth.decodeToken,ProductoController.get_producto);
app.get('/get_programaciones_producto/:id',auth.decodeToken,ProductoController.get_programaciones_producto);


app.get('/update_sku_color/:id',auth.decodeToken,ProductoController.update_sku_color);
app.get('/get_colores_ropas',auth.decodeToken,ProductoController.get_colores_ropas);


app.put('/update_producto/:id',[auth.decodeToken,path],ProductoController.update_producto);
app.post('/add_composicion',auth.decodeToken,ProductoController.add_composicion);
app.delete('/delete_composicion/:id',auth.decodeToken,ProductoController.delete_composicion);
app.post('/add_titulo',auth.decodeToken,ProductoController.add_titulo);
app.delete('/delete_titulo/:id',auth.decodeToken,ProductoController.delete_titulo);
app.post('/add_variacion',auth.decodeToken,ProductoController.add_variacion);
app.post('/add_etiqueta',auth.decodeToken,ProductoController.add_etiqueta);
app.post('/add_etiqueta_color',auth.decodeToken,ProductoController.add_etiqueta_color);

app.delete('/delete_etiqueta/:id',auth.decodeToken,ProductoController.delete_etiqueta);
app.delete('/delete_etiqueta_color/:id',auth.decodeToken,ProductoController.delete_etiqueta_color);


app.put('/set_estado_variacion/:id',auth.decodeToken,ProductoController.set_estado_variacion);
app.get('/delete_variacion/:id',auth.decodeToken,ProductoController.delete_variacion);

app.post('/add_imagen',[auth.decodeToken,path_upload],ProductoController.add_imagen);
app.delete('/delete_imagen/:id',auth.decodeToken,ProductoController.delete_imagen);
app.post('/get_productos_filter_advanced',auth.decodeToken,ProductoController.get_productos_filter_advanced);
app.put('/edit_color/:id',auth.decodeToken,ProductoController.edit_color);
app.get('/get_producto_composiciones/:id',auth.decodeToken,ProductoController.get_producto_composiciones);
app.get('/get_producto_titulos/:id',auth.decodeToken,ProductoController.get_producto_titulos);
app.get('/get_producto_variaciones/:id',auth.decodeToken,ProductoController.get_producto_variaciones);
app.get('/get_producto_imagenes/:id',auth.decodeToken,ProductoController.get_producto_imagenes);
app.get('/get_producto_etiquetas/:id',auth.decodeToken,ProductoController.get_producto_etiquetas);
app.put('/update_cantidad_contenedor/:id',auth.decodeToken,ProductoController.update_cantidad_contenedor);


app.get('/duplicar_producto/:id',auth.decodeToken,ProductoController.duplicar_producto);

app.get('/delete_producto/:id',auth.decodeToken,ProductoController.delete_producto);

module.exports = app;
