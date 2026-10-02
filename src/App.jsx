import React, { useState, useEffect } from 'react';
import {
  PacientesService,
  MedicosService,
  CitasService,
  ConsultoriosService,
  EspecialidadesService
} from './services/api';
import './App.css';

export default function App() {
  const [tab, setTab] = useState('citas');
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [consultorios, setConsultorios] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState({ texto: '', tipo: '' });

  // Formulario nueva Cita
  const [formCita, setFormCita] = useState({
    pacienteID: '',
    medicoID: '',
    consultorioID: '',
    fechaHora: '',
    motivo: '',
    estado: 'Programada'
  });

  // Formulario nuevo Paciente
  const [formPaciente, setFormPaciente] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    telefono: ''
  });

  // Formulario nuevo Médico
  const [formMedico, setFormMedico] = useState({
    nombre: '',
    apellido: '',
    especialidadID: '',
    email: '',
    licencia: ''
  });

  // Buscador de Historial
  const [busquedaDni, setBusquedaDni] = useState('');
  const [busquedaEstado, setBusquedaEstado] = useState('Programada');
  const [historialResultados, setHistorialResultados] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const mostrarMensaje = (texto, tipo = 'exito') => {
    setAlerta({ texto, tipo });
    setTimeout(() => setAlerta({ texto: '', tipo: '' }), 4000);
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [citasRes, pacRes, medRes, consRes, espRes] = await Promise.all([
        CitasService.getAll().catch(() => []),
        PacientesService.getAll().catch(() => []),
        MedicosService.getAll().catch(() => []),
        ConsultoriosService.getAll().catch(() => []),
        EspecialidadesService.getAll().catch(() => [])
      ]);
      setCitas(citasRes);
      setPacientes(pacRes);
      setMedicos(medRes);
      setConsultorios(consRes);
      setEspecialidades(espRes);
    } catch (err) {
      mostrarMensaje('Error de conexión con el backend: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Crear Cita
  const handleCrearCita = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        paciente: { pacienteID: parseInt(formCita.pacienteID) },
        medico: { medicoID: parseInt(formCita.medicoID) },
        consultorio: { consultorioID: parseInt(formCita.consultorioID) },
        fechaHora: formCita.fechaHora,
        motivo: formCita.motivo,
        estado: formCita.estado
      };

      await CitasService.create(payload);
      mostrarMensaje('Cita agendada correctamente');
      setFormCita({
        pacienteID: '',
        medicoID: '',
        consultorioID: '',
        fechaHora: '',
        motivo: '',
        estado: 'Programada'
      });
      cargarDatos();
    } catch (err) {
      mostrarMensaje('Error agendando cita: ' + err.message, 'error');
    }
  };

  // Cancelar/Eliminar Cita
  const handleEliminarCita = async (id) => {
    if (!window.confirm('¿Seguro que deseas cancelar esta cita?')) return;
    try {
      await CitasService.delete(id);
      mostrarMensaje('Cita eliminada');
      cargarDatos();
    } catch (err) {
      mostrarMensaje('Error al eliminar cita: ' + err.message, 'error');
    }
  };

  // Crear Paciente
  const handleCrearPaciente = async (e) => {
    e.preventDefault();
    try {
      await PacientesService.create(formPaciente);
      mostrarMensaje('Paciente registrado correctamente');
      setFormPaciente({ nombre: '', apellido: '', dni: '', fechaNacimiento: '', telefono: '' });
      cargarDatos();
    } catch (err) {
      mostrarMensaje('Error creando paciente: ' + err.message, 'error');
    }
  };

  // Crear Médico
  const handleCrearMedico = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: formMedico.nombre,
        apellido: formMedico.apellido,
        email: formMedico.email,
        licencia: formMedico.licencia,
        especialidad: { especialidadID: parseInt(formMedico.especialidadID) }
      };
      await MedicosService.create(payload);
      mostrarMensaje('Médico registrado correctamente');
      setFormMedico({ nombre: '', apellido: '', especialidadID: '', email: '', licencia: '' });
      cargarDatos();
    } catch (err) {
      mostrarMensaje('Error registrando médico: ' + err.message, 'error');
    }
  };

  // Buscar Historial por DNI y Estado
  const handleBuscarHistorial = async (e) => {
    e.preventDefault();
    if (!busquedaDni.trim()) return;
    try {
      const res = await CitasService.getHistorialPaciente(busquedaDni, busquedaEstado);
      setHistorialResultados(res || []);
      if (!res || res.length === 0) {
        mostrarMensaje('No se encontraron registros para ese DNI y estado', 'error');
      }
    } catch (err) {
      mostrarMensaje('Error buscando historial: ' + err.message, 'error');
    }
  };

  return (
    <div className="app-wrapper">
      <header className="main-header">
        <h1>🏥 Centro Médico</h1>
        <nav className="nav-tabs">
          <button className={tab === 'citas' ? 'active' : ''} onClick={() => setTab('citas')}>
            Citas
          </button>
          <button className={tab === 'pacientes' ? 'active' : ''} onClick={() => setTab('pacientes')}>
            Pacientes
          </button>
          <button className={tab === 'medicos' ? 'active' : ''} onClick={() => setTab('medicos')}>
            Médicos
          </button>
          <button className={tab === 'historial' ? 'active' : ''} onClick={() => setTab('historial')}>
            Historial DNI
          </button>
        </nav>
      </header>

      {alerta.texto && (
        <div className={`alert ${alerta.tipo}`}>
          <span>{alerta.texto}</span>
        </div>
      )}

      {loading && <p style={{ textAlign: 'center' }}>Cargando datos del servidor...</p>}

      {/* ================= PESTAÑA: CITAS ================= */}
      {tab === 'citas' && (
        <>
          <div className="card">
            <h2>Agendar Nueva Cita</h2>
            <form onSubmit={handleCrearCita} className="form-grid">
              <div className="form-group">
                <label>Paciente</label>
                <select
                  required
                  value={formCita.pacienteID}
                  onChange={(e) => setFormCita({ ...formCita, pacienteID: e.target.value })}
                >
                  <option value="">Seleccione Paciente</option>
                  {pacientes.map((p) => (
                    <option key={p.pacienteID} value={p.pacienteID}>
                      {p.nombre} {p.apellido} (DNI: {p.dni})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Médico</label>
                <select
                  required
                  value={formCita.medicoID}
                  onChange={(e) => setFormCita({ ...formCita, medicoID: e.target.value })}
                >
                  <option value="">Seleccione Médico</option>
                  {medicos.map((m) => (
                    <option key={m.medicoID} value={m.medicoID}>
                      Dr. {m.nombre} {m.apellido} ({m.especialidad?.nombre || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Consultorio</label>
                <select
                  required
                  value={formCita.consultorioID}
                  onChange={(e) => setFormCita({ ...formCita, consultorioID: e.target.value })}
                >
                  <option value="">Seleccione Consultorio</option>
                  {consultorios.map((c) => (
                    <option key={c.consultorioID} value={c.consultorioID}>
                      #{c.numero} - Piso {c.piso} ({c.tipoConsultorio})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha y Hora</label>
                <input
                  type="datetime-local"
                  required
                  value={formCita.fechaHora}
                  onChange={(e) => setFormCita({ ...formCita, fechaHora: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Motivo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Chequeo general"
                  value={formCita.motivo}
                  onChange={(e) => setFormCita({ ...formCita, motivo: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-submit">
                Guardar Cita
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Citas Registradas ({citas.length})</h2>
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha / Hora</th>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th>Consultorio</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-state">No hay citas agendadas</td>
                    </tr>
                  ) : (
                    citas.map((c) => (
                      <tr key={c.citaID}>
                        <td>{c.citaID}</td>
                        <td>{c.fechaHora?.replace('T', ' ')}</td>
                        <td>{c.paciente ? `${c.paciente.nombre} ${c.paciente.apellido}` : 'N/A'}</td>
                        <td>{c.medico ? `Dr. ${c.medico.nombre} ${c.medico.apellido}` : 'N/A'}</td>
                        <td>{c.consultorio ? `Cons. ${c.consultorio.numero}` : 'N/A'}</td>
                        <td>{c.motivo}</td>
                        <td>
                          <span className={`badge ${c.estado?.toLowerCase()}`}>
                            {c.estado}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-delete"
                            onClick={() => handleEliminarCita(c.citaID)}
                          >
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= PESTAÑA: PACIENTES ================= */}
      {tab === 'pacientes' && (
        <>
          <div className="card">
            <h2>Registrar Paciente</h2>
            <form onSubmit={handleCrearPaciente} className="form-grid">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  required
                  value={formPaciente.nombre}
                  onChange={(e) => setFormPaciente({ ...formPaciente, nombre: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  required
                  value={formPaciente.apellido}
                  onChange={(e) => setFormPaciente({ ...formPaciente, apellido: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>DNI</label>
                <input
                  type="text"
                  required
                  value={formPaciente.dni}
                  onChange={(e) => setFormPaciente({ ...formPaciente, dni: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input
                  type="date"
                  required
                  value={formPaciente.fechaNacimiento}
                  onChange={(e) => setFormPaciente({ ...formPaciente, fechaNacimiento: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={formPaciente.telefono}
                  onChange={(e) => setFormPaciente({ ...formPaciente, telefono: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-submit">
                Registrar
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Listado de Pacientes</h2>
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre Completo</th>
                    <th>DNI</th>
                    <th>Nacimiento</th>
                    <th>Teléfono</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">No hay pacientes registrados</td>
                    </tr>
                  ) : (
                    pacientes.map((p) => (
                      <tr key={p.pacienteID}>
                        <td>{p.pacienteID}</td>
                        <td>{p.nombre} {p.apellido}</td>
                        <td>{p.dni}</td>
                        <td>{p.fechaNacimiento}</td>
                        <td>{p.telefono || 'Sin teléfono'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= PESTAÑA: MÉDICOS ================= */}
      {tab === 'medicos' && (
        <>
          <div className="card">
            <h2>Registrar Médico</h2>
            <form onSubmit={handleCrearMedico} className="form-grid">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  required
                  value={formMedico.nombre}
                  onChange={(e) => setFormMedico({ ...formMedico, nombre: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  required
                  value={formMedico.apellido}
                  onChange={(e) => setFormMedico({ ...formMedico, apellido: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Especialidad</label>
                <select
                  required
                  value={formMedico.especialidadID}
                  onChange={(e) => setFormMedico({ ...formMedico, especialidadID: e.target.value })}
                >
                  <option value="">Seleccione Especialidad</option>
                  {especialidades.map((esp) => (
                    <option key={esp.especialidadID} value={esp.especialidadID}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={formMedico.email}
                  onChange={(e) => setFormMedico({ ...formMedico, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Licencia</label>
                <input
                  type="text"
                  required
                  value={formMedico.licencia}
                  onChange={(e) => setFormMedico({ ...formMedico, licencia: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-submit">
                Registrar
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Plantilla Médica</h2>
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Especialidad</th>
                    <th>Licencia</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {medicos.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">No hay médicos registrados</td>
                    </tr>
                  ) : (
                    medicos.map((m) => (
                      <tr key={m.medicoID}>
                        <td>{m.medicoID}</td>
                        <td>Dr. {m.nombre} {m.apellido}</td>
                        <td>{m.especialidad?.nombre || 'General'}</td>
                        <td>{m.licencia}</td>
                        <td>{m.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ================= PESTAÑA: HISTORIAL POR DNI ================= */}
      {tab === 'historial' && (
        <div className="card">
          <h2>Buscar Historial de Citas por DNI</h2>
          <form onSubmit={handleBuscarHistorial} className="form-grid" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label>DNI del Paciente</label>
              <input
                type="text"
                required
                placeholder="Ej. 87654321B"
                value={busquedaDni}
                onChange={(e) => setBusquedaDni(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select
                value={busquedaEstado}
                onChange={(e) => setBusquedaEstado(e.target.value)}
              >
                <option value="Programada">Programada</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <button type="submit" className="btn-submit">
              Buscar
            </button>
          </form>

          {historialResultados.length > 0 && (
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Médico</th>
                    <th>Especialidad</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historialResultados.map((item, index) => (
                    <tr key={index}>
                      <td>{item.fechaHora || item.fecha || 'N/A'}</td>
                      <td>{item.nombreMedico || 'N/A'}</td>
                      <td>{item.especialidad || 'N/A'}</td>
                      <td>{item.motivo || 'N/A'}</td>
                      <td>
                        <span className={`badge ${busquedaEstado.toLowerCase()}`}>
                          {busquedaEstado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}