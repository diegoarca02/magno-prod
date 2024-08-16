var express = require('express');
var RolController = require('../controllers/RolController');
/* var auth = require('../middlewares/authenticate-admin'); */
var auth = require('../middlewares/authenticate');
var app = express.Router();


app.get('/get_only_roles',auth.decodeToken,RolController.get_only_roles);
app.post('/create_rol',auth.decodeToken,RolController.create_rol);
app.get('/get_roles',auth.decodeToken,RolController.get_roles);
app.get('/get_rol/:id',auth.decodeToken,RolController.get_rol);
app.put('/update_permisos_rol/:id',auth.decodeToken,RolController.update_permisos_rol);
app.put('/edit_titulo_rol/:id',auth.decodeToken,RolController.edit_titulo_rol);
app.get('/delete_rol/:id',auth.decodeToken,RolController.delete_rol);

module.exports = app;
