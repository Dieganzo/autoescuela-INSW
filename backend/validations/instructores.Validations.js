// middleware que valida req.query.sedeId 
const validarSedeId = (req, res, next) => {
  const { sedeId } = req.query;

  if (sedeId === undefined || sedeId === '') {
    return next();
  }

  const parsed = Number(sedeId);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return res.status(400).json({
      error: 'El ID de la sede debe ser un número entero válido'
    });
  }

  req.query.sedeId = parsed;
  next();
};

const validarCrearInstructor = (req, res, next) => {
  const { nombre, apellido, sedeId } = req.body;

  // validar nombre
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({
      error: 'Se requiere nombre del instructor.'
    });
  }

  if (nombre.trim().length > 50) {
    return res.status(400).json({
      error: 'El nombre del instructor no puede exceder los 50 caracteres.'
    });
  }

  // validar apellido
  if (!apellido || typeof apellido !== 'string' || apellido.trim() === '') {
    return res.status(400).json({
      error: 'Se requiere apellido del instructor.'
    });
  }

  if (apellido.trim().length > 50) {
    return res.status(400).json({
      error: 'El apellido del instructor no puede exceder los 50 caracteres.'
    });
  }

  // validar sedeId
  if (sedeId === undefined || sedeId === '') {
    return res.status(400).json({
      error: 'Se requiere el ID de la sede.'
    });
  }

  const parsedSedeId = Number(sedeId);
  if (!Number.isInteger(parsedSedeId) || parsedSedeId <= 0) {
    return res.status(400).json({
      error: 'El ID de la sede debe ser un número entero válido.'
    });
  }

  req.body.nombre = nombre.trim();
  req.body.apellido = apellido.trim();
  req.body.sedeId = parsedSedeId;

  next();
};

const validarActualizarInstructor = (req, res, next) => {
  const { nombre, apellido, sedeId } = req.body;
    // validar nombre
    if (nombre !== undefined) {
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({
        error: 'El nombre del instructor debe ser un texto no vacío'
      });
    }
    } 
    // validar apellido
    if (apellido !== undefined) {
      if (typeof apellido !== 'string' || apellido.trim() === '') {
        return res.status(400).json({
          error: 'El apellido del instructor debe ser un texto no vacío'
        });
      }
    }
    // validar sedeId
    if (sedeId !== undefined) {
      const parsedSedeId = Number(sedeId);
      if (!Number.isInteger(parsedSedeId) || parsedSedeId <= 0) {
        return res.status(400).json({
          error: 'El ID de la sede debe ser un número entero válido.'
        });
      }
    }
  next();
};


const validarEspecialidad = (req, res, next) => {
  const { especialidad } = req.body;
    if (especialidad !== undefined) {
    if (typeof especialidad !== 'string' || especialidad.trim() === '') {
      return res.status(400).json({
        error: 'La especialidad del instructor debe ser un texto no vacío'
      });
    }
    }
  next();
};

module.exports = { validarSedeId, validarCrearInstructor, validarActualizarInstructor, validarEspecialidad };
