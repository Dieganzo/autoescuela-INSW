import React, { useState, useEffect, useCallback } from 'react';
import { obtenerInventarioFlota, crearVehiculo, actualizarVehiculo, eliminarVehiculo, obtenerHistorialVehiculo } from '../service/dashboard.Service.js';
import TarjetaVehiculo from '../components/TarjetaVehiculo.jsx';
import ModalFinalizarSesion from '../components/ModalFinalizarSesion';
import { Car, Plus, X, History } from 'lucide-react';
import { useSocket } from '../hooks/useSocket.js';

export default function FlotaView({ sedeActiva }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [autoSeleccionado, setAutoSeleccionado] = useState(null);

  // Estados para Modal CRUD 
  const [modalCRUDAbierto, setModalCRUDAbierto] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState(null);
  const [formData, setFormData] = useState({
    patente: '', modelo: '', sede_id: '', motivo: '',
    estado: 'disponible', kilometraje_actual: 0, km_ultimo_aceite: 0,
    km_proximo_mantenimiento: 10000, fecha_revision_tecnica: '',
  });

  // Estados para Historial (Trazabilidad)
  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
  const [historialData, setHistorialData] = useState([]);

  const socket = useSocket(sedeActiva);

  // Escucha eventos de actualización de vehículos en tiempo real
   useEffect(() => {
    if (!socket || typeof socket.on !== 'function') {
      console.warn("Socket no disponible, omitiendo suscripcion a eventos.");
      return;
    }
    const manejarVehiculoActualizado = (vehiculoActualizado) => {
      setVehiculos((prev) => prev.map((v) => (v.id === vehiculoActualizado.id ? vehiculoActualizado : v)));
    };
    socket.on('vehiculo:actualizado', manejarVehiculoActualizado);
    return () => socket.off('vehiculo:actualizado', manejarVehiculoActualizado);
  }, [socket]);

  // Función para cargar datos de la flota desde el backend
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const v = await obtenerInventarioFlota(sedeActiva !== 'all' ? sedeActiva : null);
      setVehiculos(v || []);
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    } finally {
      setLoading(false);
    }
  }, [sedeActiva]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // --- FUNCIONES CRUD ---
  const abrirModalCrear = () => {
    setVehiculoEditando(null);
    setFormData({
      patente: '', modelo: '', sede_id: sedeActiva !== 'all' ? sedeActiva : 1, motivo: '',
      estado: 'disponible', kilometraje_actual: 0, km_ultimo_aceite: 0,
      km_proximo_mantenimiento: 10000, fecha_revision_tecnica: '',
    });
    setModalCRUDAbierto(true);
  };

  const abrirModalEditar = (vehiculo) => {
    setVehiculoEditando(vehiculo);
    setFormData({
      patente: vehiculo.patente,
      modelo: vehiculo.modelo,
      sede_id: vehiculo.sede_id,
      motivo: '',
      estado: vehiculo.estado || 'disponible',
      kilometraje_actual: vehiculo.kilometraje_actual ?? 0,
      km_ultimo_aceite: vehiculo.km_ultimo_aceite ?? 0,
      km_proximo_mantenimiento: vehiculo.km_proximo_mantenimiento ?? 10000,
      fecha_revision_tecnica: vehiculo.fecha_revision_tecnica
        ? new Date(vehiculo.fecha_revision_tecnica).toISOString().slice(0, 10)
        : '',
    });
    setModalCRUDAbierto(true);
  };

 const guardarVehiculo = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        sede_id: parseInt(formData.sede_id, 10),
        kilometraje_actual: parseInt(formData.kilometraje_actual, 10) || 0,
        km_ultimo_aceite: parseInt(formData.km_ultimo_aceite, 10) || 0,
        km_proximo_mantenimiento: parseInt(formData.km_proximo_mantenimiento, 10) || 0,
        fecha_revision_tecnica: formData.fecha_revision_tecnica || null,
      };
      if (vehiculoEditando) {
        await actualizarVehiculo(vehiculoEditando.id, payload);
      } else {
        await crearVehiculo(payload);
      }
      setModalCRUDAbierto(false);
      cargarDatos(); 
    } catch (error) {
      alert("Error al guardar vehículo: " + error.message);
    }
  };

  const manejarEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer.")) return;
      const motivo = window.prompt("¿Por qué se elimina este vehículo? (motivo obligatorio para trazabilidad)");
    if (!motivo) {
      alert("Debes indicar un motivo para eliminar el vehículo.");
      return;
    }
    try {
      await eliminarVehiculo(id, motivo);
        cargarDatos();
    } catch (error) {
        alert("Error al eliminar: " + error.message);
    }
  };

  const verHistorial = async (id) => {
    try {
      const data = await obtenerHistorialVehiculo(id);
      setHistorialData(data || []);
      setModalHistorialAbierto(true);
    } catch (error) {
      alert("Error al cargar historial");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-blue-900">VISTA DE FLOTA </h1>
      
      {/* HEADER DE INVENTARIO CON BOTÓN NUEVO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold font-headline text-gray-900 flex items-center gap-2">
            <Car className="text-primary" size={28} /> Gestión de Flota
          </h1>
          <p className="text-sm text-gray-500 mt-1">Administra el inventario de vehículos, atributos y trazabilidad.</p>
        </div>
        <button onClick={abrirModalCrear} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
          <Plus size={20} /> Nuevo Vehículo
        </button>
      </div>

      {/* GRID DE INVENTARIO CRUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {vehiculos.map((auto) => (
          <TarjetaVehiculo 
            key={auto.id} 
            vehiculo={auto} 
            onEditar={abrirModalEditar}
            onEliminar={manejarEliminar}
            onVerHistorial={verHistorial}
            alFinalizar={() => { 
              setAutoSeleccionado(auto); 
              setModalAbierto(true); 
            }} 
          />
        ))}
      </div>

      {/* MODAL DE LIBERACION DE KM */}
      {autoSeleccionado && (
        <ModalFinalizarSesion 
          abierto={modalAbierto} 
          vehiculoId={autoSeleccionado.id}
          patente={autoSeleccionado.patente}
          alCerrar={() => setModalAbierto(false)} 
          alCompletar={cargarDatos} 
        />
      )}

      {/* MODAL CRUD (NUEVO/EDITAR) */}
      {modalCRUDAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{vehiculoEditando ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}</h3>
              <button onClick={() => setModalCRUDAbierto(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-1.5 rounded-full"><X size={18}/></button>
            </div>
            <form onSubmit={guardarVehiculo} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Patente</label>
                <input type="text" required value={formData.patente} onChange={e => setFormData({...formData, patente: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 uppercase bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Ej: AB123CD"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Modelo</label>
                <input type="text" required value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Ej: Toyota Yaris 2022"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="disponible">Disponible</option>
                  <option value="en_sesion">En sesión</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Kilometraje actual</label>
                <input type="number" min="0" value={formData.kilometraje_actual} onChange={e => setFormData({...formData, kilometraje_actual: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Km último cambio de aceite</label>
                <input type="number" min="0" value={formData.km_ultimo_aceite} onChange={e => setFormData({...formData, km_ultimo_aceite: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Km próximo mantenimiento</label>
                <input type="number" min="0" value={formData.km_proximo_mantenimiento} onChange={e => setFormData({...formData, km_proximo_mantenimiento: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha de revisión técnica</label>
                <input type="date" value={formData.fecha_revision_tecnica} onChange={e => setFormData({...formData, fecha_revision_tecnica: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo del cambio </label>
                <input type="text" value={formData.motivo} onChange={e => setFormData({...formData, motivo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Ej: Se corrige patente mal ingresada"/>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setModalCRUDAbierto(false)} className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 text-white bg-primary rounded-xl font-bold hover:bg-primary/90 transition-colors">Guardar Vehículo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAL DE TRAZABILIDAD */}
      {modalHistorialAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <History className="text-primary" /> Historial de Trazabilidad
              </h3>
              <button onClick={() => setModalHistorialAbierto(false)} className="text-gray-400 hover:text-gray-600 bg-gray-200 p-1.5 rounded-full"><X size={18}/></button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {historialData.length === 0 ? (
                <p className="text-center text-gray-500 py-16 font-medium">No hay registros de cambios para este vehículo.</p>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Fecha y Hora</th>
                      <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Acción</th>
                      <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Campo Modificado</th>
                      <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Valor Nuevo</th>
                      <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Usuario / Sistema</th>
                      <th className="p-4 font-semibold uppercase tracking-wider text-[11px]">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialData.map((reg, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                        <td className="p-4 text-gray-600 font-medium whitespace-nowrap">{new Date(reg.creado_en).toLocaleString('es-CL')}</td>
                        <td className="p-4 font-bold text-blue-600 uppercase text-[10px] tracking-wider">{reg.accion.replace(/_/g, ' ')}</td>
                        <td className="p-4 text-gray-800 font-medium">{reg.campo || '-'}</td>
                        <td className="p-4 font-bold text-gray-900">{reg.valor_nuevo || '-'}</td>
                        <td className="p-4 text-gray-500">{reg.usuario || 'Sistema Automático'}</td>
                        <td className="p-4 text-gray-500 italic">{reg.motivo || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}