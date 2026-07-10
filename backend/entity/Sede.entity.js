const { EntitySchema } = require('typeorm');

const Sede = new EntitySchema({
  name: 'Sede',
  tableName: 'sedes',
  columns: {
    id: { primary: true, type: 'int' },
    nombre: { type: 'varchar' },
  },
});

module.exports = Sede;
