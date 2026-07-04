const { AppDataSource } = require('../db/data-source');
// Importamos la logica centralizada para no repetir codigo
const { obtenerAlertasVehiculo } = require('./dashboard.Service');

//Obtiene la flota completa con las alertas preventivas calculadas
const getFlotaService = async (sedeId) => {
  const vehiculoRepository = AppDataSource.getRepository('Vehiculo');
  const sedeRepository = AppDataSource.getRepository('Sede');

  try {
    let query = vehiculoRepository.createQueryBuilder('v')
      .leftJoinAndSelect('v.sede', 's');

    if (sedeId) {
      query.where('v.sede_id = :sedeId', { sedeId });
    }

    query.orderBy('v.id', 'ASC');
    const vehiculos = await query.getMany();

    // Mapeamos los resultados para inyectar las alertas automaticas
    return vehiculos.map(vehiculo => {
      return {
        id: vehiculo.id,
        patente: vehiculo.patente,
        modelo: vehiculo.modelo,
        estado: vehiculo.estado,
        sede_id: vehiculo.sede_id,
        sede_nombre: vehiculo.sede?.nombre,
        kilometraje_actual: vehiculo.kilometraje_actual,
        km_ultimo_aceite: vehiculo.km_ultimo_aceite,
        km_ultimos_frenos: vehiculo.km_ultimos_frenos,
        km_proximo_mantenimiento: vehiculo.km_proximo_mantenimiento,
        fecha_revision_tecnica: vehiculo.fecha_revision_tecnica,
        // Usamos la funcion de dashboard.Service para evaluar km y fechas
        alertas: obtenerAlertasVehiculo(vehiculo)
      };
    });
  } catch (error) {
    throw error;
  }
};

//Actualiza el estado del vehiculo (Disponible, Mantenimiento, En sesion)
const updateEstadoService = async (id, estado) => {
  const vehiculoRepository = AppDataSource.getRepository('Vehiculo');

  try {
    const vehiculo = await vehiculoRepository.findOne({ where: { id } });
    
    if (!vehiculo) {
      const error = new Error('Vehículo no encontrado');
      error.status = 404;
      throw error;
    }

    vehiculo.estado = estado;
    const resultado = await vehiculoRepository.save(vehiculo);
    
    return {
      id: resultado.id,
      patente: resultado.patente,
      modelo: resultado.modelo,
      estado: resultado.estado,
      sede_id: resultado.sede_id
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { 
  getFlotaService, 
  updateEstadoService 
};