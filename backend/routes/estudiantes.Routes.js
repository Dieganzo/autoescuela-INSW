const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/estudiantes.Controller');
const { validarSedeId, validarEstudianteId, validarCrearEstudiante, validarModuloId, validarActualizarEstudiante, validarActualizarProgreso } = require('../validations/estudiantes.Validations');

// ========== RUTAS ESPECÍFICAS PRIMERO ==========

// GET /api/estudiantes/teoria/modulos - obtener todos los modulos teoricos
router.get('/teoria/modulos', ctrl.getModulosTeoricos);

// GET /api/estudiantes/list - obtener lista de estudiantes
router.get('/list', ctrl.getListaEstudiantes);

// ========== RUTAS CON PARÁMETROS DINÁMICOS ==========

// POST /api/estudiantes - crear estudiante
router.post('/', validarCrearEstudiante, ctrl.crearEstudiante);

// GET /api/estudiantes - buscador global
router.get('/', validarSedeId, ctrl.buscarEstudiantes);

// GET /api/estudiantes/:id/modulos - obtener modulos del estudiante
router.get('/:id/modulos', validarEstudianteId, ctrl.getModulosEstudiante);

// POST /api/estudiantes/:id/modulos/:moduloId - asignar modulo a estudiante
router.post('/:id/modulos/:moduloId', validarEstudianteId, validarModuloId, ctrl.asignarModuloEstudiante);

// PUT /api/estudiantes/:id/modulos/:moduloId - actualizar progreso del modulo
router.put('/:id/modulos/:moduloId', validarEstudianteId, validarModuloId, validarActualizarProgreso, ctrl.actualizarProgresoModulo);

// GET /api/estudiantes/:id/timeline - obtener timeline del estudiante
router.get('/:id/timeline', validarEstudianteId, ctrl.getTimelineEstudiante);

// PUT /api/estudiantes/:id - actualizar datos del estudiante
router.put('/:id', validarEstudianteId, validarActualizarEstudiante, ctrl.actualizarEstudiante);

// DELETE /api/estudiantes/:id - eliminar estudiante
router.delete('/:id', validarEstudianteId, ctrl.eliminarEstudiante);

// GET /api/estudiantes/:id - perfil estudiante (DEBE IR AL FINAL para no interferar con rutas específicas)
router.get('/:id', validarEstudianteId, ctrl.getPerfilEstudiante);

module.exports = router;
