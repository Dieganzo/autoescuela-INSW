const Joi = require('joi');

const vehiculoSchema = Joi.object({
  patente: Joi.string().trim().max(20).required(),
  modelo: Joi.string().trim().max(255).required(),
  estado: Joi.string().valid('disponible', 'mantenimiento', 'en_sesion').default('disponible'),
  kilometraje_actual: Joi.number().integer().min(0).default(0),
  km_ultimo_aceite: Joi.number().integer().min(0).default(0),
  km_proximo_mantenimiento: Joi.number().integer().min(0).default(10000),
  fecha_revision_tecnica: Joi.date().allow(null),
  sede_id: Joi.number().integer().positive().required(),
  motivo: Joi.string().trim().max(255).allow('', null),
});

const vehiculoUpdateSchema = vehiculoSchema.fork(
  ['patente', 'modelo', 'sede_id'],
  (schema) => schema.optional()
);

// Esquema para validar el estado del vehiculo
const updateEstadoSchema = Joi.object({
  estado: Joi.string().valid('disponible', 'mantenimiento', 'en_sesion').required()
    .messages({
      'any.only': 'El estado debe ser: disponible, mantenimiento o en_sesion',
      'any.required': 'El campo estado es obligatorio'
    }),
    motivo: Joi.string().trim().max(255).allow('', null),
});

const finalizarSesionSchema = Joi.object({
  kmRecorridos: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'kmRecorridos debe ser un numero',
      'number.min': 'kmRecorridos debe ser mayor a 0',
      'any.required': 'kmRecorridos es obligatorio'
    })
});

const validarCreacionVehiculo = (req, res, next) => {
  const { error, value } = vehiculoSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ error: error.details[0].message });
  req.body = value;
  next();
};

const validarActualizacionVehiculo = (req, res, next) => {
  const { error, value } = vehiculoUpdateSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ error: error.details[0].message });
  req.body = value;
  next();
};

// Middleware para validar el estado del vehiculo
const validarUpdateEstado = (req, res, next) => {
  const { error } = updateEstadoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validarFinalizarSesion = (req, res, next) => {
  const { error, value } = finalizarSesionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  req.body = value;
  next();
};

module.exports = {
  validarCreacionVehiculo,
  validarActualizacionVehiculo,
  validarUpdateEstado,
  validarFinalizarSesion,
};