import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Upload, Users, Filter, Search, Info, 
  UserCheck, FileSpreadsheet, Trash2, Save, Download, Printer, Cloud, RefreshCw, AlertTriangle
} from 'lucide-react';

// ==============================================================================
// CONFIGURACIÓN DE ORIGEN DE DATOS
// ==============================================================================
// PEGA AQUÍ TU ENLACE DE GOOGLE SHEETS (Publicado como CSV)
// Si lo dejas vacío "", el sistema funcionará modo manual/local como antes.
const DATA_SOURCE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-4w1Lcx6FefPFWYVxlU_pMxGx5j_r4xENfPmhuiL2Y6qLRggLixxcHFudlXl4BZlBrELxln97B7Hu/pub?gid=1856440278&single=true&output=csv"; 
// ==============================================================================

// --- Utilitarios para procesamiento de CSV ---
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

// --- Lógica de Inferencia de Género ---
const inferGender = (fullName) => {
  if (!fullName) return 'Desconocido';
  const parts = fullName.split(',');
  if (parts.length < 2) return 'Desconocido';
  
  const firstName = parts[1].trim().split(' ')[0].toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 

  const maleExceptions = ['BAUTISTA', 'LUCA', 'NICOLA', 'SANTINO'];
  if (maleExceptions.includes(firstName)) return 'Masculino';

  const femaleExceptions = [
    'SOL', 'BELEN', 'RAQUEL', 'RUTH', 'ESTHER', 'ABIGAIL', 'JAZMIN', 
    'LOURDES', 'CARMEN', 'DOLORES', 'MERCEDES', 'PILAR', 'MONSERRAT', 
    'MILAGROS', 'ANGELES', 'INES', 'LUZ', 'PAZ', 'ABRIL', 'NICOLE', 
    'ZOE', 'NOELIA', 'MAITE', 'ROCIO', 'GUADALUPE', 'SOLEDAD', 'BEATRIZ'
  ];
  if (femaleExceptions.includes(firstName)) return 'Femenino';

  if (firstName.endsWith('A')) return 'Femenino';
  return 'Masculino';
};

// Datos de muestra
const SAMPLE_CSV = `Alumno,Identificación,Mail,Teléfono,Comisión,Estado Insc.,Actividad
"Aguirre Zanca, Karina Ana",DNI 24804039,karinaguirre75@gmail.com,11|26549320,CFP N° 1 - Río Cuarto - 1993 - 01-TT,Pendiente,(CL_1436) Operador de Herramientas de Marketing Digital
"ALARCON VILLAMAYOR, OLGA LILIOSA",DNI 95625371,lili90villamayor@gmail.com,11|28732605,CFP N° 1 - Río Cuarto - 1993 - 02-TN,Pendiente,(CL_1436) Operador de Herramientas de Marketing Digital
"ALVAREZ, MIRTA SUSANA",DNI 23454865,alvarezsusana549@gmail.com,011|60370455,CFP N° 1 - Río Cuarto - 1993 - 02-TN,Aceptada,(CL_1436) Operador de Herramientas de Marketing Digital
"Andriani, Camila AGUSTINA",DNI 47127952,camilalovers339@gmail.com,54|1159781620,CFP N° 1 - Río Cuarto - 1993 - 01-TT,Aceptada,(CL_1436) Operador de Herramientas de Marketing Digital
"PIREZ, PABLO NAHUEL",DNI 47435248,nahuelpirez12@gmail.com,,CFP N° 1 - Río Cuarto - 1993 - 05-TN,Pendiente,(TR_MYA_ME_1) Sistema motor de combustión interna
"RAMOS, AGOSTINA CELESTE",DNI 47738200,agostinacr28@gmail.com,,CFP N° 1 - Río Cuarto - 1993 - 04-TM,Pendiente,(TR_MYA_ME_1) Sistema motor de combustión interna
"RANONE GIGENA, NAHUEL EZEQUIEL",DNI 47126080,cfp6ezequielranone@gmail.com,,CFP N° 1 - Río Cuarto - 1993 - 04-TM,Pendiente,(TR_MYA_ME_1) Sistema motor de combustión interna
"REYNAGA VALE, FRANCISCO",DNI 94056832,juanrenvion@gmail.com,,CFP N° 1 - Río Cuarto - 1993 - 04-TM,Rechazada,(TR_MYA_ME_1) Sistema motor de combustión interna
"REYNAGA VALE, FRANCISCO",DNI 94056832,juanrenvion@gmail.com,,CFP N° 1 - Río Cuarto - 1993 - 04-TM,Aceptada,(TR_MYA_ME_1) Sistema motor de combustión interna`;

const COLORS = {
  TM: '#F59E0B', 
  TT: '#F97316', 
  TN: '#3B82F6', 
  Unknown: '#9CA3AF',
  Aceptada: '#10B981',
  Pendiente: '#F59E0B',
  Rechazada: '#EF4444',
  Femenino: '#EC4899', 
  Masculino: '#3B82F6'
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type }) => {
  let classes = "px-2 py-1 rounded-full text-xs font-semibold ";
  switch (type) {
    case 'Aceptada': classes += "bg-green-100 text-green-800"; break;
    case 'Rechazada': classes += "bg-red-100 text-red-800"; break;
    case 'Pendiente': classes += "bg-yellow-100 text-yellow-800"; break;
    case 'TM': classes += "bg-amber-100 text-amber-800 border border-amber-200"; break;
    case 'TT': classes += "bg-orange-100 text-orange-800 border border-orange-200"; break;
    case 'TN': classes += "bg-blue-100 text-blue-800 border border-blue-200"; break;
    case 'Femenino': classes += "bg-pink-100 text-pink-800 border border-pink-200"; break;
    case 'Masculino': classes += "bg-blue-100 text-blue-800 border border-blue-200"; break;
    default: classes += "bg-gray-100 text-gray-800";
  }
  return <span className={classes}>{children}</span>;
};

const OfferBadge = ({ type }) => {
  let classes = "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ";
  switch (type) {
    case 'Capacitación Laboral': classes += "bg-purple-100 text-purple-700 border border-purple-200"; break;
    case 'Curso': classes += "bg-teal-100 text-teal-700 border border-teal-200"; break;
    case 'Trayecto': classes += "bg-rose-100 text-rose-700 border border-rose-200"; break;
    default: classes += "bg-slate-100 text-slate-500 border border-slate-200";
  }
  return <span className={classes}>{type === 'Capacitación Laboral' ? 'Cap. Laboral' : type}</span>;
};

export default function DashboardInscripciones() {
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // Filtros
  const [filterTurno, setFilterTurno] = useState('Todos');
  const [filterActividad, setFilterActividad] = useState('Todas');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterTipoOferta, setFilterTipoOferta] = useState('Todos');
  const [filterGenero, setFilterGenero] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado de datos y fuente
  const [dataSource, setDataSource] = useState('sample'); // 'sample', 'local', 'cloud', 'manual'
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // --- EFECTO DE INICIO: Prioridad Nube -> Local -> Ejemplo ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setFetchError(null);

    // 1. Intentar cargar desde URL Nube (si está configurada)
    if (DATA_SOURCE_URL && DATA_SOURCE_URL.trim() !== "") {
      try {
        const response = await fetch(DATA_SOURCE_URL);
        if (!response.ok) throw new Error('Error de conexión con la hoja de cálculo');
        const text = await response.text();
        processCSV(text, false, false, "Datos en la Nube (Auto)");
        setDataSource('cloud');
        setIsLoading(false);
        return; // Éxito con nube
      } catch (error) {
        console.error("Fallo carga nube:", error);
        setFetchError("No se pudo conectar a Google Sheets. Mostrando datos locales.");
        // Si falla, seguimos al paso 2
      }
    }

    // 2. Intentar LocalStorage (Si falló la nube o no hay URL)
    const storedData = localStorage.getItem('dashboard_data');
    const storedName = localStorage.getItem('dashboard_filename');

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setRawData(parsedData);
        setFileName(storedName || 'Archivo Guardado');
        setDataSource('local');
      } catch (e) {
        processCSV(SAMPLE_CSV, true, false);
      }
    } else {
      // 3. Fallback a Ejemplo
      processCSV(SAMPLE_CSV, true, false);
    }
    setIsLoading(false);
  };

  // Función principal de procesamiento
  const processCSV = (csvText, isSample = false, persist = false, newFileName = '') => {
    try {
      const parsed = parseCSV(csvText);
      const headers = parsed[0];
      const dataRows = parsed.slice(1);

      const processed = dataRows.map(row => {
        const item = {};
        headers.forEach((header, index) => {
          let key = header.trim();
          if (key.includes('Alumno')) key = 'alumno';
          else if (key.includes('Identificación')) key = 'dni';
          else if (key.includes('Mail')) key = 'email';
          else if (key.includes('Comisión')) key = 'comision';
          else if (key.includes('Estado')) key = 'estado';
          else if (key.includes('Actividad')) key = 'actividad';
          item[key] = row[index];
        });

        // Lógica de Negocio
        let turno = 'Desconocido';
        const comision = item.comision || '';
        if (comision.includes('TM')) turno = 'TM';
        else if (comision.includes('TT')) turno = 'TT';
        else if (comision.includes('TN')) turno = 'TN';
        
        let tipoOferta = 'Otro';
        const rawActividad = item.actividad || '';
        if (rawActividad.includes('(CL_')) tipoOferta = 'Capacitación Laboral';
        else if (rawActividad.includes('(CT_')) tipoOferta = 'Curso';
        else if (rawActividad.includes('(TR_')) tipoOferta = 'Trayecto';

        item.genero = inferGender(item.alumno);
        item.tipoOferta = tipoOferta;
        item.turno = turno;
        item.actividadSimple = item.actividad ? item.actividad.replace(/^\([A-Z0-9_]+\)\s*/, '') : 'Sin Actividad';

        return item;
      }).filter(item => item.alumno);

      // Actualizar Estado
      setRawData(processed);
      
      if (isSample) {
        setFileName('Datos de Ejemplo');
        setDataSource('sample');
      } else {
        setFileName(newFileName);
        
        if (persist) { // Solo si es subida manual guardamos en localstorage
          try {
            localStorage.setItem('dashboard_data', JSON.stringify(processed));
            localStorage.setItem('dashboard_filename', newFileName);
            setDataSource('local');
          } catch (e) {
            alert("El archivo es demasiado grande para guardarse permanentemente.");
          }
        }
      }

    } catch (e) {
      console.error("Error procesando CSV", e);
      alert("Error al procesar el archivo.");
    }
  };

  const handleManualUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setDataSource('manual');
      const reader = new FileReader();
      reader.onload = (e) => processCSV(e.target.result, false, true, file.name); // Guardamos manuales en local
      reader.readAsText(file);
    }
  };

  const clearStorage = () => {
    if (window.confirm("¿Estás seguro de borrar los datos locales? Si tienes un enlace de Google Sheets configurado, se intentará recargar.")) {
      localStorage.removeItem('dashboard_data');
      localStorage.removeItem('dashboard_filename');
      loadData(); // Intentar recargar nube o ejemplo
    }
  };

  // --- Funciones de Exportación ---
  const handleDownloadCSV = () => {
    const headers = ['Alumno', 'Género', 'DNI', 'Turno', 'Oferta', 'Actividad', 'Estado'];
    const csvContent = [
      headers.join(';'),
      ...filteredData.map(row => [
        `"${row.alumno || ''}"`, row.genero, row.dni, row.turno, row.tipoOferta, `"${row.actividadSimple || ''}"`, row.estado
      ].join(';'))
    ].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `listado_alumnos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => window.print();

  // Filtrado de datos
  useEffect(() => {
    let result = rawData;
    if (filterTurno !== 'Todos') result = result.filter(item => item.turno === filterTurno);
    if (filterEstado !== 'Todos') result = result.filter(item => item.estado && item.estado.trim() === filterEstado);
    if (filterTipoOferta !== 'Todos') result = result.filter(item => item.tipoOferta === filterTipoOferta);
    if (filterGenero !== 'Todos') result = result.filter(item => item.genero === filterGenero);
    if (filterActividad !== 'Todas') result = result.filter(item => item.actividadSimple === filterActividad);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => (item.alumno && item.alumno.toLowerCase().includes(term)) || (item.dni && item.dni.includes(term)));
    }
    setFilteredData(result);
  }, [rawData, filterTurno, filterEstado, filterActividad, filterTipoOferta, filterGenero, searchTerm]);

  // Cálculos
  const stats = useMemo(() => {
    const total = filteredData.length;
    const porTurno = { TM: 0, TT: 0, TN: 0, Desconocido: 0 };
    const porEstado = { Aceptada: 0, Pendiente: 0, Rechazada: 0 };
    const porGenero = { Femenino: 0, Masculino: 0, Desconocido: 0 };
    const porActividad = {};

    filteredData.forEach(item => {
      if (porTurno[item.turno] !== undefined) porTurno[item.turno]++; else porTurno.Desconocido++;
      const estado = item.estado ? item.estado.trim() : 'Desconocido';
      if (porEstado[estado] !== undefined) porEstado[estado]++;
      if (porGenero[item.genero] !== undefined) porGenero[item.genero]++; else porGenero.Desconocido++;
      const act = item.actividadSimple;
      porActividad[act] = (porActividad[act] || 0) + 1;
    });

    return { 
      total, porTurno, porEstado, porGenero, 
      chartDataTurno: [{ name: 'TM', value: porTurno.TM, key: 'TM' }, { name: 'TT', value: porTurno.TT, key: 'TT' }, { name: 'TN', value: porTurno.TN, key: 'TN' }].filter(d => d.value > 0),
      chartDataEstado: [{ name: 'Aceptada', value: porEstado.Aceptada, color: COLORS.Aceptada }, { name: 'Pendiente', value: porEstado.Pendiente, color: COLORS.Pendiente }, { name: 'Rechazada', value: porEstado.Rechazada, color: COLORS.Rechazada }].filter(d => d.value > 0),
      chartDataGenero: [{ name: 'Femenino', value: porGenero.Femenino, key: 'Femenino' }, { name: 'Masculino', value: porGenero.Masculino, key: 'Masculino' }].filter(d => d.value > 0),
      chartDataActividad: Object.keys(porActividad).map(key => ({ name: key.substring(0, 20) + '...', fullName: key, value: porActividad[key] })).sort((a, b) => b.value - a.value)
    };
  }, [filteredData]);

  const uniqueActivities = useMemo(() => [...new Set(rawData.map(item => item.actividadSimple))].sort(), [rawData]);
  const uniqueEstados = useMemo(() => [...new Set(rawData.map(item => item.estado ? item.estado.trim() : null).filter(Boolean))].sort(), [rawData]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8 print:bg-white print:p-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600 print:hidden" />
            Tablero de Inscripciones (2026)
          </h1>
          <p className="text-slate-500 mt-1 print:hidden">Análisis Demográfico y de Ofertas</p>
        </div>
        
        <div className="flex items-center gap-3 print:hidden">
          {/* Botón de Refrescar Nube */}
          {DATA_SOURCE_URL && (
            <button 
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
              title="Recargar datos de la nube"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

           {dataSource === 'local' && (
             <button onClick={clearStorage} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium">
               <Trash2 className="w-4 h-4" /> Borrar Local
             </button>
           )}
           
           <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition shadow-md">
            <Upload className="w-4 h-4" />
            <span>Carga Manual</span>
            <input type="file" accept=".csv,.txt" onChange={handleManualUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Banner de Estado de Datos */}
      {isLoading ? (
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-center gap-3 animate-pulse">
           <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
           <span className="text-blue-800 font-medium">Conectando con la nube y descargando datos...</span>
         </div>
      ) : (
        <>
          {fetchError && (
             <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-orange-800 print:hidden">
                <AlertTriangle className="w-4 h-4" />
                {fetchError}
             </div>
          )}

          {dataSource === 'sample' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3 print:hidden">
              <Info className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800">Modo de Demostración</h4>
                <p className="text-sm text-amber-700">Configura la variable DATA_SOURCE_URL o sube un archivo.</p>
              </div>
            </div>
          )}

          {(dataSource === 'cloud' || dataSource === 'local' || dataSource === 'manual') && (
            <div className={`border rounded-lg p-4 mb-6 flex items-start gap-3 print:hidden ${dataSource === 'cloud' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              {dataSource === 'cloud' ? <Cloud className="w-5 h-5 text-green-600 mt-0.5" /> : (dataSource === 'local' ? <Save className="w-5 h-5 text-blue-600 mt-0.5" /> : <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />)}
              <div>
                <h4 className={`font-semibold ${dataSource === 'cloud' ? 'text-green-800' : 'text-blue-800'}`}>
                  {dataSource === 'cloud' ? 'Conectado a Google Sheets' : (dataSource === 'local' ? 'Datos Guardados (Local)' : 'Archivo Manual')}
                </h4>
                <p className={`text-sm ${dataSource === 'cloud' ? 'text-green-700' : 'text-blue-700'}`}>
                  Fuente: <strong>{fileName}</strong>. {dataSource === 'cloud' ? 'Los datos se actualizan automáticamente al recargar la página.' : 'Datos estáticos.'}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 print:grid-cols-3 print:gap-2">
        <Card className="p-4 border-l-4 border-slate-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-full text-slate-600 print:hidden"><Users className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-500">Total Inscriptos</p><p className="text-2xl font-bold">{stats.total}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-pink-500 print:border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-50 rounded-full text-pink-600 print:hidden"><UserCheck className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-500">Mujeres (Est.)</p><p className="text-2xl font-bold">{stats.porGenero.Femenino}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-blue-500 print:border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full text-blue-600 print:hidden"><UserCheck className="w-6 h-6" /></div>
            <div><p className="text-sm text-slate-500">Hombres (Est.)</p><p className="text-2xl font-bold">{stats.porGenero.Masculino}</p></div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-8 sticky top-0 z-20 shadow-md print:hidden">
        <div className="flex flex-col md:flex-row gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2 text-slate-600"><Filter className="w-4 h-4" /><span className="font-semibold text-sm">Filtros:</span></div>
          <select value={filterGenero} onChange={(e) => setFilterGenero(e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-white">
            <option value="Todos">Género: Todos</option><option value="Femenino">Femenino</option><option value="Masculino">Masculino</option>
          </select>
          <select value={filterTipoOferta} onChange={(e) => setFilterTipoOferta(e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-white">
            <option value="Todos">Oferta: Todas</option><option value="Capacitación Laboral">Cap. Laboral</option><option value="Curso">Curso</option><option value="Trayecto">Trayecto</option>
          </select>
          <select value={filterTurno} onChange={(e) => setFilterTurno(e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-white">
            <option value="Todos">Turno: Todos</option><option value="TM">Mañana</option><option value="TT">Tarde</option><option value="TN">Noche</option>
          </select>
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-white">
            <option value="Todos">Estado: Todos</option>
            {uniqueEstados.map(est => <option key={est} value={est}>{est}</option>)}
          </select>
          <select value={filterActividad} onChange={(e) => setFilterActividad(e.target.value)} className="px-3 py-2 border rounded-md text-sm bg-white max-w-xs truncate">
            <option value="Todas">Actividad: Todas</option>
            {uniqueActivities.map(act => <option key={act} value={act}>{act}</option>)}
          </select>
          <div className="relative flex-1 w-full min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border rounded-md text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </Card>
      
      {/* Resumen de Filtros para Impresión */}
      <div className="hidden print:block mb-4 text-sm text-slate-600 border-b pb-2">
        <strong>Filtros aplicados:</strong> Actividad: {filterActividad} | Turno: {filterTurno} | Estado: {filterEstado} | Género: {filterGenero}
      </div>

      {/* Gráficos (Ocultos al imprimir) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:hidden">
        <Card className="p-6 col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Género</h3>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={stats.chartDataGenero} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">{stats.chartDataGenero.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.key]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        </Card>
        <Card className="p-6 col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Turnos</h3>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={stats.chartDataTurno} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">{stats.chartDataTurno.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.key]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div>
        </Card>
        <Card className="p-6 col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Estados</h3>
          <div className="h-64"><ResponsiveContainer><BarChart data={stats.chartDataEstado} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} /><Tooltip /><Bar dataKey="value" radius={[0, 4, 4, 0]}>{stats.chartDataEstado.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Bar></BarChart></ResponsiveContainer></div>
        </Card>
        <Card className="p-6 col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Top Actividades</h3>
          <div className="h-64 overflow-y-auto"><ul className="space-y-3">{stats.chartDataActividad.slice(0, 5).map((act, idx) => <li key={idx} className="flex justify-between p-2 hover:bg-slate-50 rounded"><span className="text-xs truncate w-3/4" title={act.fullName}>{idx + 1}. {act.fullName}</span><span className="font-bold text-sm">{act.value}</span></li>)}</ul></div>
        </Card>
      </div>

      <Card className="p-6 mb-8 print:hidden">
        <h3 className="text-lg font-semibold mb-6 text-slate-800">Distribución Completa por Actividad</h3>
        <div className="h-80"><ResponsiveContainer><BarChart data={stats.chartDataActividad} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={70} tick={{fontSize: 10}} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </Card>

      <Card className="overflow-hidden print:shadow-none print:border-none">
        <div className="p-4 border-b bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 print:bg-white print:border-none print:p-0 print:mb-4">
          <h3 className="font-bold text-slate-700">Listado de Alumnos ({filteredData.length})</h3>
          <div className="flex gap-2 print:hidden">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition"
            >
              <Printer className="w-4 h-4" /> Imprimir Listado
            </button>
            <button 
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm font-medium transition"
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 uppercase text-xs print:bg-white print:border-b-2 print:border-black">
              <tr>
                <th className="p-4 print:p-2">Alumno</th>
                <th className="p-4 print:p-2">Género</th>
                <th className="p-4 print:p-2">DNI</th>
                <th className="p-4 print:p-2">Turno</th>
                <th className="p-4 print:p-2">Oferta</th>
                <th className="p-4 print:p-2">Actividad</th>
                <th className="p-4 print:p-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 print:hover:bg-transparent">
                  <td className="p-4 font-medium print:p-2">{row.alumno}</td>
                  <td className="p-4 print:p-2"><Badge type={row.genero}>{row.genero}</Badge></td>
                  <td className="p-4 text-slate-500 print:p-2">{row.dni}</td>
                  <td className="p-4 print:p-2"><Badge type={row.turno}>{row.turno}</Badge></td>
                  <td className="p-4 print:p-2"><OfferBadge type={row.tipoOferta} /></td>
                  <td className="p-4 truncate max-w-[200px] print:max-w-none print:p-2 print:whitespace-normal" title={row.actividadSimple}>{row.actividadSimple}</td>
                  <td className="p-4 print:p-2"><Badge type={row.estado}>{row.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mt-4 text-center text-xs text-slate-400 print:hidden">Sistema v1.3 - Nube Integrada</div>
    </div>
  );
}