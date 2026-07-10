const { AppDataSource } = require('../db/data-source');
<<<<<<< HEAD
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
=======
const { sincronizarEstadoMantenimiento } = require('./dashboard.Service');
const { emitirEventoVehiculo } = require('./socket');

const TABLA_HISTORIAL = 'historial_vehiculos';

const asegurarTablaHistorial = async (manager = AppDataSource.manager) => {
  await manager.query(`
    CREATE TABLE IF NOT EXISTS ${TABLA_HISTORIAL} (
      id SERIAL PRIMARY KEY,
      vehiculo_id INTEGER NOT NULL,
      accion VARCHAR(50) NOT NULL,
      campo VARCHAR(80),
      valor_anterior TEXT,
      valor_nuevo TEXT,
      usuario VARCHAR(120),
      motivo TEXT,
      creado_en TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
};

const registrarHistorial = async (manager, vehiculoId, accion, cambios, usuario = null, motivo = null) => {
  await asegurarTablaHistorial(manager);
  const entradas = cambios.length > 0
    ? cambios
    : [{ campo: null, valorAnterior: null, valorNuevo: null }];

  await Promise.all(entradas.map((cambio) => manager.query(
    `INSERT INTO ${TABLA_HISTORIAL}
      (vehiculo_id, accion, campo, valor_anterior, valor_nuevo, usuario, motivo)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      vehiculoId,
      accion,
      cambio.campo,
      cambio.valorAnterior === undefined || cambio.valorAnterior === null ? null : String(cambio.valorAnterior),
      cambio.valorNuevo === undefined || cambio.valorNuevo === null ? null : String(cambio.valorNuevo),
      usuario,
      motivo,
    ]
  )));
};

const obtenerCambios = (anterior, nuevo, campos) => campos
  .filter((campo) => String(anterior?.[campo] ?? '') !== String(nuevo?.[campo] ?? ''))
  .map((campo) => ({
    campo,
    valorAnterior: anterior?.[campo],
    valorNuevo: nuevo?.[campo],
  }));

const publicarVehiculo = async (evento, vehiculo) => {
  const sincronizado = await sincronizarEstadoMantenimiento(vehiculo);
  emitirEventoVehiculo(evento, sincronizado);
  return sincronizado;
};

//Obtiene la flota completa con las alertas preventivas calculadas
const getFlotaService = async (sedeId) => {
  let query = `
    SELECT v.*, s.nombre as sede_nombre 
    FROM vehiculos v 
    JOIN sedes s ON v.sede_id = s.id
  `;
  
  const params = [];
  if (sedeId) {
    query += ` WHERE v.sede_id = $1`;
    params.push(sedeId);
  }
  
  query += ` ORDER BY v.id ASC`;
  
  const rows = await AppDataSource.query(query, params);

  // Mapeamos los resultados para inyectar las alertas automaticas
  return Promise.all(rows.map(vehiculo => sincronizarEstadoMantenimiento(vehiculo)));
};

const crearVehiculoService = async (datos, usuario = null, motivo = null) => {
  const repo = AppDataSource.getRepository('Vehiculo');
  const vehiculo = repo.create(datos);
  const guardado = await repo.save(vehiculo);
  await registrarHistorial(AppDataSource.manager, guardado.id, 'creacion', [], usuario, motivo);
  return publicarVehiculo('vehiculo:creado', guardado);
};

const updateVehiculoService = async (id, datos, usuario = null, motivo = null) => {
  const campos = [
    'patente', 'modelo', 'estado', 'kilometraje_actual', 'km_ultimo_aceite','km_proximo_mantenimiento', 'fecha_revision_tecnica', 'sede_id',
  ];
  const repo = AppDataSource.getRepository('Vehiculo');
  const anterior = await repo.findOneBy({ id: parseInt(id, 10) });
  if (!anterior) return null;

  campos.forEach((campo) => {
    if (datos[campo] !== undefined) anterior[campo] = datos[campo];
  });

  const cambios = obtenerCambios(await repo.findOneBy({ id: parseInt(id, 10) }), anterior, campos);
  const guardado = await repo.save(anterior);
  if (cambios.length > 0) {
    await registrarHistorial(AppDataSource.manager, guardado.id, 'actualizacion', cambios, usuario, motivo);
  }
  return publicarVehiculo('vehiculo:actualizado', guardado);
};

//Actualiza el estado del vehiculo (Disponible, Mantenimiento, En sesion)
const updateEstadoService = async (id, estado, usuario = null, motivo = null) => {
  const rows = await AppDataSource.query(
    `UPDATE vehiculos SET estado = $1 WHERE id = $2 RETURNING *`,
    [estado, id]
  );
  const vehiculo = rows[0];
  if (!vehiculo) return null;
  await registrarHistorial(AppDataSource.manager, vehiculo.id, 'cambio_estado', [
    { campo: 'estado', valorAnterior: null, valorNuevo: estado },
  ], usuario, motivo);
  return publicarVehiculo('vehiculo:actualizado', vehiculo);
};

const finalizarSesionService = async (id, kmRecorridos, usuario = null) => {
  const vehiculo = await AppDataSource.manager.transaction('SERIALIZABLE', async (manager) => {
    const rows = await manager.query(
      `UPDATE vehiculos
       SET kilometraje_actual = COALESCE(kilometraje_actual, 0) + $1,
           estado = 'disponible'
       WHERE id = $2
       RETURNING *`,
      [kmRecorridos, id]
    );

    if (!rows[0]) return null;

    await registrarHistorial(manager, rows[0].id, 'finalizar_sesion', [
      { campo: 'kilometraje_actual', valorAnterior: null, valorNuevo: rows[0].kilometraje_actual },
      { campo: 'estado', valorAnterior: 'en_sesion', valorNuevo: 'disponible' },
    ], usuario);

    return rows[0];
  });

  if (!vehiculo) return null;
  return publicarVehiculo('vehiculo:actualizado', vehiculo);
};

const eliminarVehiculoService = async (id, usuario = null, motivo = null) => {
  const repo = AppDataSource.getRepository('Vehiculo');
  const vehiculo = await repo.findOneBy({ id: parseInt(id, 10) });
  if (!vehiculo) return null;
  await repo.remove(vehiculo);
  await registrarHistorial(AppDataSource.manager, parseInt(id, 10), 'eliminacion', [], usuario, motivo);
  emitirEventoVehiculo('vehiculo:eliminado', { ...vehiculo, id: parseInt(id, 10) });
  return vehiculo;
};

const getHistorialService = async (id) => {
  await asegurarTablaHistorial();
  return AppDataSource.query(
    `SELECT * FROM ${TABLA_HISTORIAL}
     WHERE vehiculo_id = $1
     ORDER BY creado_en DESC
     LIMIT 100`,
    [id]
  );
>>>>>>> origin/DANTE
};

module.exports = { 
  getFlotaService, 
  crearVehiculoService,
  updateVehiculoService,
  updateEstadoService,
  finalizarSesionService,
  eliminarVehiculoService,
  getHistorialService,
};
