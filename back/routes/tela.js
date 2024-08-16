var express = require('express');
var TelasController = require('../controllers/TelasController');
var auth = require('../middlewares/authenticate');
var app = express.Router();

app.post('/create_color',auth.decodeToken,TelasController.create_color);
app.post('/create_color_producto',auth.decodeToken,TelasController.create_color_producto);
app.get('/get_colores',auth.decodeToken,TelasController.get_colores);
app.get('/get_color/:id',auth.decodeToken,TelasController.get_color);
app.get('/get_etiquetas_color/:id',auth.decodeToken,TelasController.get_etiquetas_color);

app.put('/update_color/:id',auth.decodeToken,TelasController.update_color);
app.get('/get_colores_filter/:filtro',auth.decodeToken,TelasController.get_colores_filter);
app.put('/update_password_color/:id',auth.decodeToken,TelasController.update_password_color);
app.get('/add_colores_primarios_producto/:id',auth.decodeToken,TelasController.add_colores_primarios_producto);

module.exports = app;