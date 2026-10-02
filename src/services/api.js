const BASE_URL = 'http://localhost:8080/api';

const request = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(errorMsg || `Error en la solicitud: ${response.status}`);
  }

  // Si la respuesta no contiene cuerpo (p.ej. DELETE con 204 No Content)
  if (response.status === 204) return null;

  return response.json();
};

// ================= PACIENTES =================
export const PacientesService = {
  getAll: () => request('/pacientes'),
  getById: (id) => request(`/pacientes/${id}`),
  create: (data) => request('/pacientes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/pacientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/pacientes/${id}`, {
    method: 'DELETE',
  }),
};

// ================= MÉDICOS =================
export const MedicosService = {
  getAll: () => request('/medicos'),
  getById: (id) => request(`/medicos/${id}`),
  create: (data) => request('/medicos', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/medicos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/medicos/${id}`, {
    method: 'DELETE',
  }),
};

// ================= CITAS =================
export const CitasService = {
  getAll: () => request('/citas'),
  getById: (id) => request(`/citas/${id}`),
  getResumen: () => request('/citas/resumen'),
  getEstadisticasEspecialidad: () => request('/citas/estadisticas/especialidad'),
  getHistorialPaciente: (dni) => request(`/citas/buscar-historial?dni=${encodeURIComponent(dni)}`),
  create: (data) => request('/citas', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => request(`/citas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => request(`/citas/${id}`, {
    method: 'DELETE',
  }),
};

// ================= ESPECIALIDADES Y CONSULTORIOS =================
export const EspecialidadesService = {
  getAll: () => request('/especialidades'),
};

export const ConsultoriosService = {
  getAll: () => request('/consultorios'),
};

// ================= HISTORIAS CLÍNICAS Y RECETAS =================
export const HistoriasClinicasService = {
  getAll: () => request('/historias-clinicas'),
  getById: (id) => request(`/historias-clinicas/${id}`),
  create: (data) => request('/historias-clinicas', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const MedicamentosService = {
  getAll: () => request('/medicamentos'),
};

export const RecetasService = {
  getAll: () => request('/recetas'),
  create: (data) => request('/recetas', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};