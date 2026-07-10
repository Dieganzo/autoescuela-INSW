import React from 'react';
import { AlertTriangle, Car, Calendar, Edit, Trash2, History } from 'lucide-react'; 

const TarjetaVehiculo = ({ vehiculo, onEditar, onEliminar, onVerHistorial, alFinalizar }) => {
  // Determinar si el vehiculo tiene alertas criticas o de advertencia
  const alertas = vehiculo.alertas || [];
  const tieneCritico = alertas.some((a) => a.tipo === 'critico');
  const tieneAdvertencia = alertas.some((a) => a.tipo === 'advertencia');
  const tieneAlertas = alertas.length > 0;

  return (
    // Agregamos flex, flex-col, justify-between y h-full para que todas las tarjetas midan lo mismo
    <div className={`flex flex-col justify-between p-5 rounded-2xl border-2 transition-all h-full ${
      tieneCritico
        ? 'bg-red-50 border-red-500 shadow-red-100' 
        : tieneAdvertencia
        ? 'bg-orange-50 border-orange-400 shadow-orange-100' 
        : 'bg-white border-gray-100 shadow-md hover:shadow-lg' 
    }`}>
      
      {/* --- PARTE SUPERIOR (Icono, Estado y Botones de Accion) --- */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${
            tieneCritico ? 'bg-red-100' : tieneAdvertencia ? 'bg-orange-100' : 'bg-blue-50'
          }`}>
            <Car className={
              tieneCritico ? 'text-red-600' : tieneAdvertencia ? 'text-orange-600' : 'text-blue-600'
            } size={28} />
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              vehiculo.estado === 'disponible' ? 'bg-green-100 text-green-700' : 
              vehiculo.estado === 'mantenimiento' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {vehiculo.estado.replace('_', ' ')}
            </span>

            {/* BOTONES CRUD (Editar, Historial, Eliminar) */}
            <div className="flex gap-1 mt-1">
              <button onClick={() => onVerHistorial(vehiculo.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver Historial">
                <History size={16} />
              </button>
              <button onClick={() => onEditar(vehiculo)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                <Edit size={16} />
              </button>
              <button onClick={() => onEliminar(vehiculo.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* --- DATOS PRINCIPALES --- */}
        <h3 className="font-black text-gray-900 text-xl">{vehiculo.patente}</h3>
        <p className="text-gray-500 text-sm font-medium mb-4">{vehiculo.modelo} • {vehiculo.sede_nombre}</p>

        <div className="space-y-3">
          <div className="flex justify-between text-sm bg-white/50 p-2 rounded-lg">
            <span className="text-gray-500 font-medium">Kilometraje:</span>
            <span className="font-bold text-gray-800">{vehiculo.kilometraje_actual} km</span>
          </div>

          {/* Sección de Alertas */}
          {tieneAlertas && (
            <div className="mt-3 space-y-2">
              {alertas.map((alerta, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 p-3 rounded-xl text-xs font-bold ${
                    alerta.tipo === 'critico'
                      ? 'bg-red-100/80 text-red-700 border border-red-200'
                      : 'bg-orange-100/80 text-orange-800 border border-orange-200'
                  }`}
                >
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{alerta.mensaje}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- PARTE INFERIOR (Boton liberar y Fecha) --- */}
      <div className="mt-6">
        {vehiculo.estado === 'en_sesion' && (
          <button
            onClick={alFinalizar}
            className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all active:scale-95"
          >
            Liberar Vehículo
          </button>
        )}

        {vehiculo.fecha_revision_tecnica ? (
          <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Rev. Técnica</span>
            </div>
            <span className="text-sm font-black text-gray-700">
              {new Date(vehiculo.fecha_revision_tecnica).toLocaleDateString('es-CL')}
            </span>
          </div>
        ) : (
          <div className="pt-3 border-t border-gray-200/60 text-xs text-gray-400 text-center italic">
            Sin fecha de revisión registrada
          </div>
        )}
      </div>

    </div>
  );
};

export default TarjetaVehiculo;