const instructorService = require('../services/instructor.Service');

const obtenerTodosLosInstructores = async (req, res) => {
  try {
    const instructores = await instructorService.getAllInstructors();
    res.status(201).json({
      mensaje: 'Instructores obtenidos exitosamente',
      data: instructores
    });
  } catch (error) {
    console.error('Error en obtener Todos Los Instructores:', error.message);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: error.message || 'Error al obtener los instructores' });
  }
}

const obtenerPerfilInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await instructorService.getPerfilInstructor(id);
    res.status(201).json({
      mensaje: 'Perfil del instructor obtenido exitosamente',
      data: instructor
    });
  } catch (error) {
    console.error('Error en obtener Perfil de Instructor:', error.message);
    res.status(error.status || 500).json({ error: error.message || 'Error al obtener el perfil del instructor' });
  }
}

const crearNuevoInstructor = async (req, res) => {
  try {
    const instructorData = req.body;
    const nuevoInstructor = await instructorService.crearInstructor(instructorData);
    res.status(201).json({
      mensaje: 'Instructor creado exitosamente',
      data: nuevoInstructor
    });
  } catch (error) {
    console.error('Error en crear Nuevo Instructor:', error.message);
    res.status(error.status || 500).json({ error: error.message || 'Error al crear el instructor' });
  }
}

const actualizarInformacionInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorData = req.body;
    const instructorActualizado = await instructorService.actualizarInstructor(id, instructorData);
    res.status(201).json({
      mensaje: 'Información del instructor actualizada exitosamente',
      data: instructorActualizado
    });
  } catch (error) {
    console.error('Error en actualizar Información de Instructor:', error.message);
    res.status(error.status || 500).json({ error: error.message || 'Error al actualizar la información del instructor' });
  }
}

const eliminarInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await instructorService.eliminarInstructor(id);
    res.status(201).json({
      mensaje: 'Instructor eliminado exitosamente',
      data: resultado
    });
  } catch (error) {
    console.error('Error en eliminar Instructor:', error.message);
    res.status(error.status || 500).json({ error: error.message || 'Error al eliminar el instructor' });
  }
}

module.exports = { obtenerTodosLosInstructores, obtenerPerfilInstructor, crearNuevoInstructor, actualizarInformacionInstructor, eliminarInstructor };