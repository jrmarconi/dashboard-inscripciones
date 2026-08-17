import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown, Check, Filter, BookOpen, Award } from 'lucide-react';

export default function DashboardInscripciones({ data = [] }) {
  // ---------------------------------------------------------------------------
  // 1. ESTADOS DE FILTROS Y CONTROL UNIFICADO DE DESPLEGABLES
  // ---------------------------------------------------------------------------
  const [filterTipoOferta, setFilterTipoOferta] = useState('Todos');
  const [filterTurno, setFilterTurno] = useState('Todos');
  const [filterFamilia, setFilterFamilia] = useState('Todos');
  
  // Estado único para controlar qué menú está desplegado ('oferta' | 'turno' | 'familia' | null)
  const [openDropdown, setOpenDropdown] = useState(null);
  const containerRef = useRef(null);

  // Función para alternar la apertura/cierre
  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // Detectar clic fuera del contenedor para cerrar el desplegable activo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------------------------------------------------------------------------
  // 2. OPCIONES DISPONIBLES PARA LOS FILTROS
  // ---------------------------------------------------------------------------
  const opcionesOferta = [
    'Todos',
    'Capacitación Laboral',
    'Curso',
    'Trayecto',
    'Microcredencial'
  ];

  const opcionesTurno = ['Todos', 'Mañana', 'Tarde', 'Noche'];

  // Obtención dinámica de Familias Profesionales únicas
  const opcionesFamilia = useMemo(() => {
    const familias = new Set(data.map((item) => item.familiaProfesional).filter(Boolean));
    return ['Todos', ...Array.from(familias).sort()];
  }, [data]);

  // ---------------------------------------------------------------------------
  // 3. PROCESAMIENTO Y DEDUCCIÓN DE TIPO DE OFERTA
  // ---------------------------------------------------------------------------
  const processedData = useMemo(() => {
    return data.map((item) => {
      const rawActividad = item.actividad || '';

      // Clasificación por prefijo en el código de actividad
      let tipoOferta = 'Otro';
      if (rawActividad.includes('(CL_')) tipoOferta = 'Capacitación Laboral';
      else if (rawActividad.includes('(CT_')) tipoOferta = 'Curso';
      else if (rawActividad.includes('(TR_')) tipoOferta = 'Trayecto';
      else if (rawActividad.includes('(MC_')) tipoOferta = 'Microcredencial';

      return {
        ...item,
        tipoOferta,
        turno: item.turno || 'Sin Especificar',
        propuesta: item.propuesta || item.propuestaFormativa || 'Sin Propuesta',
        actividadNombre: rawActividad.replace(/\s*\([A-Z]{2}_[^)]+\)/g, '').trim() || rawActividad
      };
    });
  }, [data]);

  // ---------------------------------------------------------------------------
  // 4. APLICACIÓN DE FILTROS
  // ---------------------------------------------------------------------------
  const filteredData = useMemo(() => {
    return processedData.filter((item) => {
      const matchOferta = filterTipoOferta === 'Todos' || item.tipoOferta === filterTipoOferta;
      const matchTurno = filterTurno === 'Todos' || item.turno === filterTurno;
      const matchFamilia = filterFamilia === 'Todos' || item.familiaProfesional === filterFamilia;
      return matchOferta && matchTurno && matchFamilia;
    });
  }, [processedData, filterTipoOferta, filterTurno, filterFamilia]);

  // Total de registros tras filtrar
  const totalInscripciones = filteredData.length;

  // Top 5 Actividades
  const topActividades = useMemo(() => {
    const conteo = {};

    filteredData.forEach((item) => {
      const key = item.actividadNombre || 'Sin Actividad';
      if (!conteo[key]) {
        conteo[key] = {
          nombre: key,
          cantidad: 0,
          propuesta: item.propuesta,
          tipoOferta: item.tipoOferta
        };
      }
      conteo[key].cantidad += 1;
    });

    return Object.values(conteo)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [filteredData]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6 font-sans">
      
      {/* BLOQUE DE FILTROS AVANZADOS */}
      <div 
        ref={containerRef}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
      >
        <div className="flex items-center gap-2 mb-3 text-slate-700 font-semibold text-sm">
          <Filter className="w-4 h-4 text-purple-600" />
          <span>Filtros Avanzados</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* DESPLEGABLE: OFERTA */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('oferta')}
              className={`px-3 py-2 border rounded-lg text-sm flex items-center justify-between gap-2 transition-all min-w-[180px] ${
                filterTipoOferta !== 'Todos'
                  ? 'bg-purple-50 border-purple-300 text-purple-800 font-medium'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>Oferta: {filterTipoOferta === 'Todos' ? 'Todas' : filterTipoOferta}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openDropdown === 'oferta' ? 'rotate-180 text-purple-600' : 'text-slate-400'
                }`}
              />
            </button>

            {openDropdown === 'oferta' && (
              <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1 text-sm">
                {opcionesOferta.map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => {
                      setFilterTipoOferta(opcion);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors flex items-center justify-between ${
                      filterTipoOferta === opcion
                        ? 'text-purple-700 font-semibold bg-purple-50/60'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{opcion === 'Todos' ? 'Oferta: Todas' : opcion}</span>
                    {filterTipoOferta === opcion && (
                      <Check className="w-4 h-4 text-purple-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DESPLEGABLE: TURNO */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('turno')}
              className={`px-3 py-2 border rounded-lg text-sm flex items-center justify-between gap-2 transition-all min-w-[150px] ${
                filterTurno !== 'Todos'
                  ? 'bg-purple-50 border-purple-300 text-purple-800 font-medium'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>Turno: {filterTurno === 'Todos' ? 'Todos' : filterTurno}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openDropdown === 'turno' ? 'rotate-180 text-purple-600' : 'text-slate-400'
                }`}
              />
            </button>

            {openDropdown === 'turno' && (
              <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1 text-sm">
                {opcionesTurno.map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => {
                      setFilterTurno(opcion);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors flex items-center justify-between ${
                      filterTurno === opcion
                        ? 'text-purple-700 font-semibold bg-purple-50/60'
                        : 'text-slate-700'
                    }`}
                  >
                    <span>{opcion === 'Todos' ? 'Turno: Todos' : opcion}</span>
                    {filterTurno === opcion && (
                      <Check className="w-4 h-4 text-purple-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DESPLEGABLE: FAMILIA PROFESIONAL */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('familia')}
              className={`px-3 py-2 border rounded-lg text-sm flex items-center justify-between gap-2 transition-all min-w-[200px] ${
                filterFamilia !== 'Todos'
                  ? 'bg-purple-50 border-purple-300 text-purple-800 font-medium'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="truncate">
                Familia: {filterFamilia === 'Todos' ? 'Todas' : filterFamilia}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform flex-shrink-0 ${
                  openDropdown === 'familia' ? 'rotate-180 text-purple-600' : 'text-slate-400'
                }`}
              />
            </button>

            {openDropdown === 'familia' && (
              <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-30 py-1 text-sm max-h-60 overflow-y-auto">
                {opcionesFamilia.map((opcion) => (
                  <button
                    key={opcion}
                    type="button"
                    onClick={() => {
                      setFilterFamilia(opcion);
                      setOpenDropdown(null);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors flex items-center justify-between ${
                      filterFamilia === opcion
                        ? 'text-purple-700 font-semibold bg-purple-50/60'
                        : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{opcion === 'Todos' ? 'Familia: Todas' : opcion}</span>
                    {filterFamilia === opcion && (
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BOTÓN RESTABLECER FILTROS */}
          {(filterTipoOferta !== 'Todos' || filterTurno !== 'Todos' || filterFamilia !== 'Todos') && (
            <button
              type="button"
              onClick={() => {
                setFilterTipoOferta('Todos');
                setFilterTurno('Todos');
                setFilterFamilia('Todos');
                setOpenDropdown(null);
              }}
              className="text-xs text-purple-600 hover:text-purple-800 underline font-medium px-2 py-1"
            >
              Restablecer Filtros
            </button>
          )}

        </div>
      </div>

      {/* RESULTADOS / TOP 5 ACTIVIDADES */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Top 5 Actividades Más Demandadas
          </h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            Total inscripciones: {totalInscripciones}
          </span>
        </div>

        {topActividades.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            No se encontraron actividades con los filtros seleccionados.
          </p>
        ) : (
          <div className="space-y-3">
            {topActividades.map((act, index) => {
              const porcentaje = totalInscripciones > 0 
                ? ((act.cantidad / totalInscripciones) * 100).toFixed(1) 
                : 0;

              return (
                <div 
                  key={act.nombre + index} 
                  className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 hover:border-purple-200 transition-all space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm">
                          #{index + 1} {act.nombre}
                        </span>

                        {/* Etiqueta de la Propuesta Formativa */}
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                          <BookOpen className="w-3 h-3 text-purple-600" />
                          {act.propuesta}
                        </span>

                        {/* Etiqueta del Tipo de Oferta */}
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                          {act.tipoOferta}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-extrabold text-purple-700">
                        {act.cantidad}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        inscriptos ({porcentaje}%)
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
