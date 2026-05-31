const { Router } = require('express');
const router = Router();

const dashboardRoutes = require('./dashboard.Routes');
const reservasRoutes = require('./reservas.Routes');
const estudiantesRoutes = require('./estudiantes.Routes');
const vehiculosRoutes = require('./vehiculos.Routes');  // ← AGREGAR ESTA LÍNEA

router.use('/dashboard', dashboardRoutes);
router.use('/reservas', reservasRoutes);
router.use('/estudiantes', estudiantesRoutes);
router.use('/vehiculos', vehiculosRoutes);  // ← AGREGAR ESTA LÍNEA

module.exports = router;