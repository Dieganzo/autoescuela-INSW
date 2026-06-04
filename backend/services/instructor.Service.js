const { appDataSource } = require('../data-source');
const Instructor = require('../entity/Instructor.entity');

async function getAllInstructors() {
  const instructorRepository = appDataSource.getRepository(Instructor);
  return await instructorRepository.find();

}

async function getPerfilInstructor(instructorId) {
  const instructorRepository = appDataSource.getRepository(Instructor);
  const instructor = await instructorRepository.findOne({
    where: { instructor_id: instructorId }
  });

  if (!instructor) {
    const error = new Error('Instructor no encontrado');
    error.status = 404;
    throw error;
  }

  return instructor;
}

async function crearInstructor(instructorData) {
    const { nombre, apellido, especialidad, sedeId } = instructorData;
    const repo = appDataSource.getRepository(Instructor);

    // Validar que sede existe
    const sedeRepository = appDataSource.getRepository('Sede');
    const sede = await sedeRepository.findOne({ where: { id: sedeId } });

    if (!sede) {
        const error = new Error('La sede no existe');
        error.status = 400;
        throw error;
    }

    const nuevoInstructor = repo.create({
        nombre,
        apellido,
        especialidad,
        sede: sede
    });

    const nuevo = await repo.save(nuevoInstructor);
    return nuevo;
}

const actualizarInstructor = async (instructorId, instructorData) => {
    const { nombre, apellido, especialidad, sedeId } = instructorData;
    const repo = appDataSource.getRepository(Instructor);

    try {
        const instructor = await repo.findOne({ where: { instructor_id: instructorId } });
        if (!instructor) {
            const error = new Error('Instructor no encontrado');
            error.status = 404;
            throw error;
        }

        if (nombre !== undefined) instructor.nombre = nombre;
        if (apellido !== undefined) instructor.apellido = apellido;
        if (especialidad !== undefined) instructor.especialidad = especialidad;
        if (sedeId !== undefined) {
            const sedeRepository = appDataSource.getRepository('Sede');
            const sede = await sedeRepository.findOne({ where: { id: sedeId } });
            if (!sede) {
                const error = new Error('La sede no existe');
                error.status = 400;
                throw error;
            }
            instructor.sede = sede;
        }

        return await repo.save(instructor);
    } catch (error) {
        throw error;
    }
}

async function eliminarInstructor(instructorId) {
    const repo = appDataSource.getRepository(Instructor);
    try {
        const instructor = await repo.findOne({ where: { instructor_id: instructorId } });
        if (!instructor) {
            const error = new Error('Instructor no encontrado');
            error.status = 404;
            throw error;
        }
        await repo.remove(instructor);
        return { mensaje: 'Instructor eliminado exitosamente' };
    } catch (error) {
        throw error;
    }
}

module.exports = { getAllInstructors, getPerfilInstructor, crearInstructor, actualizarInstructor, eliminarInstructor };