import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Upload, Users, Filter, Search, 
  UserCheck, Trash2, Download, Printer, RefreshCw, AlertTriangle,
  Sun, Moon, Sunset, BookOpen, Award, X, BarChart as BarChartIcon, Target, ArrowLeft, FileText
} from 'lucide-react';
import '..DashboardInscripciones.css';

const DATA_SOURCE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-4w1Lcx6FefPFWYVxlU_pMxGx5j_r4xENfPmhuiL2Y6qLRggLixxcHFudlXl4BZlBrELxln97B7Hu/pub?gid=1856440278&single=true&output=csv"; 

const getDefaultMatriz = () => `CÓDIGO;FAMILIA PROFESIONAL;PROPUESTA;TIPO OFERTA;MODULO INICIAL;ACTIVIDAD;INSTRUCTOR/A;FECHA INICIO;FECHA FINAL;Encuentros Presenciales;DIAS;HORARIO;INASISTENCIAS;TOTAL Hs/Reloj
CFP N° 1 - Río Cuarto - 1993 - 02-TT;ESTÉTICA;ESPECIALISTA EN TRATAMIENTOS ESTÉTICO CORPORALES ;CURSO;VERDADERO;ESPECIALISTA EN TRATAMIENTOS ESTÉTICO CORPORALES ;ULIBARRI, Karina Marcela;25-08-26;01-12-26;27;MA, JU;15:00-18:35;5;96
CFP N° 1 - Río Cuarto - 1993 - 02-TT;ADMINISTRACIÓN;LIQUIDACION DE SUELDOS Y JORNALES;CURSO;VERDADERO;LIQUIDACION DE SUELDOS Y JORNALES;IBARRA Calisto;24-08-26;02-12-26;40;LU, MI, VI;15:30-18:30;8;120`;

const getDefaultInscripciones = () => [
"Alumno,Identificación,Mail,Teléfono,Comisión,Estado Insc.,Actividad",
"\"Aguirre Zanca, Karina Ana\",DNI 24804039,karinaguirre75@gmail.com,1126549320,CFP N° 1 - Río Cuarto - 1993 - 01-TT,Pendiente,(CL_1436) Operador de Herramientas de Marketing Digital",
"\"ALARCON VILLAMAYOR, OLGA LILIOSA\",DNI 95625371,lili90villamayor@gmail.com,1128732605,CFP N° 1 - Río Cuarto - 1993 - 02-TN,Pendiente,(CL_1436) Operador de Herramientas de Marketing Digital",
"\"ALVAREZ, MIRTA SUSANA\",DNI 23454865,alvarezsusana549@gmail.com,01160370455,CFP N° 1 - Río Cuarto - 1993 - 02-TN,Aceptada,(CL_1436) Operador de Herramientas de Marketing Digital"
].join('\n');

const parseCSV = (text) => {
  const rows = [];
  let currentRow = [];
  let currentString = '';
  let inQuotes = false;
  
  const firstLine = text.split('\n')[0];
  const separator = firstLine.includes(';') ? ';' : ',';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentString += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      currentRow.push(currentString.trim());
      currentString = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentString || currentRow.length > 0) {
        currentRow.push(currentString.trim());
        rows.push(currentRow);
      }
      currentRow = [];
      currentString = '';
      if (char === '\r' && nextChar === '\n') i++;
    } else {
      currentString += char;
    }
  }
  if (currentString || currentRow.length > 0) {
    currentRow.push(currentString.trim());
    rows.push(currentRow);
  }
  return rows;
};

const normalizeKey = (str) => !str ? '' : str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
const cleanActivityName = (act) => !act ? '' : normalizeKey(act.replace(/^\([A-Z0-9_]+\)\s*/i, ''));
const extractComisionNumber = (com) => {
  if (!com) return '';
  const match = com.match(/1993\s*-\s*0*(\d+)/);
  return match ? match[1] : normalizeKey(com);
};
const formatDocenteName = (str) => !str ? '' : str.replace(/,/g, '').trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

const inferGender = (fullName) => {
  if (!fullName) return 'Desconocido';
  const parts = fullName.split(',');
  if (parts.length < 2) return 'Desconocido';
  const firstName = parts[1].trim().split(' ')[0].toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
  if (['BAUTISTA', 'LUCA', 'NICOLA', 'SANTINO'].includes(firstName)) return 'Masculino';
  if (['SOL', 'BELEN', 'RAQUEL', 'RUTH', 'ESTHER', 'JAZMIN', 'LOURDES', 'CARMEN', 'ROCIO'].includes(firstName) || firstName.endsWith('A')) return 'Femenino';
  return 'Masculino';
};

const COLORS = {
  TM: '#F59E0B', TT: '#F97316', TN: '#4F46E5', Unknown: '#9CA3AF',
  Aceptada: '#10B981', Pendiente: '#F59E0B', Rechazada: '#EF4444',
  Femenino: '#EC4899', Masculino: '#3B82F6'
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>{children}</div>
);

export default function DashboardInscripciones() {
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // Estado para previsualización e impresión de reportes[cite: 3, 6]
  const [verPrevisualizacion, setVerPrevisualizacion] = useState(false);[cite: 3, 6]

  const [docentesMap, setDocentesMap] = useState({}); 
  const [propuestasMap, setPropuestasMap] = useState({});
  const [familiasMap, setFamiliasMap] = useState({});
  const [modulosInicialesSet, setModulosInicialesSet] = useState([]);
  
  const [filterTurno, setFilterTurno] = useState('Todos');
  const [filterFamilia, setFilterFamilia] = useState('Todas');
  const [filterActividad, setFilterActividad] = useState('Todas');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterTipoOferta, setFilterTipoOferta] = useState('Todos');
  const [filterDocente, setFilterDocente] = useState('Todos');
  const [filterPropuesta, setFilterPropuesta] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  const [dataSource, setDataSource] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);

  useEffect(() => {
    if (getDefaultMatriz().trim() !== '') processMatrizCSV(getDefaultMatriz(), false);
    loadData();
  }, []);

  const processMatrizCSV = (csvText, saveLocal = true) => {
    try {
      const parsed = parseCSV(csvText);
      if (parsed.length < 2) return 0;
      
      const headers = parsed[0].map(h => h.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim());
      const dataRows = parsed.slice(1);
      const mapD = {}, mapP = {}, mapF = {}, inicialesSet = new Set();
      
      const idxCodigo = headers.findIndex(h => h.includes('codigo') || h.includes('comision'));
      const idxFamilia = headers.findIndex(h => h.includes('familia'));
      const idxActividad = headers.findIndex(h => h.includes('actividad'));
      const idxInstructor = headers.findIndex(h => h.includes('instructor') || h.includes('apellido'));
      const idxPropuesta = headers.findIndex(h => h.includes('propuesta'));
      const idxModuloInicial = headers.findIndex(h => h.includes('modulo inicial') || h.includes('modulo'));

      dataRows.forEach(row => {
        if (row.length > Math.max(idxCodigo, idxActividad)) {
          const actClean = cleanActivityName(row[idxActividad] || '');
          if (!actClean) return;
          
          if (idxPropuesta !== -1 && row[idxPropuesta]) mapP[actClean] = row[idxPropuesta].trim();
          if (idxFamilia !== -1 && row[idxFamilia]) mapF[actClean] = row[idxFamilia].trim();

          const comNum = extractComisionNumber(row[idxCodigo] || '');
          if (idxInstructor !== -1 && row[idxInstructor] && comNum) {
            mapD[`${comNum}|${actClean}`] = formatDocenteName(row[idxInstructor].trim());
          }

          if (idxModuloInicial !== -1 && row[idxModuloInicial]) {
             const val = row[idxModuloInicial].trim().toUpperCase();
             if (['VERDADERO', 'SI', 'TRUE'].includes(val)) inicialesSet.add(actClean);
          }
        }
      });

      setDocentesMap(prev => ({ ...prev, ...mapD }));
      setPropuestasMap(prev => ({ ...prev, ...mapP }));
      setFamiliasMap(prev => ({ ...prev, ...mapF }));
      setModulosInicialesSet(prev => Array.from(new Set([...prev, ...Array.from(inicialesSet)])));
      return dataRows.length;
    } catch (error) {
       return 0;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    if (DATA_SOURCE_URL) {
      try {
        const response = await fetch(DATA_SOURCE_URL);
        if (response.ok) {
          const text = await response.text();
          processCSV(text, false, false, "Nube");
          setIsLoading(false);
          return;
        }
      } catch (e) {
        setFetchError("Error al sincronizar con Google Sheets.");
      }
    }
    processCSV(getDefaultInscripciones(), true, false, 'Predefinidas');
    setIsLoading(false);
  };

  const processCSV = (csvText, isSample = false, persist = false, newFileName = '') => {
    const parsed = parseCSV(csvText);
    if (parsed.length < 2) return;
    const headers = parsed[0];
    
    const processed = parsed.slice(1).map(row => {
      const item = {};
      headers.forEach((header, index) => {
        let key = header.trim();
        if (key.includes('Alumno')) key = 'alumno';
        else if (key.includes('Identificación')) key = 'dni';
        else if (key.includes('Mail')) key = 'email';
        else if (key.includes('Teléfono')) key = 'telefono';
        else if (key.includes('Comisión')) key = 'comision';
        else if (key.includes('Estado')) key = 'estado';
        else if (key.includes('Actividad')) key = 'actividad';
        item[key] = row[index];
      });

      let turno = 'Desconocido';
      const comision = item.comision || '';
      if (comision.includes('TM')) turno = 'TM';
      else if (comision.includes('TT')) turno = 'TT';
      else if (comision.includes('TN')) turno = 'TN';

      item.genero = inferGender(item.alumno);
      item.turno = turno;
      item.actividadSimple = item.actividad ? item.actividad.replace(/^\([A-Z0-9_]+\)\s*/, '') : 'Sin Actividad';
      return item;
    }).filter(item => item.alumno);

    setRawData(processed);
    setLastUpdateDate(new Date());
  };

  const enrichedData = useMemo(() => {
    return rawData.map(item => {
      const actClean = cleanActivityName(item.actividad);
      const comNum = extractComisionNumber(item.comision);
      return {
        ...item,
        docente: docentesMap[`${comNum}|${actClean}`] || 'Sin Asignar',
        propuesta: propuestasMap[actClean] || 'Sin Propuesta',
        familia: familiasMap[actClean] || 'Sin Familia'
      };
    });
  }, [rawData, docentesMap, propuestasMap, familiasMap]);

  useEffect(() => {
    let result = enrichedData;
    if (filterFamilia !== 'Todas') result = result.filter(item => item.familia === filterFamilia);
    if (filterTurno !== 'Todos') result = result.filter(item => item.turno === filterTurno);
    if (filterEstado !== 'Todos') result = result.filter(item => item.estado && item.estado.trim() === filterEstado);
    if (filterActividad !== 'Todas') result = result.filter(item => item.actividadSimple === filterActividad);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => (item.alumno && item.alumno.toLowerCase().includes(term)) || (item.dni && item.dni.includes(term)));
    }
    setFilteredData(result);
  }, [enrichedData, filterFamilia, filterTurno, filterEstado, filterActividad, searchTerm]);

  // Agrupación: Resumen por Estado por Actividad[cite: 3, 6]
  const resumenEstados = useMemo(() => {
    return filteredData.reduce((acc, alumno) => {[cite: 3, 6]
      const actividad = alumno.actividadSimple || 'Sin Actividad';[cite: 3, 6]
      const estado = alumno.estado ? alumno.estado.trim() : 'Pendiente';[cite: 3, 6]

      if (!acc[actividad]) {
        acc[actividad] = { aceptadas: 0, pendientes: 0, rechazadas: 0 };[cite: 3, 6]
      }

      if (estado === 'Aceptada') acc[actividad].aceptadas += 1;[cite: 3, 6]
      if (estado === 'Pendiente') acc[actividad].pendientes += 1;[cite: 3, 6]
      if (estado === 'Rechazada') acc[actividad].rechazadas += 1;

      return acc;[cite: 3, 6]
    }, {});
  }, [filteredData]);[cite: 3, 6]

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8 print:p-0">
      
      {/* BARRA SUPERIOR DE ACCIONES Y CONTROLES (Se oculta al imprimir) */}[cite: 3, 6]
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 no-print">[cite: 3, 6]
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            <span className="text-blue-600">CFP N°1 -</span> Inscripciones 2°C - 2026
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Alternar entre vista Dashboard y Previsualización */}[cite: 3, 6]
          {!verPrevisualizacion ? ([cite: 3, 6]
            <button 
              onClick={() => setVerPrevisualizacion(true)}[cite: 3, 6]
              className="btn-enlace-reporte bg-blue-50 px-3 py-2 rounded-lg border border-blue-200"[cite: 4, 6]
            >
              <FileText className="w-4 h-4" /> Generar reporte de estados[cite: 3, 6]
            </button>
          ) : (
            <div className="flex items-center gap-2">[cite: 3, 6]
              <button 
                onClick={() => setVerPrevisualizacion(false)}[cite: 3, 6]
                className="flex items-center gap-2 px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 font-medium"[cite: 3, 6]
              >
                <ArrowLeft className="w-4 h-4" /> Volver al Dashboard[cite: 3, 6]
              </button>
              <button 
                onClick={() => window.print()}[cite: 3, 6]
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm"[cite: 3, 6]
              >
                <Printer className="w-4 h-4" /> Imprimir[cite: 3, 6]
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VISTA DENTRO DEL DASHBOARD REGULAR */}[cite: 3, 6]
      {!verPrevisualizacion && ([cite: 3, 6]
        <div className="vista-dashboard no-print space-y-6">[cite: 3, 6]

          {/* Filtros rápidos */}
          <Card className="p-4 flex flex-wrap gap-4 items-center">
            <label className="font-semibold text-sm">Filtrar por Turno:</label>[cite: 3]
            <select 
              value={filterTurno} 
              onChange={(e) => setFilterTurno(e.target.value)}[cite: 3]
              className="border border-slate-300 rounded-md p-2 text-sm"
            >
              <option value="Todos">Todos los Turnos</option>[cite: 3]
              <option value="TM">Mañana</option>[cite: 3]
              <option value="TT">Tarde</option>[cite: 3]
              <option value="TN">Noche</option>[cite: 3]
            </select>
          </Card>

          {/* Listado principal de alumnos */}
          <Card className="p-4">
            <h3 className="text-lg font-bold mb-4">Listado de Alumnos ({filteredData.length})</h3>[cite: 3, 6]
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 uppercase text-xs">
                  <tr>
                    <th className="p-2">Alumno</th>
                    <th className="p-2">DNI</th>
                    <th className="p-2">Turno</th>
                    <th className="p-2">Actividad</th>
                    <th className="p-2">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-medium">{item.alumno}</td>
                      <td className="p-2">{item.dni}</td>
                      <td className="p-2">{item.turno}</td>
                      <td className="p-2">{item.actividadSimple}</td>
                      <td className="p-2">{item.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* VISTA DEL REPORTE IMPRESO (Aparece en previsualización y en la hoja impresa) */}[cite: 3, 6]
      <div className={`seccion-reporte ${!verPrevisualizacion ? 'oculto-en-pantalla' : ''}`}>[cite: 3, 4, 6]
        <h2 className="text-xl font-bold">Reporte de Alumnos por Estado de Propuesta</h2>[cite: 3, 6]
        <p className="my-2"><strong>Turno filtrado:</strong> {filterTurno}</p>[cite: 3, 6]

        <table className="tabla-reporte w-full border-collapse border border-black mt-4">[cite: 3, 4, 6]
          <thead>[cite: 3, 6]
            <tr className="bg-slate-100">[cite: 3, 6]
              <th className="border border-black p-2">Actividad</th>[cite: 3, 4, 6]
              <th className="border border-black p-2">Aceptadas</th>[cite: 3, 4, 6]
              <th className="border border-black p-2">Pendientes</th>[cite: 3, 4, 6]
              <th className="border border-black p-2">Rechazadas</th>
            </tr>[cite: 3, 6]
          </thead>[cite: 3, 6]
          <tbody>[cite: 3, 6]
            {Object.keys(resumenEstados).length === 0 ? ([cite: 3, 6]
              <tr>[cite: 3, 6]
                <td colSpan="4" className="border border-black p-2 text-center">No hay datos registrados para este filtro.</td>[cite: 3, 6]
              </tr>[cite: 3, 6]
            ) : (
              Object.entries(resumenEstados).map(([actividad, datos]) => ([cite: 3, 6]
                <tr key={actividad}>[cite: 3, 6]
                  <td className="border border-black p-2">{actividad}</td>[cite: 3, 4, 6]
                  <td className="border border-black p-2">{datos.aceptadas}</td>[cite: 3, 4, 6]
                  <td className="border border-black p-2">{datos.pendientes}</td>[cite: 3, 4, 6]
                  <td className="border border-black p-2">{datos.rechazadas}</td>
                </tr>[cite: 3, 6]
              ))
            )}
          </tbody>[cite: 3, 6]
        </table>[cite: 3, 6]
      </div>

    </div>
  );
}
