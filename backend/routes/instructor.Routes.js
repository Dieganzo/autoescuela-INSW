const { Router } = require('express');
const router = Router();
const instructorController = require('../controllers/instructor.controller');
const { validarNuevoInstructor, validarActualizarInstructor, validarEspecialidad } = require('../validations/instructores.Validations');
 
// obtener todos los instructores
router.get('/', instructorController.obtenerTodosLosInstructores);

// obtener el perfil de un instructor
router.get('/:id', instructorController.obtenerPerfilInstructor);

// crear un nuevo instructor
router.post('/', validarNuevoInstructor, instructorController.crearNuevoInstructor);

// actualizar la información de un instructor
router.put('/:id', validarActualizarInstructor, instructorController.actualizarInformacionInstructor);

// eliminar un instructor
router.delete('/:id', instructorController.eliminarInstructor);