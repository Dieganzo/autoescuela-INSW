// ═══════════════════════════════════════════════════════════════
// API Service para Requisito 3: Trazabilidad Académica
// ═══════════════════════════════════════════════════════════════

const BASE_URL = '/api/estudiantes';

export const estudiantesService = {
  // Obtener todos los módulos teóricos
  async getModulosTeoricos() {
    try {
      const res = await fetch(`${BASE_URL}/teoria/modulos`);
      if (!res.ok) throw new Error('Error al obtener módulos');
      return await res.json();
    } catch (error) {
      console.error('Error en getModulosTeoricos:', error);
      throw error;
    }
  },

  // Crear un nuevo estudiante
  async crearEstudiante(datos) {
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al crear estudiante');
      }
      return await res.json();
    } catch (error) {
      console.error('Error en crearEstudiante:', error);
      throw error;
    }
  },

  // Obtener perfil del estudiante
  async getPerfilEstudiante(id) {
    try {
      const res = await fetch(`${BASE_URL}/${id}`);
      if (!res.ok) throw new Error('Error al obtener perfil');
      return await res.json();
    } catch (error) {
      console.error('Error en getPerfilEstudiante:', error);
      throw error;
    }
  },

  // Buscar estudiantes
  // Obtener lista simple de estudiantes
  async getListaEstudiantes() {
    try {
      const res = await fetch(`${BASE_URL}/list`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error en getListaEstudiantes:', error);
      throw error;
    }
  },

  async buscarEstudiantes(sedeId = null, q = null) {
    try {
      // Construir query string - siempre enviar al menos sedeId si no hay q
      let url = BASE_URL;
      const params = new URLSearchParams();
      
      if (sedeId) params.append('sedeId', sedeId);
      if (q) params.append('q', q);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Fetching URL:', url);
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
      console.error('Error en buscarEstudiantes:', error);
      throw error;
    }
  },

  // Obtener módulos del estudiante
  async getModulosEstudiante(estudianteId) {
    try {
      const res = await fetch(`${BASE_URL}/${estudianteId}/modulos`);
      if (!res.ok) throw new Error('Error al obtener módulos');
      return await res.json();
    } catch (error) {
      console.error('Error en getModulosEstudiante:', error);
      throw error;
    }
  },

  // Asignar módulo a estudiante
  async asignarModulo(estudianteId, moduloId) {
    try {
      const res = await fetch(`${BASE_URL}/${estudianteId}/modulos/${moduloId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!res.ok) throw new Error('Error al asignar módulo');
      return await res.json();
    } catch (error) {
      console.error('Error en asignarModulo:', error);
      throw error;
    }
  },

  // Actualizar progreso de módulo
  async actualizarProgreso(estudianteId, moduloId, datos) {
    try {
      const res = await fetch(`${BASE_URL}/${estudianteId}/modulos/${moduloId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error('Error al actualizar progreso');
      return await res.json();
    } catch (error) {
      console.error('Error en actualizarProgreso:', error);
      throw error;
    }
  },

  // Obtener timeline del estudiante
  async getTimeline(estudianteId) {
    try {
      const res = await fetch(`${BASE_URL}/${estudianteId}/timeline`);
      if (!res.ok) throw new Error('Error al obtener timeline');
      return await res.json();
    } catch (error) {
      console.error('Error en getTimeline:', error);
      throw error;
    }
  },

  // Actualizar datos del estudiante
  async actualizarEstudiante(estudianteId, datos) {
    try {
      const res = await fetch(`${BASE_URL}/${estudianteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error('Error al actualizar estudiante');
      return await res.json();
    } catch (error) {
      console.error('Error en actualizarEstudiante:', error);
      throw error;
    }
  },

  // Eliminar estudiante
  async eliminarEstudiante(estudianteId) {
    try {
      const res = await fetch(`${BASE_URL}/${estudianteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al eliminar estudiante');
      }
      return await res.json();
    } catch (error) {
      console.error('Error en eliminarEstudiante:', error);
      throw error;
    }
  },
};
