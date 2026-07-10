const vehiculoService = require('../services/vehiculos.Service');

const usuarioAuditoria = (req) => req.headers['x-usuario'] || req.headers['x-user'] || null;
const motivoAuditoria = (req) => req.body?.motivo || null;

const getFlota = async (req, res) => {
  try {
    const data = await vehiculoService.getFlotaService(req.query.sedeId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la flota' });
  }
};

// Controlador para crear un nuevo vehiculo
const crearVehiculo = async (req, res) => {
  try {
    const vehiculo = await vehiculoService.crearVehiculoService(req.body, usuarioAuditoria(req), motivoAuditoria(req));
    res.status(201).json({ mensaje: 'Vehiculo creado', vehiculo });
  } catch (error) {
    console.error('crearVehiculo error:', error.message);
    res.status(500).json({ error: error.message || 'Error al crear vehiculo' });
  }
};

// Controlador para actualizar un vehiculo existente
const updateVehiculo = async (req, res) => {
  try {
    const vehiculo = await vehiculoService.updateVehiculoService(
      req.params.id,
      req.body,
      usuarioAuditoria(req),
      motivoAuditoria(req)
    );
    if (!vehiculo) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Actualizado', vehiculo });
  } catch (error) {
    console.error('updateVehiculo error:', error.message);
    res.status(500).json({ error: error.message || 'Error al actualizar vehiculo' });
  }
};

// Controlador para actualizar el estado de un vehiculo
const updateEstadoVehiculo = async (req, res) => {
  try {
    const vehiculo = await vehiculoService.updateEstadoService(
      req.params.id,
      req.body.estado,
      usuarioAuditoria(req),
      motivoAuditoria(req)
    );
    if (!vehiculo) return res.status(404).json({ error: 'No encontrado' });
    res.json({ mensaje: 'Actualizado', vehiculo });
  } catch (error) {
    console.error('updateEstadoVehiculo error:', error.message);
    res.status(500).json({ error: error.message || 'Error al actualizar' });
  }
};

// Controlador para registrar el fin de sesión de un vehiculo
const registrarFinDeSesion = async (req, res) => {
  try {
    const { id } = req.params;
    const { kmRecorridos } = req.body;
    const auto = await vehiculoService.finalizarSesionService(id, kmRecorridos, usuarioAuditoria(req));

    if (auto) return res.json({ mensaje: 'Kilometraje actualizado', auto });
    return res.status(404).json({ error: 'Vehiculo no encontrado' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Controlador para eliminar un vehiculo
const eliminarVehiculo = async (req, res) => {
  try {
    const vehiculo = await vehiculoService.eliminarVehiculoService(req.params.id, usuarioAuditoria(req), motivoAuditoria(req));
    if (!vehiculo) return res.status(404).json({ error: 'No encontrado' });
    return res.json({ mensaje: 'Vehiculo eliminado', vehiculo });
  } catch (error) {
    console.error('eliminarVehiculo error:', error.message);
    return res.status(500).json({ error: error.message || 'Error al eliminar vehiculo' });
  }
};

// Controlador para obtener el historial de un vehiculo
const getHistorial = async (req, res) => {
  try {
    const historial = await vehiculoService.getHistorialService(req.params.id);
    res.json(historial);
  } catch (error) {
    console.error('getHistorial error:', error.message);
    res.status(500).json({ error: error.message || 'Error al obtener historial' });
  }
};

module.exports = {
  getFlota,
  crearVehiculo,
  updateVehiculo,
  updateEstadoVehiculo,
  registrarFinDeSesion,
  eliminarVehiculo,
  getHistorial,
};