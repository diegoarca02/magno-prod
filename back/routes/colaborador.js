var express = require('express');
var ColaboradorController = require('../controllers/ColaboradorController');
/* var auth = require('../middlewares/authenticate-admin'); */
var auth = require('../middlewares/authenticate');
var app = express.Router();

var multiparty = require('connect-multiparty');
var path = multiparty({uploadDir: './uploads/avatars'});

var upload = require('../helpers/uploads');
const path_upload = upload('avatares');

app.post('/create_colaborador',auth.decodeToken,ColaboradorController.create_colaborador);
app.get('/get_colaboradores_admin/:filtro?',auth.decodeToken,ColaboradorController.get_colaboradores_admin);
app.get('/get_colaboradores_cliente_admin/:filtro?/:id',auth.decodeToken,ColaboradorController.get_colaboradores_cliente_admin);

app.get('/get_colaborador_admin/:id',auth.decodeToken,ColaboradorController.get_colaborador_admin);
app.post('/validar_codigo_colaborador',ColaboradorController.validar_codigo_colaborador);

app.get('/reenviar_codigo_login/:id',ColaboradorController.reenviar_codigo_login);
app.get('/obtener_permisos_colaborador/:id',auth.decodeToken,ColaboradorController.obtener_permisos_colaborador);

app.post('/create_colaborador_public',ColaboradorController.create_colaborador_public);
app.post('/create_colaborador_google',ColaboradorController.create_colaborador_google);

app.put('/update_colaborador/:id',auth.decodeToken,ColaboradorController.update_colaborador);
app.put('/update_colaborador_modal/:id',auth.decodeToken,ColaboradorController.update_colaborador_modal);

app.put('/set_status_colaborador/:id',auth.decodeToken,ColaboradorController.set_status_colaborador);
app.get('/reset_colaborador_password/:id',auth.decodeToken,ColaboradorController.reset_colaborador_password);
app.put('/update_remuneracion_colaborador/:id',auth.decodeToken,ColaboradorController.update_remuneracion_colaborador);
app.put('/update_acceso_colaborador/:id',auth.decodeToken,ColaboradorController.update_acceso_colaborador);

app.get('/verify_token',auth.decodeToken,ColaboradorController.verify_token);
app.put('/update_password/:id',auth.decodeToken,ColaboradorController.update_password);
app.get('/get_agentes_admin',auth.decodeToken,ColaboradorController.get_agentes_admin);

app.post('/actualizar_avatar_colaborador',[auth.decodeToken,path_upload],ColaboradorController.actualizar_avatar_colaborador);
app.get('/mostrar_avatar_colaborador/:img',ColaboradorController.mostrar_avatar_colaborador);
app.post('/signin_colaborador',ColaboradorController.signin_colaborador);
app.get('/obtener_tareas_colaborador/:periodo/:estado',auth.decodeToken,ColaboradorController.obtener_tareas_colaborador);
app.post('/crear_tarea_colaborador',auth.decodeToken,ColaboradorController.crear_tarea_colaborador);
app.get('/marcar_tarea_colaborador/:id',auth.decodeToken,ColaboradorController.marcar_tarea_colaborador);
app.put('/posponer_tarea_colaborador/:id',auth.decodeToken,ColaboradorController.posponer_tarea_colaborador);
app.get('/obtener_tareas_pendientes_colaborador',auth.decodeToken,ColaboradorController.obtener_tareas_pendientes_colaborador);
app.get('/cancelar_tarea_colaborador/:id',auth.decodeToken,ColaboradorController.cancelar_tarea_colaborador);

app.post('/update_permiso_colaborador',auth.decodeToken,ColaboradorController.update_permiso_colaborador);

module.exports = app;
