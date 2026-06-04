const { EntitySchema } = require('typeorm');

const Instructor = new EntitySchema({
  name: 'Instructor',
  tableName: 'instructores',
    columns: {
    instructor_id: { primary: true, type: 'int', generated: true },
    nombre: { type: 'varchar', length: 50, nullable: true },
    apellido: { type: 'varchar', length: 50, nullable: true },
    especialidad: { type: 'varchar', length: 15, nullable: true },
    estado: { type: 'varchar', default: 'activo' },
    calificacion: { type: 'decimal', precision: 2, scale: 1, nullable: true },
    clases_impartidas: { type: 'int', default: 0 },
    sede_id: { type: 'int', nullable: true },
  },
    relations: {
    sede: {
      type: 'many-to-one',
      target: 'Sede',
        joinColumn: { name: 'sede_id' },
    },
    },
});

module.exports = Instructor;