import React, { useState, useMemo } from 'react';
import 'DashboardInscripciones.css';

export const DashboardInscripciones = () => {
  // 1. Estado principal de datos y UI[cite: 3]
  const [alumnos, setAlumnos] = useState([]); // Arreglo principal de alumnos[cite: 3]
  const [turnoFiltro, setTurnoFiltro] = useState('Todos');[cite: 3]
  const [verPrevisualizacion, setVerPrevisualizacion] = useState(false);[cite: 3]

  // 2. Filtrado de la lista según el turno seleccionado[cite: 3]
  const alumnosFiltrados = useMemo(() => {
    if (turnoFiltro === 'Todos') return alumnos;[cite: 3]
    return alumnos.filter(alumno => alumno.turno === turnoFiltro);[cite: 3]
  }, [alumnos, turnoFiltro]);[cite: 3]

  // 3. Agrupación: Cantidad de propuestas Aceptadas y Pendientes por actividad[cite: 3]
  const resumenEstados = useMemo(() => {
    return alumnosFiltrados.reduce((acc, alumno) => {[cite: 3]
      const actividad = alumno.actividad;[cite: 3]

      if (!acc[actividad]) {[cite: 3]
        acc[actividad] = { aceptadas: 0, pendientes: 0 };[cite: 3]
      }

      if (alumno.estadoPropuesta === 'Aceptada') acc[actividad].aceptadas += 1;[cite: 3]
      if (alumno.estadoPropuesta === 'Pendiente') acc[actividad].pendientes += 1;[cite: 3]

      return acc;[cite: 3]
    }, {});[cite: 3]
  }, [alumnosFiltrados]);[cite: 3]

  return (
    <div className="dashboard-container">[cite: 3]
      
      {/* BARRA SUPERIOR DE FILTROS Y ACCIONES (Se oculta al imprimir) */}[cite: 3]
      <div className="filtros-bar no-print">[cite: 3]
        <label>Filtrar por Turno: </label>[cite: 3]
        <select 
          value={turnoFiltro} 
          onChange={(e) => setTurnoFiltro(e.target.value)}[cite: 3]
        >
          <option value="Todos">Todos los Turnos</option>[cite: 3]
          <option value="Mañana">Mañana</option>[cite: 3]
          <option value="Tarde">Tarde</option>[cite: 3]
          <option value="Noche">Noche</option>[cite: 3]
        </select>

        {/* Alternar entre vista Dashboard y Previsualización */}[cite: 3]
        {!verPrevisualizacion ? ([cite: 3]
          <button 
            onClick={() => setVerPrevisualizacion(true)}[cite: 3]
            className="btn-enlace-reporte"[cite: 3]
          >
            📄 Generar reporte de estados[cite: 3]
          </button>
        ) : (
          <div className="acciones-previsualizacion">[cite: 3]
            <button 
              onClick={() => setVerPrevisualizacion(false)}[cite: 3]
              className="btn btn-secondary"[cite: 3]
            >
              ⬅️ Volver al Dashboard[cite: 3]
            </button>
            <button 
              onClick={() => window.print()}[cite: 3]
              className="btn btn-primary ml-2"[cite: 3]
            >
              🖨️ Imprimir[cite: 3]
            </button>
          </div>
        )}
      </div>

      {/* VISTA DENTRO DEL DASHBOARD REGULAR */}[cite: 3]
      {!verPrevisualizacion && ([cite: 3]
        <div className="vista-dashboard no-print">[cite: 3]
          <h3>Listado de Alumnos ({alumnosFiltrados.length})</h3>[cite: 3]
          {/* Tabla habitual del dashboard */}[cite: 3]
        </div>
      )}

      {/* VISTA DEL REPORTE (Aparece en previsualización y en la hoja impresa) */}[cite: 3]
      <div className={`seccion-reporte ${!verPrevisualizacion ? 'oculto-en-pantalla' : ''}`}>[cite: 3]
        <h2>Reporte de Alumnos por Estado de Propuesta</h2>[cite: 3]
        <p><strong>Turno filtrado:</strong> {turnoFiltro}</p>[cite: 3]

        <table className="tabla-reporte">[cite: 3]
          <thead>[cite: 3]
            <tr>[cite: 3]
              <th>Actividad</th>[cite: 3]
              <th>Aceptadas</th>[cite: 3]
              <th>Pendientes</th>[cite: 3]
            </tr>[cite: 3]
          </thead>[cite: 3]
          <tbody>[cite: 3]
            {Object.keys(resumenEstados).length === 0 ? ([cite: 3]
              <tr>[cite: 3]
                <td colSpan="3">No hay datos registrados para este filtro.</td>[cite: 3]
              </tr>[cite: 3]
            ) : (
              Object.entries(resumenEstados).map(([actividad, datos]) => ([cite: 3]
                <tr key={actividad}>[cite: 3]
                  <td>{actividad}</td>[cite: 3]
                  <td>{datos.aceptadas}</td>[cite: 3]
                  <td>{datos.pendientes}</td>[cite: 3]
                </tr>[cite: 3]
              ))
            )}
          </tbody>[cite: 3]
        </table>[cite: 3]
      </div>

    </div>
  );
};
