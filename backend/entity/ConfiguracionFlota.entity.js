const { EntitySchema } = require('typeorm');

const ConfiguracionFlota = new EntitySchema({
  name: 'ConfiguracionFlota',
  tableName: 'configuracion_flota',
  columns: {
    id: { primary: true, type: 'int', generated: true },
    km_alerta_aceite: { type: 'int', default: 10000, nullable: false },
    dias_aviso_revision: { type: 'int', default: 30, nullable: false },
    sede_id: { type: 'int', nullable: true }, // null = configuracion global
    actualizado_en: { type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false },
  },
});

module.exports = ConfiguracionFlota;