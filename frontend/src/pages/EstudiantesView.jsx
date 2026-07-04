import React, { useState, useEffect, useCallback } from 'react';
import { estudiantesService } from '../service/estudiantes.Service';
import { getSedes } from '../service/reservas.Service';

function PerfilCard({ perfil, editando, editForm, setEditForm, onEdit, onCancel, onSave }) {
  if (!perfil) return null;

  const horas = perfil.horasPracticas || {};
  const porcentaje = horas.porcentaje || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          {editando ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={editForm.nombre}
                onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Nombre"
              />
              <input
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Email"
              />
              <input
                value={editForm.telefono}
                onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Telefono"
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800">{perfil.nombre}</h2>
              <p className="text-sm text-gray-500">{perfil.email} - {perfil.rut}</p>
              <p className="text-sm text-gray-500">{perfil.sede?.nombre}</p>
            </>
          )}
        </div>

        {editando ? (
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
              Cancelar
            </button>
            <button onClick={onSave} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium">
              Guardar
            </button>
          </div>
        ) : (
          <button onClick={onEdit} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium">
            Editar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Completadas</p>
          <p className="text-2xl font-bold text-blue-600">{(horas.completadas || 0).toFixed(1)}h</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Requeridas</p>
          <p className="text-2xl font-bold text-gray-600">{horas.requeridas || 0}h</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Por completar</p>
          <p className="text-2xl font-bold text-orange-600">{(horas.falta || 0).toFixed(1)}h</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Progreso</p>
          <p className="text-2xl font-bold text-green-600">{porcentaje}%</p>
        </div>
      </div>

      <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
        <div className="bg-green-500 h-3 rounded-full" style={{ width: `${Math.min(porcentaje, 100)}%` }} />
      </div>
    </div>
  );
}

function ModulosCard({ modulos, modulosDisponibles, moduloSeleccionado, setModuloSeleccionado, onAsignar, onActualizarProgreso }) {
  const [expandedId, setExpandedId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const asignados = new Set(modulos.map((m) => m.modulo_id));
  const disponibles = modulosDisponibles.filter((m) => !asignados.has(m.id));

  const getDraft = (modulo) => drafts[modulo.id] || {
    aprobado: !!modulo.aprobado,
    calificacion: modulo.calificacion ?? '',
  };

  const updateDraft = (modulo, cambios) => {
    setDrafts({
      ...drafts,
      [modulo.id]: { ...getDraft(modulo), ...cambios },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center gap-3 mb-4">
        <h3 className="text-lg font-bold text-gray-800">Modulos Teoricos</h3>
        <div className="flex gap-2">
          <select
            value={moduloSeleccionado}
            onChange={(e) => setModuloSeleccionado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Asignar modulo</option>
            {disponibles.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
          <button
            onClick={onAsignar}
            disabled={!moduloSeleccionado}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Asignar
          </button>
        </div>
      </div>

      {modulos.length === 0 ? (
        <div className="text-center text-gray-500 py-6">No hay modulos asignados</div>
      ) : (
        <div className="space-y-3">
          {modulos.map((modulo) => {
            const draft = getDraft(modulo);
            return (
              <div key={modulo.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{modulo.modulo_nombre}</h4>
                    <p className="text-sm text-gray-500">{modulo.aprobado ? 'Aprobado' : 'Pendiente'}</p>
                  </div>
                  {modulo.calificacion !== null && modulo.calificacion !== undefined && (
                    <div className="text-2xl font-bold text-blue-600">{modulo.calificacion}</div>
                  )}
                </div>

                {expandedId === modulo.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={draft.calificacion}
                      onChange={(e) => updateDraft(modulo, { calificacion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Calificacion 0-100"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={draft.aprobado}
                        onChange={(e) => updateDraft(modulo, { aprobado: e.target.checked })}
                      />
                      Aprobado
                    </label>
                    <button
                      onClick={() => onActualizarProgreso(modulo, draft, () => setExpandedId(null))}
                      className="w-full px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium"
                    >
                      Guardar progreso
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setExpandedId(expandedId === modulo.id ? null : modulo.id)}
                  className="mt-3 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
                >
                  {expandedId === modulo.id ? 'Cancelar' : 'Editar progreso'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TimelineCard({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
        No hay clases registradas
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Historial de Clases</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {timeline.map((clase) => {
          const fecha = clase.fecha || clase.fecha_inicio;
          const instructor = clase.instructor || clase.instructor_nombre || 'Sin instructor';
          const vehiculo = clase.vehiculo || clase.vehiculo_patente || clase.vehiculo_modelo || 'N/A';
          return (
            <div key={clase.id} className="flex gap-4 p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{instructor}</p>
                <p className="text-sm text-gray-600">{vehiculo}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {fecha ? new Date(fecha).toLocaleString('es-CL') : 'Sin fecha'}
                </p>
              </div>
              <span className="h-fit px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {clase.estado}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EstudiantesView() {
  const [tab, setTab] = useState('lista');
  const [estudiantes, setEstudiantes] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [modulosDisponibles, setModulosDisponibles] = useState([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [sedeFiltro, setSedeFiltro] = useState('');
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState({ nombre: '', email: '', telefono: '' });
  const [formData, setFormData] = useState({ nombre: '', email: '', rut: '', telefono: '', sedeId: 1 });

  useEffect(() => {
    getSedes()
      .then((data) => {
        setSedes(data);
        if (data[0]?.id) setFormData((prev) => ({ ...prev, sedeId: data[0].id }));
      })
      .catch(() => setSedes([]));
  }, []);

  const cargarEstudiantes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = busqueda.trim() || null;
      const datos = q || sedeFiltro
        ? await estudiantesService.buscarEstudiantes(sedeFiltro || null, q)
        : await estudiantesService.getListaEstudiantes();
      setEstudiantes(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(`Error al cargar estudiantes: ${err.message}`);
      setEstudiantes([]);
    } finally {
      setLoading(false);
    }
  }, [busqueda, sedeFiltro]);

  const cargarPerfil = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setEditando(false);
    try {
      const [perfilData, modulosData, timelineData, disponiblesData] = await Promise.all([
        estudiantesService.getPerfilEstudiante(id),
        estudiantesService.getModulosEstudiante(id),
        estudiantesService.getTimeline(id),
        estudiantesService.getModulosTeoricos(),
      ]);

      setPerfil(perfilData);
      setEditForm({
        nombre: perfilData.nombre || '',
        email: perfilData.email || '',
        telefono: perfilData.telefono || '',
      });
      setModulos(modulosData?.modulos || []);
      setTimeline(Array.isArray(timelineData) ? timelineData : []);
      setModulosDisponibles(disponiblesData?.modulos || []);
      setModuloSeleccionado('');
      setTab('perfil');
    } catch (err) {
      setError(`Error al cargar perfil: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEstudiantes();
  }, [cargarEstudiantes]);

  const handleCrear = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await estudiantesService.crearEstudiante(formData);
      setFormData({ nombre: '', email: '', rut: '', telefono: '', sedeId: sedes[0]?.id || 1 });
      setTab('lista');
      await cargarEstudiantes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const guardarPerfil = async () => {
    if (!perfil) return;
    setLoading(true);
    setError(null);
    try {
      await estudiantesService.actualizarEstudiante(perfil.id, editForm);
      await cargarPerfil(perfil.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const asignarModulo = async () => {
    if (!perfil || !moduloSeleccionado) return;
    setLoading(true);
    setError(null);
    try {
      await estudiantesService.asignarModulo(perfil.id, moduloSeleccionado);
      await cargarPerfil(perfil.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarProgreso = async (modulo, draft, cerrar) => {
    if (!perfil) return;
    setLoading(true);
    setError(null);
    try {
      await estudiantesService.actualizarProgreso(perfil.id, modulo.modulo_id, {
        aprobado: draft.aprobado,
        calificacion: draft.calificacion === '' ? 0 : Number(draft.calificacion),
      });
      cerrar?.();
      await cargarPerfil(perfil.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 font-body bg-neutral min-h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Trazabilidad Academica</h1>
        {tab === 'lista' && (
          <button onClick={() => setTab('crear')} className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium">
            + Nuevo Estudiante
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 bg-white rounded-lg border border-gray-200 p-1.5 w-fit">
        <button onClick={() => setTab('lista')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'lista' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}>
          Estudiantes
        </button>
        <button onClick={() => setTab('crear')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'crear' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}>
          Crear
        </button>
        <button disabled={!perfil} onClick={() => setTab('perfil')} className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${tab === 'perfil' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}>
          Perfil
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">{error}</div>}

      {tab === 'lista' && (
        <div>
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white md:w-80"
              placeholder="Buscar por nombre, email o RUT"
            />
            <select
              value={sedeFiltro}
              onChange={(e) => setSedeFiltro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">Todas las sedes</option>
              {sedes.map((sede) => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}
            </select>
            <button onClick={cargarEstudiantes} className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium">
              Buscar
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : estudiantes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay estudiantes registrados</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {estudiantes.map((est) => (
                <button
                  key={est.id}
                  className="text-left bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                  onClick={() => cargarPerfil(est.id)}
                >
                  <h3 className="font-semibold text-gray-800">{est.nombre}</h3>
                  <p className="text-sm text-gray-500 mt-1">{est.email}</p>
                  <p className="text-xs text-gray-400 mt-2">RUT: {est.rut}</p>
                  <div className="mt-3 text-xs text-gray-600">
                    <p>Sede: {est.sede?.nombre || 'Sin sede'}</p>
                    <p>Clases: {est.totalClases || 0}</p>
                    <p>Horas: {(est.horasTotales || 0).toFixed(1)}h</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'crear' && (
        <form onSubmit={handleCrear} className="max-w-2xl">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Nombre" />
              <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Email" />
              <input required value={formData.rut} onChange={(e) => setFormData({ ...formData, rut: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="RUT" />
              <input value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" placeholder="Telefono" />
            </div>
            <select
              value={formData.sedeId}
              onChange={(e) => setFormData({ ...formData, sedeId: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {sedes.map((sede) => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}
            </select>
            <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50">
              {loading ? 'Creando...' : 'Crear Estudiante'}
            </button>
          </div>
        </form>
      )}

      {tab === 'perfil' && perfil && (
        <div className="space-y-6">
          <PerfilCard
            perfil={perfil}
            editando={editando}
            editForm={editForm}
            setEditForm={setEditForm}
            onEdit={() => setEditando(true)}
            onCancel={() => setEditando(false)}
            onSave={guardarPerfil}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModulosCard
              modulos={modulos}
              modulosDisponibles={modulosDisponibles}
              moduloSeleccionado={moduloSeleccionado}
              setModuloSeleccionado={setModuloSeleccionado}
              onAsignar={asignarModulo}
              onActualizarProgreso={actualizarProgreso}
            />
            <TimelineCard timeline={timeline} />
          </div>
        </div>
      )}
    </div>
  );
}
