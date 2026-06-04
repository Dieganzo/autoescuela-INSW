const { Router } = require('express');
const router = Router();

const dashboardRoutes = require('./dashboard.Routes');
const reservasRoutes = require('./reservas.Routes');
const estudiantesRoutes = require('./estudiantes.Routes');
const vehiculosRoutes = require('./vehiculos.Routes')
const instructorRoutes = require('./instructor.Routes');  // ← AGREGAR ESTA LÍNEA

router.use('/dashboard', dashboardRoutes);
router.use('/reservas', reservasRoutes);
router.use('/estudiantes', estudiantesRoutes);
router.use('/vehiculos', vehiculosRoutes);  // ← AGREGAR ESTA LÍNEA
router.use('/instructores', instructorRoutes);  
module.exports = router;