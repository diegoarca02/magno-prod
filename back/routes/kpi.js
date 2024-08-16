var express = require('express');
var KpiController = require('../controllers/KpiController');
var auth = require('../middlewares/authenticate');
var app = express.Router();

app.get('/get_cobranza_semanal/:month/:year',auth.decodeToken,KpiController.get_cobranza_semanal);
app.get('/get_cobranza_cliente/:inicio/:hasta/:cliente',auth.decodeToken,KpiController.get_cobranza_cliente);
app.get('/get_pagos_mensuales_cliente/:year/:month/:cliente',auth.decodeToken,KpiController.get_pagos_mensuales_cliente);
app.get('/get_cobranza_million/:inicio/:hasta',auth.decodeToken,KpiController.get_cobranza_million);
app.get('/get_ventas_productos/:inicio/:hasta',auth.decodeToken,KpiController.get_ventas_productos);
app.get('/get_pagos_productos/:inicio/:hasta',auth.decodeToken,KpiController.get_pagos_productos);
app.get('/get_pagos_agente/:inicio/:hasta',auth.decodeToken,KpiController.get_pagos_agente);
app.get('/get_ventas_agente/:inicio/:hasta',auth.decodeToken,KpiController.get_ventas_agente);
app.get('/kpi_inventario',KpiController.kpi_inventario);

module.exports = app;