import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Upload, FileText, Users, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

const DashboardInscripciones = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    porCarrera: [],
    porFecha: [],
    ultimosInscritos: []
  });
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  // Función para procesar el CSV
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        procesarDatos(text);
      } catch (err) {
        setError("Error al leer el archivo. Asegúrate de que sea un CSV válido.");
      }
    };
    reader.readAsText(file);
  };

  const procesarDatos = (csvText) => {
    // 1. Limpiar y dividir líneas
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      setError("El archivo parece estar vacío o no tiene datos suficientes.");
      return;
    }

    // 2. Detectar separador (coma o punto y coma)
    const headerLine = lines[0];
    const separator = headerLine.includes(';') ? ';' : ',';
    const headers = headerLine.split(separator).map(h => h.trim().toLowerCase());

    // 3. Identificar columnas clave (Intenta adivinar nombres comunes)
    const colFecha = headers.findIndex(h => h.includes('marca') || h.includes('fecha') || h.includes('time'));
    const colCarrera = headers.findIndex(h => h.includes('carrera') || h.includes('curso') || h.includes('taller') || h.includes('programa'));
    const colNombre = headers.findIndex(h => h.includes('nombre') || h.includes('apellido'));
    
    // Si no encuentra columnas clave, usa índices por defecto (0: Fecha, 1: Nombre, 2: Carrera/Dato)
    const idxFecha = colFecha !== -1 ? colFecha : 0;
    const idxCarrera = colCarrera !== -1 ? colCarrera : 2; // Asumimos columna 2 si no se encuentra
    const idxNombre = colNombre !== -1 ? colNombre : 1;

    // 4. Parsear datos
    const parsedData = lines.slice(1).map(line => {
      const values = line.split(separator).map(v => v.trim());
      if (values.length < headers.length) return null; // Saltar líneas rotas

      // Limpiar fecha (a veces Google Forms trae la hora)
      let fechaRaw = values[idxFecha] || "";
      let fechaSimple = fechaRaw.split(' ')[0]; // Toma solo la parte de la fecha antes del espacio

      return {
        fecha: fechaSimple,
        nombre: values[idxNombre] || "Anónimo",
        carrera: values[idxCarrera] || "General"
      };
    }).filter(item => item !== null);

    // 5. Calcular Estadísticas
    
    // Total
    const total = parsedData.length;

    // Por Carrera (Agrupación)
    const carreraCount = parsedData.reduce((acc, curr) => {
      acc[curr.carrera] = (acc[curr.carrera] || 0) + 1;
      return acc;
    }, {});
    
    const statsPorCarrera = Object.keys(carreraCount).map(key => ({
      name: key,
      value: carreraCount[key]
    })).sort((a, b) => b.value - a.value); // Ordenar mayor a menor

    // Por Fecha (Cronología)
    const fechaCount = parsedData.reduce((acc, curr) => {
      acc[curr.fecha] = (acc[curr.fecha] || 0) + 1;
      return acc;
    }, {});

    const statsPorFecha = Object.keys(fechaCount).map(key => ({
      fecha: key,
      inscripciones: fechaCount[key]
    })).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Ordenar por fecha real

    // Últimos 5
    const ultimos = parsedData.slice(-5).reverse();

    setData(parsedData);
    setStats({
      total,
      porCarrera: statsPorCarrera,
      porFecha: statsPorFecha,
      ultimosInscritos: ultimos
    });
  };

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans text-slate-800">
      
      {/* Header */}
      <header className="mb-8 border-b pb-4 border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          Dashboard de Inscripciones
        </h1>
        <p className="text-slate-500 mt-2">Analiza tus datos de Google Forms o Excel en segundos.</p>
      </header>

      {/* Zona de carga */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Cargar Datos</h2>
            <p className="text-sm text-slate-500">Sube tu archivo .csv exportado de Google Forms.</p>
          </div>
          
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
            <Upload className="w-5 h-5" />
            {fileName ? 'Cambiar Archivo' : 'Subir CSV'}
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
        </div>
        
        {fileName && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            Archivo cargado: <strong>{fileName}</strong>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {stats.total > 0 ? (
        <div className="space-y-8">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Inscritos</p>
                  <h3 className="text-3xl font-bold">{stats.total}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Fecha Más Activa</p>
                  <h3 className="text-xl font-bold">
                    {stats.porFecha.length > 0 
                      ? stats.porFecha.reduce((a, b) => a.inscripciones > b.inscripciones ? a : b).fecha 
                      : '-'}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Carrera Top</p>
                  <h3 className="text-xl font-bold truncate max-w-[150px]" title={stats.porCarrera[0]?.name}>
                    {stats.porCarrera[0]?.name || '-'}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Gráfico de Barras (Carreras) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Inscripciones por Carrera/Curso</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.porCarrera} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Inscritos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Línea (Tiempo) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Evolución de Inscripciones</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.porFecha}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="fecha" tick={{fontSize: 12}} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="inscripciones" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#8b5cf6" }}
                      activeDot={{ r: 8 }}
                      name="Cantidad Diaria"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabla Resumen */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Últimas 5 Inscripciones</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-semibold">
                  <tr>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Carrera / Curso</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.ultimosInscritos.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-xs">{item.fecha}</td>
                      <td className="p-4 font-medium text-slate-900">{item.nombre}</td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-medium">
                          {item.carrera}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* Estado Vacío */
        !fileName && (
          <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
            <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600">No hay datos para mostrar</h3>
            <p className="text-slate-400 mt-2">Sube un archivo CSV para ver el análisis.</p>
          </div>
        )
      )}
    </div>
  );
};

export default DashboardInscripciones;