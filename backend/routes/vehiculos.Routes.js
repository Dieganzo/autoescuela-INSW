const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/vehiculos.Controller');
const { validarUpdateEstado, validarCreacionVehiculo, validarActualizacionVehiculo } = require('../validations/vehiculos.Validations');

router.get('/', ctrl.getFlota);
router.post('/', validarCreacionVehiculo, ctrl.crearVehiculo); //crear vehiculo
// Endpoint para actualizar el estado del vehiculo
router.put('/:id/estado', validarUpdateEstado, ctrl.updateEstadoVehiculo);
// Endpoint para actualizar un vehiculo existente
router.put('/:id', validarActualizacionVehiculo, ctrl.updateVehiculo);
router.delete('/:id', ctrl.eliminarVehiculo); // Eliminar auto
// Endpoint para obtener el historial de un vehiculo
router.get('/:id/historial', ctrl.getHistorial);
//endpoint para registrar el final de una sesion de conduccion
router.post('/:id/finalizar-sesion', ctrl.registrarFinDeSesion);

module.exports = router;