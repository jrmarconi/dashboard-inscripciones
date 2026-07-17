import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Upload, Users, Filter, Search, 
  UserCheck, Trash2, Download, Printer, RefreshCw, AlertTriangle,
  Sun, Moon, Sunset, BookOpen, Award, X, BarChart as BarChartIcon, Target
} from 'lucide-react';

// ==============================================================================
// CONFIGURACIÓN DE ORIGEN DE DATOS AUTOMÁTICO (NUBE)
// Deja esto vacío ("") si vas a usar el CSV predefinido de abajo.
// ==============================================================================
const DATA_SOURCE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-4w1Lcx6FefPFWYVxlU_pMxGx5j_r4xENfPmhuiL2Y6qLRggLixxcHFudlXl4BZlBrELxln97B7Hu/pub?gid=1856440278&single=true&output=csv"; 

// ==============================================================================
// 1. BASE DE MATRIZ UNIFICADA (Docentes, Propuestas, Módulos Iniciales y Familia Profesional)
// ==============================================================================
const getDefaultMatriz = () => `CÓDIGO;FAMILIA PROFESIONAL;PROPUESTA;TIPO OFERTA;MODULO INICIAL;ACTIVIDAD;INSTRUCTOR/A;FECHA INICIO;FECHA FINAL;Encuentros Presenciales;DIAS;HORARIO;INASISTENCIAS;TOTAL Hs/Reloj
CFP N° 1 - Río Cuarto - 1993 - 02-TT;ESTÉTICA;ESPECIALISTA EN TRATAMIENTOS ESTÉTICO CORPORALES ;CURSO;VERDADERO;ESPECIALISTA EN TRATAMIENTOS ESTÉTICO CORPORALES ;ULIBARRI, Karina Marcela;25-08-26;01-12-26;27;MA, JU;15:00-18:35;5;96
CFP N° 1 - Río Cuarto - 1993 - 02-TT;ADMINISTRACIÓN;LIQUIDACION DE SUELDOS Y JORNALES;CURSO;VERDADERO;LIQUIDACION DE SUELDOS Y JORNALES;IBARRA Calisto;24-08-26;02-12-26;40;LU, MI, VI;15:30-18:30;8;120
CFP N° 1 - Río Cuarto - 1993 - 05-TT;MECÁNICA;MECANICA LIGERA DEL AUTOMOTOR;CURSO;VERDADERO;MECANICA LIGERA DEL AUTOMOTOR;JEREZ MEDINA,Javier Marcelo;25-08-26;27-11-26;27;MA, VI;15:30-18:30;6;80
CFP N° 1 - Río Cuarto - 1993 - 03-TT;CARPINTERÍA;CARPINTERO/A BASICO DE MUEBLES DE MELAMINA;CAPACITACIÓN LABORAL;VERDADERO;CARPINTERO/A BASICO DE MUEBLES DE MELAMINA;CONTERNO Nestor Eduardo;01-09-26;05-11-26;20;MA, JU;15:30-18:30;4;60
CFP N° 1 - Río Cuarto - 1993 - 03-TT;INFORMÁTICA;OPERADOR/A DE HERRAMIENTAS DE MARKETING DIGITAL;CAPACITACIÓN LABORAL;VERDADERO;OPERADOR/A DE HERRAMIENTAS DE MARKETING DIGITAL;ROJAS MARCONI, Jorge Enrique;18-08-26;03-12-26;32;MA, JU;15:00-18:00;7;96
CFP N° 1 - Río Cuarto - 1993 - 03-TT;INFORMÁTICA;OPERADOR/A EN GESTION Y PROCESAMIENTO DE DATOS;CAPACITACIÓN LABORAL;VERDADERO;OPERADOR/A EN GESTION Y PROCESAMIENTO DE DATOS;PERALTA, Leonel Ignacio;10-08-26;09-12-26;32;LU, MI;13:30-16:30;7;96
CFP N° 1 - Río Cuarto - 1993 - 14-TT;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;VERDADERO;FUNCION ESTRUCTURA Y SISTEMA DE TRANSMISION;FERNANDEZ,  Emerio Martin;31-08-26;21-09-26;10;LU, MI, JU;15:30-18:30;2;30
CFP N° 1 - Río Cuarto - 1993 - 14-TT;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;FALSO;GESTIÓN DE SERVICIO Y ATENCIÓN AL CLIENTE;FERNANDEZ,  Emerio Martin;23-09-26;15-10-26;10;LU, MI, JU;15:30-18:30;2;30
CFP N° 1 - Río Cuarto - 1993 - 14-TT;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;FALSO;SISTEMAS DE DIRECCION SUSPENSION Y FRENOS;FERNANDEZ,  Emerio Martin;19-10-26;09-11-26;10;LU, MI, JU;15:30-18:30;2;30
CFP N° 1 - Río Cuarto - 1993 - 14-TT;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;FALSO;SISTEMA DE DESPLAZAMIENTO;FERNANDEZ,  Emerio Martin;11-11-26;10-12-26;12;LU, MI, JU;15:30-18:30;3;36
CFP N° 1 - Río Cuarto - 1993 - 18-TT;MECÁNICA;MECÁNICO DE MOTOS 1;TRAYECTO;VERDADERO;MEDICIONES Y DIAGNOSTICOS MECANICOS;GUERETA, Walter;10-08-26;10-09-26;18;LU, MA, JU, VI;15:30-18:30;4;54
CFP N° 1 - Río Cuarto - 1993 - 18-TT;MECÁNICA;MECÁNICO DE MOTOS 1;TRAYECTO;FALSO;MEDICIONES Y DIAGNOSTICO ELECTRICO;GUERETA, Walter;14-09-26;15-10-26;18;LU, MA, JU, VI;15:30-18:30;4;54
CFP N° 1 - Río Cuarto - 1993 - 18-TT;MECÁNICA;MECÁNICO DE MOTOS 1;TRAYECTO;FALSO;GESTION Y/O ATENCION CLIENTES EXTERNOS;COSTA Cintia Lorena;02-09-26;21-10-26;6;MI;14:20-17:20;2;24
CFP N° 1 - Río Cuarto - 1993 - 18-TT;MECÁNICA;MECÁNICO DE MOTOS 1;TRAYECTO;FALSO;SISTEMA MOTOR Y TRANSMISION;GUERETA, Walter;16-10-26;14-12-26;32;LU, MA, JU, VI;15:30-18:30;7;96
CFP N° 1 - Río Cuarto - 1993 - 12-TT;MECÁNICA;MECÁNICO DE MOTOS 3;TRAYECTO;FALSO;FRENOS Y CONTROL DE TRACCION;TRIPOLI Fernando Guillermo;28-10-26;27-11-26;18;MA, MI, JU, VI;15:30-18:30;4;54
CFP N° 1 - Río Cuarto - 1993 - 12-TT;MECÁNICA;MECÁNICO DE MOTOS 3;TRAYECTO;VERDADERO;SISTEMA DE INYECCION ELECTRONICA;TRIPOLI Fernando Guillermo;18-08-26;27-10-26;40;MA, MI, JU, VI;15:30-18:30;8;120
CFP N° 1 - Río Cuarto - 1993 - 11-TT;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;VERDADERO;CIRCUITOS ELECTRICOS Y MEDICIONES;CAMPODONICO Carlos Esteban;10-08-26;07-09-26;20;LU, MA, MI, JU, VI;15:30-18:30;4;60
CFP N° 1 - Río Cuarto - 1993 - 11-TT;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;MONTAJE DE CANALIZACIONES Y TABLEROS ELECTRICOS;CAMPODONICO Carlos Esteban;08-09-26;22-10-26;32;LU, MA, MI, JU, VI;15:30-18:30;7;96
CFP N° 1 - Río Cuarto - 1993 - 11-TT;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;MONTAJE DE LINEAS Y CIRCUITOS ELECTRICOS DE BAJA TENSION;CAMPODONICO Carlos Esteban;23-10-26;19-11-26;20;LU, MA, MI, JU, VI;15:30-18:30;4;60
CFP N° 1 - Río Cuarto - 1993 - 11-TT;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;REPRESENTACION GRAFICA;PERALTA, Leonel Ignacio;01-09-26;27-11-26;25;MA, VI;13:25-15:25;5;50
CFP N° 1 - Río Cuarto - 1993 - 15-TT;ENERGÍA;ELECTRICISTA EN INMUEBLES;TRAYECTO;VERDADERO;MONTAJE DE LINEAS Y CIRCUITOS ELECTRICOS DE MUY BAJA TENSION;FERNANDEZ Victor Javier;10-08-26;14-09-26;24;LU, MA, MI, JU, VI;15:30-18:30;5;70
CFP N° 1 - Río Cuarto - 1993 - 15-TT;ENERGÍA;ELECTRICISTA EN INMUEBLES;TRAYECTO;FALSO;INSTALACIONES ELECTRICAS EN INMUEBLES (nuevo);FERNANDEZ Victor Javier;15-09-26;10-11-26;40;LU, MA, MI, JU, VI;15:30-18:30;8;120
CFP N° 1 - Río Cuarto - 1993 - 15-TT;ENERGÍA;ELECTRICISTA EN INMUEBLES;TRAYECTO;FALSO;PROYECTO DE INSTALACIONES ELECTRICAS (nuevo);FERNANDEZ Victor Javier;11-11-26;10-12-26;20;LU, MA, MI, JU, VI;15:30-18:30;4;60
CFP N° 1 - Río Cuarto - 1993 - 02-TT;ESTÉTICA;PELUQUERO/A;TRAYECTO;VERDADERO;GESTION DEL PROCESO DE TRABAJO EN ESTETICA PROFESIONAL;CELASCO Juan Carlos;11-08-26;18-08-26;5;MA, MI, JU, VI;14:00-18:00;2;20
CFP N° 1 - Río Cuarto - 1993 - 02-TT;ESTÉTICA;PELUQUERO/A;TRAYECTO;FALSO;COLORACIÓN Y CAMBIO DE ESTRUCTURA DEL CABELLO;CELASCO Juan Carlos;19-08-26;15-10-26;33;MA, MI, JU, VI;14:00-18:00;7;130
CFP N° 1 - Río Cuarto - 1993 - 02-TT;ESTÉTICA;PELUQUERO/A;TRAYECTO;FALSO;TECNICAS Y PROCESOS EN COLOR;CELASCO Juan Carlos;16-10-26;15-12-26;33;MA, MI, JU, VI;14:00-18:00;7;130
CFP N° 1 - Río Cuarto - 1993 - 05-TT;ESTÉTICA;MAQILLADOR/A PROFESIONAL;TRAYECTO;VERDADERO;PIEL Y ANEXOS CUTANEOS;COSTA, Sofia;11-08-26;26-08-26;8;MA, MI, JU;15:00-18:00;2;24
CFP N° 1 - Río Cuarto - 1993 - 05-TT;ESTÉTICA;MAQILLADOR/A PROFESIONAL;TRAYECTO;FALSO;GESTION DEL PROCESO DE TRABAJO EN ESTETICA PROFESIONAL;COSTA, Sofia;27-08-26;10-09-26;7;MA, MI, JU;15:00-18:00;2;20
CFP N° 1 - Río Cuarto - 1993 - 05-TT;ESTÉTICA;MAQILLADOR/A PROFESIONAL;TRAYECTO;FALSO;MAQUILLAJE SOCIAL;COSTA, Sofia;15-09-26;01-12-26;34;MA, MI, JU;15:00-18:00;7;100
CFP N° 1 - Río Cuarto - 1993 - 04-TM;ESTÉTICA;ESTETICA FACIAL;CURSO;VERDADERO;ESTETICA FACIAL;PERALTA, Maria Sandra;18-08-26;10-12-26;33;MA , JU;08:25-11:45;7;110
CFP N° 1 - Río Cuarto - 1993 - 03-TM;ESTÉTICA;ESTETICA FACIAL;CURSO;VERDADERO;ESTETICA FACIAL;PERALTA, Maria Sandra;12-08-26;09-12-26;33;MI, VI;08:25-11:45;7;110
CFP N° 1 - Río Cuarto - 1993 - 03-TM;MECÁNICA;MANTENIMIENTO Y REPARACIÓN DE AIRE ACONDICIONADO DEL AUTOMOTOR;CURSO;VERDADERO;MANTENIMIENTO Y REPARACIÓN DE AIRE ACONDICIONADO DEL AUTOMOTOR;PALACIOS, Marcelo Alejandro;10-08-26;07-12-26;33;LU, MIE;08:30-11:45;7;100
CFP N° 1 - Río Cuarto - 1993 - 03-TM;MECÁNICA;MECANICA LIGERA DEL AUTOMOTOR;CURSO;VERDADERO;MECANICA LIGERA DEL AUTOMOTOR;PALACIOS, Marcelo Alejandro;25-08-26;01-12-26;27;MA, VI;08:30-11:45;7;80
CFP N° 1 - Río Cuarto - 1993 - 13-TM;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;VERDADERO;FUNCION ESTRUCTURA Y SISTEMA DE TRANSMISION;FERNANDEZ,  Emerio Martin;19-08-26;21-09-26;10;LU, MI;08:30-11:45;2;30
CFP N° 1 - Río Cuarto - 1993 - 13-TM;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;FALSO;SISTEMAS DE DIRECCION SUSPENSION Y FRENOS;FERNANDEZ,  Emerio Martin;23-09-26;28-10-26;10;LU, MI;08:30-11:45;2;30
CFP N° 1 - Río Cuarto - 1993 - 13-TM;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;FALSO;SISTEMA DE DESPLAZAMIENTO;FERNANDEZ,  Emerio Martin;02-11-26;09-12-26;12;LU, MI;08:30-11:45;2;36
CFP N° 1 - Río Cuarto - 1993 - 13-TM;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;FALSO;GESTIÓN DE SERVICIO Y ATENCIÓN AL CLIENTE;COSTA Cintia Lorena;15-10-26;17-12-26;10;JU;08:30-11:45;2;30
CFP N° 1 - Río Cuarto - 1993 - 16-TM;MECÁNICA;AUXILIAR MECÁNICO DE MOTORES DE COMBUSTIÓN INTERNA;TRAYECTO;VERDADERO;SISTEMA MOTOR DE COMBUSTION INTERNA;GIADANES, Ruben Daniel;24-08-26;04-12-26;57;LU, MA, MI, VI;08:30-11:45;11;170
CFP N° 1 - Río Cuarto - 1993 - 10-TM;MECÁNICA;MECÁNICO DE SISTEMA DE ENCENDIDO Y ALIMENTACIÓN;TRAYECTO;VERDADERO;MEDICIONES Y DIAGNOSTICO ELECTRICO-ELECTRÓNICO;TRIPOLI Fernando;11-08-26;15-09-26;20;MA, MI, JU,VI;08:30-11:45;3;54
CFP N° 1 - Río Cuarto - 1993 - 10-TM;MECÁNICA;MECÁNICO DE SISTEMA DE ENCENDIDO Y ALIMENTACIÓN;TRAYECTO;FALSO;SISTEMA DE INYECCIÓN NAFTA;TRIPOLI Fernando;16-09-26;10-12-26;48;MA, MI, JU,VI;08:30-11:45;10;156
CFP N° 1 - Río Cuarto - 1993 - 10-TM;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;VERDADERO;CIRCUITOS ELECTRICOS Y MEDICIONES;ECHAIDE, Omar Eduardo;10-08-26;04-09-26;19;LU, MA, MI, JU, VI;08:30-11:45;4;60
CFP N° 1 - Río Cuarto - 1993 - 10-TM;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;MONTAJE DE CANALIZACIONES Y TABLEROS ELECTRICOS;ECHAIDE, Omar Eduardo;07-09-26;20-10-26;30;LU, MA, MI, JU, VI;08:30-11:45;6;96
CFP N° 1 - Río Cuarto - 1993 - 10-TM;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;MONTAJE DE LINEAS Y CIRCUITOS ELECTRICOS DE BAJA TENSION;ECHAIDE, Omar Eduardo;21-10-26;16-11-26;19;LU, MA, MI, JU, VI;08:30-11:45;4;60
CFP N° 1 - Río Cuarto - 1993 - 10-TM;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;REPRESENTACION GRAFICA;ECHAIDE, Omar Eduardo;17-11-26;11-12-26;16;LU, MA, MI, JU, VI;08:30-11:45;4;50
CFP N° 1 - Río Cuarto - 1993 - 02-TM;ENERGÍA;ELECTRICISTA INMUEBLES;TRAYECTO;VERDADERO;MONTAJE DE LINEAS Y CIRCUITOS ELECTRICOS DE MUY BAJA TENSION;ALVAREZ FERNANDEZ, Ricardo Jose;10-08-26;09-09-26;22;LU, MA, MI, JU, VI;08:30-11:45;5;70
CFP N° 1 - Río Cuarto - 1993 - 02-TM;ENERGÍA;ELECTRICISTA INMUEBLES;TRAYECTO;FALSO;INSTALACIONES ELECTRICAS EN INMUEBLES (nuevo);ALVAREZ FERNANDEZ, Ricardo Jose;10-09-26;05-11-26;39;LU, MA, MI, JU, VI;08:30-11:45;8;120
CFP N° 1 - Río Cuarto - 1993 - 02-TM;ENERGÍA;ELECTRICISTA INMUEBLES;TRAYECTO;FALSO;PROYECTO DE INSTALACIONES ELECTRICAS (nuevo);ALVAREZ FERNANDEZ, Ricardo Jose;06-11-26;04-12-26;20;LU, MA, MI, JU, VI;08:30-11:45;4;60
CFP N° 1 - Río Cuarto - 1993 - 01-TM;ESTÉTICA;PELUQUERO/A;TRAYECTO;VERDADERO;GESTION DEL PROCESO DE TRABAJO EN ESTETICA PROFESIONAL;ALVES DA SILVA, Johanna;11-08-26;25-08-26;7;MA, MI, VI;08:30-11:45;1;20
CFP N° 1 - Río Cuarto - 1993 - 01-TM;ESTÉTICA;MECÁNICO DE MOTOS 3;TRAYECTO;FALSO;COLORACIÓN Y CAMBIO DE ESTRUCTURA DEL CABELLO;ALVES DA SILVA, Johanna;26-08-26;09-12-26;44;MA, MI, VI;08:30-11:45;9;130
CFP N° 1 - Río Cuarto - 1993 - 01-TM;INFORMÁTICA;PROGRAMADOR;TRAYECTO;VERDADERO;PROGRAMACION ORIENTADA A OBJETOS;FEDERICO, Juan Martin;25-08-25;19-11-26;50;LU, MA, MI, JU;08:30-11:45;10;150
CFP N° 1 - Río Cuarto - 1993 - 03-TN;ADMINISTRACIÓN;AUXILIAR CONTABLE ;CURSO;VERDADERO;AUXILIAR CONTABLE ;IBARRA Calisto;11-08-26;16-12-26;38;MA, MI;18:50-22:10;8;120
CFP N° 1 - Río Cuarto - 1993 - 03-TN;ESTÉTICA;ESPECIALISTA EN TRATAMIENTOS ESTÉTICO CORPORALES ;CURSO;VERDADERO;ESPECIALISTA EN TRATAMIENTOS ESTÉTICO CORPORALES ;ULIBARRI, Karina Marcela;11-08-26;26-11-26;32;MA, JU;19:00-22:10;6;96
CFP N° 1 - Río Cuarto - 1993 - 03-TN;ESTÉTICA;ESTETICA CORPORAL  ;CURSO;VERDADERO;ESTETICA CORPORAL  ;ULIBARRI, Karina Marcela;10-08-26;09-12-26;34;LU, MI;18:50-22:10;7;112
CFP N° 1 - Río Cuarto - 1993 - 03-TN;ADMINISTRACIÓN;LIQUIDACION DE SUELDOS Y JORNALES;CURSO;VERDADERO;LIQUIDACION DE SUELDOS Y JORNALES;IBARRA Calisto;10-08-26;13-11-26;40;LU, JU, VI ;19:00-22:10;8;120
CFP N° 1 - Río Cuarto - 1993 - 04-TN;MECÁNICA;MANTENIMIENTO Y REPARACIÓN DE AIRE ACONDICIONADO DEL AUTOMOTOR;CURSO;VERDADERO;MANTENIMIENTO Y REPARACIÓN DE AIRE ACONDICIONADO DEL AUTOMOTOR;BRAMUGLIA, Javier Leonardo;11-08-26;03-12-26;34;MA, JU;19:00-22:10;7;100
CFP N° 1 - Río Cuarto - 1993 - 05-TN;MECÁNICA;MECANICA LIGERA DEL AUTOMOTOR;CURSO;VERDADERO;MECANICA LIGERA DEL AUTOMOTOR;BRAMUGLIA, Javier Leonardo;02-09-26;09-12-26;27;LU, MIE;19:00-22:10;7;80
CFP N° 1 - Río Cuarto - 1993 - 04-TN;CARPINTERÍA;CARPINTERO/A BASICO DE MUEBLES DE MELAMINA;CAPACITACIÓN LABORAL;VERDADERO;CARPINTERO/A BASICO DE MUEBLES DE MELAMINA;CONTERNO Nestor Eduardo;01-09-26;05-11-26;20;MA, JU;19:00-22:10;4;60
CFP N° 1 - Río Cuarto - 1993 - 04-TN;INFORMÁTICA;OPERADOR DE HERRAMIENTAS DE MARKETING DIGITAL;CAPACITACIÓN LABORAL;VERDADERO;OPERADOR DE HERRAMIENTAS DE MARKETING DIGITAL;MEDINA Miguel Angel ;11-08-26;27-11-26;32;MA, VI;19:00-22:10;7;96
CFP N° 1 - Río Cuarto - 1993 - 04-TN;INFORMÁTICA;OPERADOR/A EN GESTION Y PROCESAMIENTO DE DATOS;CAPACITACIÓN LABORAL;VERDADERO;OPERADOR/A EN GESTION Y PROCESAMIENTO DE DATOS;MEDINA Miguel Angel ;12-08-26;09-12-26;32;LU, MI;19:00-22:10;7;96
CFP N° 1 - Río Cuarto - 1993 - 15-TN;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;VERDADERO;FUNCION ESTRUCTURA Y SISTEMA DE TRANSMISION;FERNANDEZ,  Emerio Martin;31-08-26;21-09-26;10;LU, MI, JU;19:00-22:10;2;30
CFP N° 1 - Río Cuarto - 1993 - 15-TN;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;FALSO;GESTIÓN DE SERVICIO Y ATENCIÓN AL CLIENTE;FERNANDEZ,  Emerio Martin;23-09-26;15-10-26;10;LU, MI, JU;19:00-22:10;2;30
CFP N° 1 - Río Cuarto - 1993 - 15-TN;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;FALSO;SISTEMAS DE DIRECCION SUSPENSION Y FRENOS;FERNANDEZ,  Emerio Martin;19-10-26;09-11-26;10;LU, MI, JU;19:00-22:10;2;30
CFP N° 1 - Río Cuarto - 1993 - 15-TN;MECÁNICA;MECÁNICO DE BICICLETAS;TRAYECTO;FALSO;SISTEMA DE DESPLAZAMIENTO;FERNANDEZ,  Emerio Martin;11-11-26;10-12-26;12;LU, MI, JU;19:00-22:10;3;36
CFP N° 1 - Río Cuarto - 1993 - 17-TN;MECÁNICA;AUXILIAR MECÁNICO DE MOTORES DE COMBUSTIÓN INTERNA;TRAYECTO;VERDADERO;SISTEMA MOTOR DE COMBUSTION INTERNA;GUERETA, Walter;27-08-26;10-12-26;57;LU, MI, JU, VI;19:00-22:10;11;170
CFP N° 1 - Río Cuarto - 1993 - 08-TN;MECÁNICA;ELECTRICISTA DE AUTOMOTORES;TRAYECTO;VERDADERO;CIRCUITOS CABLEADOS - EQUIPAMIENTOS;JEREZ MEDINA,Javier Marcelo;13-08-26;07-10-26;32;MA, MI, JU, VI;19:00-22:10;6;96
CFP N° 1 - Río Cuarto - 1993 - 08-TN;MECÁNICA;ELECTRICISTA DE AUTOMOTORES;TRAYECTO;FALSO;SISTEMA DE ARRANQUE Y CARGA;JEREZ MEDINA,Javier Marcelo;08-10-26;03-12-26;33;MA, MI, JU, VI;19:00-22:10;7;96
CFP N° 1 - Río Cuarto - 1993 - 08-TN;MECÁNICA;ELECTRICISTA DE AUTOMOTORES;TRAYECTO;FALSO;GESTION DE SERVICIO;JEREZ MEDINA,Javier Marcelo;24-08-26;02-11-26;10;LU;19:00-22:10;2;30
CFP N° 1 - Río Cuarto - 1993 - 11-TN;MECÁNICA;MECANICO EN SISTEMAS DE ENCENDIDO Y ALIMENTACION (INYECCIÓN NAFTA);TRAYECTO;VERDADERO;MEDICIONES Y DIAGNOSTICO ELECTRICO-ELECTRÓNICO;PICCOLO Diego Sebastian;11-08-26;15-09-26;21;MA, MI, JU, VI;18:50-22:10;4;54
CFP N° 1 - Río Cuarto - 1993 - 11-TN;MECÁNICA;MECANICO EN SISTEMAS DE ENCENDIDO Y ALIMENTACION (INYECCIÓN NAFTA);TRAYECTO;FALSO;SISTEMA DE INYECCIÓN NAFTA;PICCOLO Diego Sebastian;16-09-26;15-12-26;50;MA, MI, JU, VI;18:50-22:10;10;156
CFP N° 1 - Río Cuarto - 1993 - 17-TN;MECÁNICA;AUXILIAR MECÁNICO DE MOTORES DE COMBUSTIÓN INTERNA;TRAYECTO;FALSO;GESTION DE SERVICIO;GUERETA, Walter;01-09-26;03-11-26;10;MA;19:00-22:10;2;30
CFP N° 1 - Río Cuarto - 1993 - 07-TN;MECÁNICA;MECÁNICO DE MOTOS 2;TRAYECTO;FALSO;GESTION DE SERVICIO;TRIPOLI Fernando;13-08-26;15-10-26;10;JU;19:00-22:10;2;30
CFP N° 1 - Río Cuarto - 1993 - 07-TN;MECÁNICA;MECÁNICO DE MOTOS 2;TRAYECTO;VERDADERO;SISTEMA DE ALIMENTACION Y ENCENDIDO (motos);TRIPOLI Fernando;11-08-26;21-10-26;30;LU, MA, MI;19:00-22:10;6;90
CFP N° 1 - Río Cuarto - 1993 - 07-TN;MECÁNICA;MECÁNICO DE MOTOS 2;TRAYECTO;FALSO;SUSPENSION DIRECCION Y CHASIS;TRIPOLI Fernando;26-10-26;09-12-26;18;LU, MA, MI;19:00-22:10;4;54
CFP N° 1 - Río Cuarto - 1993 - 12-TN;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;VERDADERO;CIRCUITOS ELECTRICOS Y MEDICIONES;CAMPODONICO Carlos Esteban;10-08-26;04-09-26;19;LU, MA, MI, JU, VI;18:55-22:10;4;60
CFP N° 1 - Río Cuarto - 1993 - 12-TN;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;MONTAJE DE CANALIZACIONES Y TABLEROS ELECTRICOS;CAMPODONICO Carlos Esteban;07-09-26;19-10-26;30;LU, MA, MI, JU, VI;18:55-22:10;7;96
CFP N° 1 - Río Cuarto - 1993 - 12-TN;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;MONTAJE DE LINEAS Y CIRCUITOS ELECTRICOS DE BAJA TENSION;CAMPODONICO Carlos Esteban;20-10-26;13-11-26;19;LU, MA, MI, JU, VI;18:55-22:10;4;60
CFP N° 1 - Río Cuarto - 1993 - 12-TN;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;REPRESENTACION GRAFICA;CAMPODONICO Carlos Esteban;16-11-26;09-12-26;16;LU, MA, MI, JU, VI;18:55-22:10;3;50
CFP N° 1 - Río Cuarto - 1993 - 13-TN;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;VERDADERO;CIRCUITOS ELECTRICOS Y MEDICIONES;ALVAREZ FERNANDEZ, Ricardo Jose;10-08-26;04-09-26;19;LU, MA, MI, JU, VI;18:55-22:10;4;60
CFP N° 1 - Río Cuarto - 1993 - 13-TN;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;MONTAJE DE CANALIZACIONES Y TABLEROS ELECTRICOS;ALVAREZ FERNANDEZ, Ricardo Jose;07-09-26;19-10-26;30;LU, MA, MI, JU, VI;18:55-22:10;7;96
CFP N° 1 - Río Cuarto - 1993 - 13-TN;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;MONTAJE DE LINEAS Y CIRCUITOS ELECTRICOS DE BAJA TENSION;ALVAREZ FERNANDEZ, Ricardo Jose;20-10-26;13-11-26;19;LU, MA, MI, JU, VI;18:55-22:10;4;60
CFP N° 1 - Río Cuarto - 1993 - 13-TN;ENERGÍA;MONTADOR ELECTRICISTA DOMICILIARIO;TRAYECTO;FALSO;REPRESENTACION GRAFICA;ALVAREZ FERNANDEZ, Ricardo Jose;16-11-26;09-12-26;16;LU, MA, MI, JU, VI;18:55-22:10;3;50
CFP N° 1 - Río Cuarto - 1993 - 15-TN;ENERGÍA;ELECTRICISTA EN INMUEBLES;TRAYECTO;VERDADERO;MONTAJE DE LINEAS Y CIRCUITOS ELECTRICOS DE MUY BAJA TENSION;LUTZ, Federico Ariel;10-08-26;14-09-26;24;LU, MA, MI, JU, VI;19:00-22:10 ;8;70
CFP N° 1 - Río Cuarto - 1993 - 15-TN;ENERGÍA;ELECTRICISTA EN INMUEBLES;TRAYECTO;FALSO;INSTALACIONES ELECTRICAS EN INMUEBLES (nuevo);LUTZ, Federico Ariel;15-09-26;11-11-26;40;LU, MA, MI, JU, VI;19:00-22:10 ;8;120
CFP N° 1 - Río Cuarto - 1993 - 15-TN;ENERGÍA;ELECTRICISTA EN INMUEBLES;TRAYECTO;FALSO;PROYECTO DE INSTALACIONES ELECTRICAS (nuevo);LUTZ, Federico Ariel;12-11-26;12-12-26;20;LU, MA, MI, JU, VI;19:00-22:10;4;60
CFP N° 1 - Río Cuarto - 1993 - 16-TN;ENERGÍA;ELECTRICISTA INDUSTRIAL;TRAYECTO;VERDADERO;TECNOLOGIA DE CONTROL;FERNANDEZ Victor Javier;10-08-26;14-09-26;20;LU, MA, MI, JU;19:00-22:10;4;60
CFP N° 1 - Río Cuarto - 1993 - 16-TN;ENERGÍA;ELECTRICISTA INDUSTRIAL;TRAYECTO;FALSO;INSTALACION Y MANTENIMIENTO DE MAQUINAS ELECTRICAS;FERNANDEZ Victor Javier;15-09-26;14-10-26;17;LU, MA, MI, JU;19:00-22:10;3;50
CFP N° 1 - Río Cuarto - 1993 - 16-TN;ENERGÍA;ELECTRICISTA INDUSTRIAL;TRAYECTO;FALSO;INSTALACIONES ELECTRICAS INDUSTRIALES;FERNANDEZ Victor Javier;15-10-26;02-12-26;27;LU, MA, MI, JU;19:00-22:10;6;80
CFP N° 1 - Río Cuarto - 1993 - 03-TN;ESTÉTICA;PELUQUERO/A;TRAYECTO;VERDADERO;GESTION DEL PROCESO DE TRABAJO EN ESTETICA PROFESIONAL;CELASCO Juan Carlos;11-08-26;25-08-26;7;MA, MI, VI;19:00-22:10;1;20
CFP N° 1 - Río Cuarto - 1993 - 03-TN;ESTÉTICA;PELUQUERO/A;TRAYECTO;FALSO;COLORACIÓN Y CAMBIO DE ESTRUCTURA DEL CABELLO;CELASCO Juan Carlos;26-08-26;11-12-26;44;MA, MI, VI;19:00-22:10 ;9;130
CFP N° 1-Av PEDRO DE MENDOZA-1777-01;;FOTOGRAFO/A;TRAYECTO;FALSO;COMPOSICIÓN;AGUSTI Juan;04-05-26;28-09-26;16;LU;19:00-22:10;3;48
CFP N° 1-Av PEDRO DE MENDOZA-1777-01;;FOTOGRAFO/A;TRAYECTO;FALSO;CÁMARA Y PARAMETRO DE TOMA Y EXPOSICIÓN;VIGNALE Leonardo;17-03-26;24-09-26;43;MA, JU;19:00-22:10;9;128
CFP N° 1-Av PEDRO DE MENDOZA-1777-01;;FOTOGRAFO/A;TRAYECTO;FALSO;PROCESAMIENTO DE IMAGEN FOTOGRÁFICA;VIGNALE Leonardo;29-09-26;19-11-26;16;MA, JU;19:00-22:10;4;48
CFP N° 1-Av PEDRO DE MENDOZA-1777-02;;FOTOGRAFO/A;TRAYECTO;FALSO;COMPOSICIÓN;ALVAREZ Leonardo;20-05-26;23-09-26;16;MI;19:00-22:10;3;48
CFP N° 1-Av PEDRO DE MENDOZA-1777-02;;FOTOGRAFO/A;TRAYECTO;FALSO;CÁMARA Y PARAMETRO DE TOMA Y EXPOSICIÓN;MORALES Franco;23-03-26;21-09-26;43;LU, MA;19:00-22:10;9;128
CFP N° 1-Av PEDRO DE MENDOZA-1777-02;;FOTOGRAFO/A;TRAYECTO;FALSO;PROCESAMIENTO DE IMAGEN FOTOGRÁFICA;MORALES Franco;22-09-26;17-11-26;16;LU, MA;19:00-22:10;4;48
CFP N° 1-Av PEDRO DE MENDOZA-1777-03;;FOTOGRAFO/A;TRAYECTO;FALSO;REALIZACIÓN FOTOGRÁFICA;SANTAITI Cayetano;26-03-26;05-11-26;55;JU, VI;19:00-21:35;9;128
CFP N° 1-Av PEDRO DE MENDOZA-1777-03;;FOTOGRAFO/A;TRAYECTO;FALSO;ILIMINACIÓN FOTOGRÁFICA;GENISE Maria Eva;31-03-26;24-11-26;32;MA;19:00-22:10 ;7;96
CFP N° 1-Av PEDRO DE MENDOZA-1777-04;;FOTOGRAFO/A;TRAYECTO;FALSO;REALIZACIÓN FOTOGRÁFICA;SANTAITI Cayetano;01-09-26;01-06-27;55;MA, MI;19:00-21:35;9;128
CFP N° 1-Av PEDRO DE MENDOZA-1777-04;;FOTOGRAFO/A;TRAYECTO;FALSO;ILIMINACIÓN FOTOGRÁFICA;GENISE Maria Eva;24-08-26;28-06-27;32;LU;19:00-22:10 ;7;96
CFP N° 1-Av PEDRO DE MENDOZA-1777-05;;FOTOGRAFO/A;TRAYECTO;FALSO;ELEMENTOS VISUALES;PAZO Luciana;10-08-26;05-10-26;8;MI;19:00-22:10;2;24
CFP N° 1-Av PEDRO DE MENDOZA-1777-05;;FOTOGRAFO/A;TRAYECTO;FALSO;COMPOSICIÓN;PAZO Luciana;19-10-26;03-05-27;16;MI;19:00-22:10;4;48
CFP N° 1-Av PEDRO DE MENDOZA-1777-05;;FOTOGRAFO/A;TRAYECTO;FALSO;CÁMARA Y PARAMETRO DE TOMA Y EXPOSICIÓN;MORANA Pablo Andres;20-08-26;16-04-27;43;JU, VI;19:00-22:10;9;128`;

// ==============================================================================
// 2. BASE DE INSCRIPCIONES PREDEFINIDA
// ==============================================================================
const getDefaultInscripciones = () => [
"Alumno,Identificación,Mail,Teléfono,Comisión,Estado Insc.,Actividad",
"\"Aguirre Zanca, Karina Ana\",DNI 24804039,karinaguirre75@gmail.com,1126549320,CFP N° 1 - Río Cuarto - 1993 - 01-TT,Pendiente,(CL_1436) Operador de Herramientas de Marketing Digital",
"\"ALARCON VILLAMAYOR, OLGA LILIOSA\",DNI 95625371,lili90villamayor@gmail.com,1128732605,CFP N° 1 - Río Cuarto - 1993 - 02-TN,Pendiente,(CL_1436) Operador de Herramientas de Marketing Digital",
"\"ALVAREZ, MIRTA SUSANA\",DNI 23454865,alvarezsusana549@gmail.com,01160370455,CFP N° 1 - Río Cuarto - 1993 - 02-TN,Aceptada,(CL_1436) Operador de Herramientas de Marketing Digital",
"\"Andriani, Camila AGUSTINA\",DNI 47127952,camilalovers339@gmail.com,541159781620,CFP N° 1 - Río Cuarto - 1993 - 01-TT,Aceptada,(CL_1436) Operador de Herramientas de Marketing Digital",
"\"PIREZ, PABLO NAHUEL\",DNI 47435248,nahuelpirez12@gmail.com,3584112233,CFP N° 1 - Río Cuarto - 1993 - 05-TN,Pendiente,(TR_MYA_ME_1) Sistema motor de combustión interna",
"\"RAMOS, AGOSTINA CELESTE\",DNI 47738200,agostinacr28@gmail.com,3585998877,CFP N° 1 - Río Cuarto - 1993 - 04-TM,Pendiente,(TR_MYA_ME_1) Sistema motor de combustión interna",
"\"REYNAGA VALE, FRANCISCO\",DNI 94056832,juanrenvion@gmail.com,358987654,CFP N° 1 - Río Cuarto - 1993 - 04-TM,Rechazada,(TR_MYA_ME_1) Sistema motor de combustión interna"
].join('\n');


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

// --- Helper de Normalización para Cruce de Datos ---
const normalizeKey = (str) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Limpia "(TR_123)" y deja el nombre puro normalizado
const cleanActivityName = (act) => {
  if (!act) return '';
  const nameOnly = act.replace(/^\([A-Z0-9_]+\)\s*/i, '');
  return normalizeKey(nameOnly);
};

// Extrae SOLO el número de la comisión (Ej. 02, 16)
const extractComisionNumber = (com) => {
  if (!com) return '';
  const match = com.match(/1993\s*-\s*0*(\d+)/);
  if (match) return match[1]; 
  return normalizeKey(com);
};

// Helper para unificar nombres de docentes: "ULIBARRI, Karina Marcela" => "Ulibarri Karina Marcela"
const formatDocenteName = (str) => {
  if (!str) return '';
  const clean = str.replace(/,/g, '').trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' '); 
  return clean.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); 
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

const COLORS = {
  TM: '#F59E0B', TT: '#F97316', TN: '#4F46E5', Unknown: '#9CA3AF',
  Aceptada: '#10B981', Pendiente: '#F59E0B', Rechazada: '#EF4444',
  Femenino: '#EC4899', Masculino: '#3B82F6'
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>{children}</div>
);

const Badge = ({ children, type }) => {
  let classes = "px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ";
  switch (type) {
    case 'Aceptada': classes += "bg-green-100 text-green-800 print:bg-transparent print:border print:border-green-600 print:text-green-800"; break;
    case 'Rechazada': classes += "bg-red-100 text-red-800 print:bg-transparent print:border print:border-red-600 print:text-red-800"; break;
    case 'Pendiente': classes += "bg-yellow-100 text-yellow-800 print:bg-transparent print:border print:border-yellow-600 print:text-yellow-800"; break;
    case 'TM': classes += "bg-amber-100 text-amber-800 border border-amber-200 print:bg-transparent print:border-amber-600"; break;
    case 'TT': classes += "bg-orange-100 text-orange-800 border border-orange-200 print:bg-transparent print:border-orange-600"; break;
    case 'TN': classes += "bg-indigo-100 text-indigo-800 border border-indigo-200 print:bg-transparent print:border-indigo-600"; break;
    default: classes += "bg-gray-100 text-gray-800 print:bg-transparent print:border-gray-500 print:border";
  }
  return <span className={classes}>{children}</span>;
};

export default function DashboardInscripciones() {
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // Mapas Unificados desde MATRIZ
  const [docentesMap, setDocentesMap] = useState({}); 
  const [propuestasMap, setPropuestasMap] = useState({});
  const [familiasMap, setFamiliasMap] = useState({});
  const [modulosInicialesSet, setModulosInicialesSet] = useState([]);
  
  // Filtros
  const [filterTurno, setFilterTurno] = useState('Todos');
  const [filterFamilia, setFilterFamilia] = useState('Todas');
  const [filterActividad, setFilterActividad] = useState('Todas');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterTipoOferta, setFilterTipoOferta] = useState('Todos');
  const [filterDocente, setFilterDocente] = useState('Todos');
  const [filterPropuesta, setFilterPropuesta] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para mostrar gráficos completos
  const [showFullActChart, setShowFullActChart] = useState(false);
  const [showFullPropChart, setShowFullPropChart] = useState(false);
  const [showFullInicialesChart, setShowFullInicialesChart] = useState(false);

  const [dataSource, setDataSource] = useState('default');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);

  useEffect(() => {
    // 1. Cargar MATRIZ unificada
    if (getDefaultMatriz().trim() !== '') {
      processMatrizCSV(getDefaultMatriz(), false);
    }
    
    // Cargar caché si existe
    const storedDocentes = localStorage.getItem('dashboard_docentes_map');
    if (storedDocentes) try { setDocentesMap(prev => ({ ...prev, ...JSON.parse(storedDocentes) })); } catch (e) {}
    
    const storedPropuestas = localStorage.getItem('dashboard_propuestas_map');
    if (storedPropuestas) try { setPropuestasMap(prev => ({ ...prev, ...JSON.parse(storedPropuestas) })); } catch (e) {}

    const storedFamilias = localStorage.getItem('dashboard_familias_map');
    if (storedFamilias) try { setFamiliasMap(prev => ({ ...prev, ...JSON.parse(storedFamilias) })); } catch (e) {}
    
    const storedIniciales = localStorage.getItem('dashboard_modulos_iniciales');
    if (storedIniciales) try { setModulosInicialesSet(prev => Array.from(new Set([...prev, ...JSON.parse(storedIniciales)]))); } catch (e) {}

    // 2. Cargar Inscripciones
    loadData();
  }, []);

  const processMatrizCSV = (csvText, saveLocal = true) => {
    try {
      const parsed = parseCSV(csvText);
      if (parsed.length < 2) return 0;
      
      const headers = parsed[0].map(h => h.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim());
      const dataRows = parsed.slice(1);

      const mapD = {};
      const mapP = {};
      const mapF = {};
      const inicialesSet = new Set();
      
      const idxCodigo = headers.findIndex(h => h.includes('codigo') || h.includes('comision'));
      const idxFamilia = headers.findIndex(h => h.includes('familia'));
      const idxActividad = headers.findIndex(h => h.includes('actividad'));
      const idxInstructor = headers.findIndex(h => h.includes('instructor') || h.includes('apellido'));
      const idxPropuesta = headers.findIndex(h => h.includes('propuesta'));
      const idxModuloInicial = headers.findIndex(h => h.includes('modulo inicial') || h.includes('modulo'));

      if (idxActividad === -1 || idxCodigo === -1) {
        console.warn("El archivo Matriz no tiene las columnas requeridas (CÓDIGO, ACTIVIDAD).");
        return 0;
      }

      let count = 0;
      dataRows.forEach(row => {
        if (row.length > Math.max(idxCodigo, idxActividad)) {
          const actividadRaw = row[idxActividad] || '';
          const actClean = cleanActivityName(actividadRaw);
          
          if (!actClean) return;
          
          // Propuesta Formativa
          if (idxPropuesta !== -1 && row[idxPropuesta]) {
            const prop = row[idxPropuesta].trim();
            if (prop && prop !== 'Sin Propuesta') {
              mapP[actClean] = prop;
            }
          }

          // Familia Profesional
          if (idxFamilia !== -1 && row[idxFamilia]) {
             const fam = row[idxFamilia].trim();
             if (fam) mapF[actClean] = fam;
          }

          // Docente
          const comisionRaw = row[idxCodigo] || '';
          const comNum = extractComisionNumber(comisionRaw);
          
          if (idxInstructor !== -1 && row[idxInstructor]) {
            const rawFullName = row[idxInstructor].trim();
            if (rawFullName) {
               const docenteFullName = formatDocenteName(rawFullName);
               if (comNum) {
                 mapD[`${comNum}|${actClean}`] = docenteFullName;
               }
            }
          }

          // Módulo Inicial
          if (idxModuloInicial !== -1 && row[idxModuloInicial]) {
             const val = row[idxModuloInicial].trim().toUpperCase();
             if (val === 'VERDADERO' || val === 'SI' || val === 'TRUE') {
                inicialesSet.add(actClean);
             }
          }
          count++;
        }
      });

      setDocentesMap(prev => {
        const merged = { ...prev, ...mapD };
        if (saveLocal) localStorage.setItem('dashboard_docentes_map', JSON.stringify(merged));
        return merged;
      });

      setPropuestasMap(prev => {
        const merged = { ...prev, ...mapP };
        if (saveLocal) localStorage.setItem('dashboard_propuestas_map', JSON.stringify(merged));
        return merged;
      });

      setFamiliasMap(prev => {
        const merged = { ...prev, ...mapF };
        if (saveLocal) localStorage.setItem('dashboard_familias_map', JSON.stringify(merged));
        return merged;
      });

      setModulosInicialesSet(prev => {
        const merged = Array.from(new Set([...prev, ...Array.from(inicialesSet)]));
        if (saveLocal) localStorage.setItem('dashboard_modulos_iniciales', JSON.stringify(merged));
        return merged;
      });

      return count;
    } catch (error) {
       console.error("Error procesando Matriz", error);
       if (saveLocal) alert("Hubo un error al procesar el archivo Matriz.");
       return 0;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setFetchError(null);

    // Prioridad 1: Nube
    if (DATA_SOURCE_URL && DATA_SOURCE_URL.trim() !== "") {
      try {
        const response = await fetch(DATA_SOURCE_URL);
        if (!response.ok) throw new Error('Error de conexión con la hoja de cálculo');
        
        const lastModifiedHeader = response.headers.get('Last-Modified');
        const text = await response.text();
        processCSV(text, false, false, "Datos en la Nube (Auto)", lastModifiedHeader);
        setDataSource('cloud');
        setIsLoading(false);
        return; 
      } catch (error) {
        setFetchError("No se pudo conectar a Google Sheets. Mostrando datos locales/predefinidos.");
      }
    }

    // Prioridad 2: Datos cargados manualmente y guardados en LocalStorage
    const storedData = localStorage.getItem('dashboard_data');
    if (storedData) {
      try {
        setRawData(JSON.parse(storedData));
        setFileName(localStorage.getItem('dashboard_filename') || 'Archivo Guardado');
        setDataSource('local');
        setLastUpdateDate(new Date(localStorage.getItem('dashboard_last_update') || new Date()));
        setIsLoading(false);
        return;
      } catch (e) {
        console.warn("Error leyendo datos locales, usando predefinidos.");
      }
    } 
    
    // Prioridad 3: Datos por defecto
    processCSV(getDefaultInscripciones(), true, false, 'Inscripciones Predefinidas');
    setIsLoading(false);
  };

  const processCSV = (csvText, isSample = false, persist = false, newFileName = '', headerDate = null) => {
    try {
      const parsed = parseCSV(csvText);
      if(parsed.length < 2) return;

      const headers = parsed[0];
      const dataRows = parsed.slice(1);

      const processed = dataRows.map(row => {
        const item = {};
        headers.forEach((header, index) => {
          let key = header.trim();
          if (key.includes('Alumno')) key = 'alumno';
          else if (key.includes('Identificación')) key = 'dni';
          else if (key.includes('Mail')) key = 'email';
          else if (key.includes('Teléfono') || key.includes('Celular')) key = 'telefono';
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

      setRawData(processed);
      const updateTime = headerDate ? new Date(headerDate) : new Date();
      setLastUpdateDate(updateTime);
      
      if (isSample) {
        setFileName(newFileName || 'Datos Predefinidos');
        setDataSource('default');
      } else {
        setFileName(newFileName);
        if (persist) { 
          localStorage.setItem('dashboard_data', JSON.stringify(processed));
          localStorage.setItem('dashboard_filename', newFileName);
          localStorage.setItem('dashboard_last_update', updateTime.toISOString()); 
          setDataSource('local');
        }
      }
    } catch (e) {
      alert("Error al procesar el archivo CSV de inscripciones.");
    }
  };

  // --- Cruce de Datos (Totalmente Optimizado) ---
  const enrichedData = useMemo(() => {
    return rawData.map(item => {
      const actClean = cleanActivityName(item.actividad);
      const comNum = extractComisionNumber(item.comision);
      
      const docenteKey = `${comNum}|${actClean}`;
      const docente = docentesMap[docenteKey] || 'Sin Asignar';
      
      const propuesta = propuestasMap[actClean] || 'Sin Propuesta';
      const familia = familiasMap[actClean] || 'Sin Familia';
      
      return { ...item, docente, propuesta, familia };
    });
  }, [rawData, docentesMap, propuestasMap, familiasMap]);

  // --- Listas completas para los Selects ---
  const uniqueDocentes = useMemo(() => {
    const fromData = enrichedData.map(item => item.docente);
    const fromMap = Object.values(docentesMap);
    return [...new Set([...fromData, ...fromMap].filter(d => d !== 'Sin Asignar'))].sort();
  }, [enrichedData, docentesMap]);

  const uniquePropuestas = useMemo(() => {
    const fromData = enrichedData.map(item => item.propuesta);
    const fromMap = Object.values(propuestasMap);
    return [...new Set([...fromData, ...fromMap].filter(p => p !== 'Sin Propuesta'))].sort();
  }, [enrichedData, propuestasMap]);

  const uniqueFamilias = useMemo(() => {
    const fromData = enrichedData.map(item => item.familia);
    const fromMap = Object.values(familiasMap);
    return [...new Set([...fromData, ...fromMap].filter(f => f !== 'Sin Familia'))].sort();
  }, [enrichedData, familiasMap]);

  const uniqueActivities = useMemo(() => [...new Set(enrichedData.map(item => item.actividadSimple))].sort(), [enrichedData]);
  const uniqueEstados = useMemo(() => [...new Set(enrichedData.map(item => item.estado ? item.estado.trim() : null).filter(Boolean))].sort(), [enrichedData]);

  // Filtrado final
  useEffect(() => {
    let result = enrichedData;
    if (filterFamilia !== 'Todas') result = result.filter(item => item.familia === filterFamilia);
    if (filterTurno !== 'Todos') result = result.filter(item => item.turno === filterTurno);
    if (filterEstado !== 'Todos') result = result.filter(item => item.estado && item.estado.trim() === filterEstado);
    if (filterTipoOferta !== 'Todos') result = result.filter(item => item.tipoOferta === filterTipoOferta);
    if (filterActividad !== 'Todas') result = result.filter(item => item.actividadSimple === filterActividad);
    if (filterDocente !== 'Todos') result = result.filter(item => item.docente === filterDocente);
    if (filterPropuesta !== 'Todas') result = result.filter(item => item.propuesta === filterPropuesta);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => (item.alumno && item.alumno.toLowerCase().includes(term)) || (item.dni && item.dni.includes(term)));
    }
    setFilteredData(result);
  }, [enrichedData, filterFamilia, filterTurno, filterEstado, filterActividad, filterTipoOferta, filterDocente, filterPropuesta, searchTerm]);

  // --- Controladores ---
  const handleManualUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => processCSV(e.target.result, false, true, file.name); 
      reader.readAsText(file);
    }
  };

  const handleMatrizUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultCount = processMatrizCSV(e.target.result, true);
        alert(`Se han cargado y guardado ${resultCount} registros de la Matriz con éxito.`);
      };
      reader.readAsText(file);
    }
  };

  const handleClearFilters = () => {
    setFilterFamilia('Todas');
    setFilterTurno('Todos');
    setFilterTipoOferta('Todos');
    setFilterEstado('Todos');
    setFilterActividad('Todas');
    setFilterDocente('Todos');
    setFilterPropuesta('Todas');
    setSearchTerm('');
  };

  const hasActiveFilters = 
    filterFamilia !== 'Todas' ||
    filterTurno !== 'Todos' || 
    filterTipoOferta !== 'Todos' || 
    filterEstado !== 'Todos' || 
    filterActividad !== 'Todas' || 
    filterDocente !== 'Todos' || 
    filterPropuesta !== 'Todas' || 
    searchTerm !== '';

  const clearStorage = () => {
    if (window.confirm("¿Estás seguro de borrar todos los datos locales para volver al estado de fábrica?")) {
      localStorage.removeItem('dashboard_data');
      localStorage.removeItem('dashboard_filename');
      localStorage.removeItem('dashboard_last_update');
      localStorage.removeItem('dashboard_docentes_map');
      localStorage.removeItem('dashboard_propuestas_map');
      localStorage.removeItem('dashboard_familias_map');
      localStorage.removeItem('dashboard_modulos_iniciales');
      setDocentesMap({}); 
      setPropuestasMap({});
      setFamiliasMap({});
      setModulosInicialesSet([]);
      if (getDefaultMatriz().trim() !== '') {
        processMatrizCSV(getDefaultMatriz(), false);
      }
      loadData(); 
    }
  };

  const formatDateTime = (dateObj) => {
    if (!dateObj) return '';
    return dateObj.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // --- FUNCIÓN DE DESCARGA CSV ---
  const handleDownloadCSV = () => {
    const headers = ['Alumno', 'DNI', 'Turno', 'Teléfono', 'Mail', 'Estado', 'Familia', 'Propuesta', 'Actividad', 'Docente'];
    
    const csvContent = [
      headers.join(';'),
      ...filteredData.map(row => [
        `"${row.alumno || ''}"`, 
        `"${row.dni || ''}"`, 
        `"${row.turno || ''}"`, 
        `"${row.telefono || ''}"`, 
        `"${row.email || ''}"`, 
        `"${row.estado || ''}"`,
        `"${row.familia || ''}"`,
        `"${row.propuesta || ''}"`,
        `"${row.actividad || ''}"`, 
        `"${row.docente || ''}"`
      ].join(';'))
    ].join('\n');
    
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `alumnos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, value }) => {
    const RADIAN = Math.PI / 180;
    const x = cx + (outerRadius + 15) * Math.cos(-midAngle * RADIAN);
    const y = cy + (outerRadius + 15) * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#475569" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11" fontWeight="600">
        {`${value} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  const stats = useMemo(() => {
    let totalIniciales = 0;
    const porTurno = { TM: 0, TT: 0, TN: 0, Desconocido: 0 };
    const porEstado = { Aceptada: 0, Pendiente: 0, Rechazada: 0 };
    const porGenero = { Femenino: 0, Masculino: 0, Desconocido: 0 };
    const porActividad = {};
    const porPropuesta = {};
    const porActividadInicial = {};

    filteredData.forEach(item => {
      if (porTurno[item.turno] !== undefined) porTurno[item.turno]++; else porTurno.Desconocido++;
      const estado = item.estado ? item.estado.trim() : 'Desconocido';
      if (porEstado[estado] !== undefined) porEstado[estado]++;
      if (porGenero[item.genero] !== undefined) porGenero[item.genero]++; else porGenero.Desconocido++;
      
      const act = item.actividadSimple;
      if (!porActividad[act]) {
        porActividad[act] = {
          count: 0,
          propuesta: item.propuesta || 'Sin Propuesta'
        };
      }
      porActividad[act].count++;

      if (item.propuesta && item.propuesta !== 'Sin Propuesta') {
        porPropuesta[item.propuesta] = (porPropuesta[item.propuesta] || 0) + 1;
      }

      // Lógica para Actividades Iniciales, Cap. Laborales y Cursos
      const isCapOrCurso = item.tipoOferta === 'Capacitación Laboral' || item.tipoOferta === 'Curso';
      const actClean = cleanActivityName(item.actividad);
      
      // Chequeo usando el Set normalizado
      const isTrayectoInicial = item.tipoOferta === 'Trayecto' && modulosInicialesSet.some(mi => {
         return actClean === mi || 
               (actClean.length > 15 && mi.length > 15 && (actClean.substring(0, 15) === mi.substring(0, 15)));
      });

      if (isCapOrCurso || isTrayectoInicial) {
         porActividadInicial[act] = (porActividadInicial[act] || 0) + 1;
         totalIniciales++;
      }
    });

    return { 
      total: filteredData.length, 
      totalIniciales,
      porTurno, porEstado, porGenero, 
      chartDataTurno: [
        { name: 'Mañana', value: porTurno.TM, key: 'TM' }, 
        { name: 'Tarde', value: porTurno.TT, key: 'TT' }, 
        { name: 'Noche', value: porTurno.TN, key: 'TN' }
      ].filter(d => d.value > 0),
      chartDataEstado: [
        { name: 'Aceptada', value: porEstado.Aceptada, color: COLORS.Aceptada }, 
        { name: 'Pendiente', value: porEstado.Pendiente, color: COLORS.Pendiente }, 
        { name: 'Rechazada', value: porEstado.Rechazada, color: COLORS.Rechazada }
      ].filter(d => d.value > 0),
      chartDataGenero: [
        { name: 'Femenino', value: porGenero.Femenino, key: 'Femenino' }, 
        { name: 'Masculino', value: porGenero.Masculino, key: 'Masculino' }
      ].filter(d => d.value > 0),
      chartDataActividad: Object.keys(porActividad).map(key => ({ 
        name: key.length > 35 ? key.substring(0, 35) + '...' : key, 
        fullName: key, 
        value: porActividad[key].count,
        propuesta: porActividad[key].propuesta
      })).sort((a, b) => b.value - a.value),
      chartDataPropuesta: Object.keys(porPropuesta).map(key => ({ 
        name: key.length > 35 ? key.substring(0, 35) + '...' : key, 
        fullName: key, 
        value: porPropuesta[key] 
      })).sort((a, b) => b.value - a.value),
      chartDataIniciales: Object.keys(porActividadInicial).map(key => ({
        name: key.length > 35 ? key.substring(0, 35) + '...' : key, 
        fullName: key, 
        value: porActividadInicial[key] 
      })).sort((a, b) => b.value - a.value)
    };
  }, [filteredData, modulosInicialesSet]);

  const fullChartHeight = Math.max(400, stats.chartDataActividad.length * 40);
  const fullPropChartHeight = Math.max(400, stats.chartDataPropuesta.length * 40);
  const fullInicialesChartHeight = Math.max(400, stats.chartDataIniciales.length * 40);

  const activeFiltersLabels = [];
  if (filterFamilia !== 'Todas') activeFiltersLabels.push(`Familia: ${filterFamilia}`);
  if (filterTurno !== 'Todos') activeFiltersLabels.push(`Turno: ${filterTurno}`);
  if (filterPropuesta !== 'Todas') activeFiltersLabels.push(`Propuesta: ${filterPropuesta}`);
  if (filterActividad !== 'Todas') activeFiltersLabels.push(`Actividad: ${filterActividad}`);
  if (filterDocente !== 'Todos') activeFiltersLabels.push(`Docente: ${filterDocente}`);
  if (filterEstado !== 'Todos') activeFiltersLabels.push(`Estado: ${filterEstado}`);
  if (filterTipoOferta !== 'Todos') activeFiltersLabels.push(`Oferta: ${filterTipoOferta}`);

  // Paleta de colores temáticos para los chips de familias profesionales
  const getFamilyColor = (familia) => {
    const textStr = familia.toLowerCase();
    if (textStr.includes('estética')) return 'bg-pink-100 text-pink-700 border-pink-300 ring-pink-400 hover:bg-pink-200 hover:border-pink-400';
    if (textStr.includes('mecánica') || textStr.includes('motor')) return 'bg-orange-100 text-orange-700 border-orange-300 ring-orange-400 hover:bg-orange-200 hover:border-orange-400';
    if (textStr.includes('informática') || textStr.includes('dato') || textStr.includes('program')) return 'bg-cyan-100 text-cyan-700 border-cyan-300 ring-cyan-400 hover:bg-cyan-200 hover:border-cyan-400';
    if (textStr.includes('energía') || textStr.includes('electri')) return 'bg-amber-100 text-amber-700 border-amber-300 ring-amber-400 hover:bg-amber-200 hover:border-amber-400';
    if (textStr.includes('administración') || textStr.includes('contable') || textStr.includes('sueldo')) return 'bg-emerald-100 text-emerald-700 border-emerald-300 ring-emerald-400 hover:bg-emerald-200 hover:border-emerald-400';
    if (textStr.includes('carpintería') || textStr.includes('mueble') || textStr.includes('madera')) return 'bg-amber-700 text-white border-amber-800 ring-amber-900 hover:bg-amber-800 hover:border-amber-900';
    if (textStr.includes('fotograf') || textStr.includes('imagen')) return 'bg-purple-100 text-purple-700 border-purple-300 ring-purple-400 hover:bg-purple-200 hover:border-purple-400';
    
    return 'bg-blue-100 text-blue-700 border-blue-300 ring-blue-400 hover:bg-blue-200 hover:border-blue-400';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8 print:bg-white print:p-0">
      
      {/* Header General */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600 print:hidden" />
            <span><span className="text-blue-600 print:text-black">CFP N°1 -</span> Inscripciones 2°C - 2026</span>
          </h1>
          <div className="text-slate-500 mt-2 print:hidden flex items-center gap-3 flex-wrap">
            <span>Análisis Demográfico y de Ofertas</span>
            {lastUpdateDate && (
              <>
                <span className="text-slate-300 hidden md:inline">|</span>
                <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-1 rounded shadow-sm">
                  {dataSource === 'cloud' ? 'Sincronizado:' : 'Cargado:'} {formatDateTime(lastUpdateDate)}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap print:hidden">
          {DATA_SOURCE_URL && (
            <button onClick={loadData} disabled={isLoading} className="flex items-center gap-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition" title="Recargar">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

           {(dataSource === 'local' || Object.keys(docentesMap).length > 0) && (
             <button onClick={clearStorage} className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium">
               <Trash2 className="w-4 h-4" /> Borrar Caché
             </button>
           )}
           
           <label className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-200 transition shadow-sm text-sm font-medium" title="Sube aquí la nueva Matriz">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Act. Matriz</span>
            <input type="file" accept=".csv,.txt" onChange={handleMatrizUpload} className="hidden" />
          </label>

           <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition shadow-md text-sm font-medium">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Cargar Alumnos</span>
            <input type="file" accept=".csv,.txt" onChange={handleManualUpload} className="hidden" />
          </label>
        </div>
      </div>

      {isLoading ? (
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-center gap-3 animate-pulse">
           <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
           <span className="text-blue-800 font-medium">Descargando datos...</span>
         </div>
      ) : fetchError && (
         <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-orange-800 print:hidden">
            <AlertTriangle className="w-4 h-4" /> {fetchError}
         </div>
      )}

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8 print:grid-cols-7 print:gap-2">
        <Card className="p-4 border-l-4 border-slate-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-full text-slate-600 print:hidden"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Inscriptos</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-l-4 border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-full text-emerald-600 print:hidden"><Target className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] leading-tight text-slate-500 font-medium">Insc. Módulos<br/>Iniciales</p>
              <p className="text-xl font-bold">{stats.totalIniciales}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-pink-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 rounded-full text-pink-600 print:hidden"><UserCheck className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Mujeres (Est.)</p>
              <p className="text-xl font-bold">{stats.porGenero.Femenino}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-full text-blue-600 print:hidden"><UserCheck className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Hombres (Est.)</p>
              <p className="text-xl font-bold">{stats.porGenero.Masculino}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-full text-amber-600 print:hidden"><Sun className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Turno Mañana</p>
              <p className="text-xl font-bold">{stats.porTurno.TM}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-full text-orange-600 print:hidden"><Sunset className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Turno Tarde</p>
              <p className="text-xl font-bold">{stats.porTurno.TT}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-full text-indigo-600 print:hidden"><Moon className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Turno Noche</p>
              <p className="text-xl font-bold">{stats.porTurno.TN}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="print:hidden">

        {/* ========================================================= */}
        {/* SECCIÓN DE FILTROS RENOVADA (ARRIBA DE LOS GRÁFICOS) */}
        {/* ========================================================= */}
        <Card className="p-5 mb-8 sticky top-0 z-20 shadow-md bg-white/95 backdrop-blur-sm border-t-4 border-t-blue-500">
          
          {/* Fila 1: Buscador Principal (Más Relevante) y Acciones */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            
            <div className="relative flex-1 w-full md:max-w-2xl group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={`w-5 h-5 transition-colors ${searchTerm ? 'text-blue-600' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
              </div>
              <input 
                type="text" 
                placeholder="Buscar inscripto por nombre, apellido o DNI..." 
                className={`w-full pl-12 pr-10 py-3 border-2 rounded-xl text-base outline-none transition-all shadow-sm placeholder:text-slate-400
                  ${searchTerm 
                    ? 'bg-blue-50 border-blue-400 text-blue-900 focus:ring-4 focus:ring-blue-500/20' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                  }`} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-red-500 transition-colors"
                  title="Borrar búsqueda"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button 
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-sm font-bold transition-all shadow-sm whitespace-nowrap"
                title="Restaurar todos los filtros y búsqueda"
              >
                <Trash2 className="w-4 h-4" /> Limpiar Todo
              </button>
            )}
            
          </div>

          {/* Fila 2: Chips / Píldoras de Familias Profesionales */}
          <div className="w-full mt-4 border-t border-slate-100 pt-4">
             <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase">Filtrar por Familia Profesional</label>
             <div className="flex flex-wrap gap-2">
                <button 
                   onClick={() => setFilterFamilia('Todas')}
                   className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filterFamilia === 'Todas' ? 'bg-slate-800 text-white border-slate-900 shadow-md ring-1 ring-slate-900' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:border-slate-300'}`}
                >
                   Todas
                </button>
                {uniqueFamilias.map(fam => {
                   const colorClasses = getFamilyColor(fam);
                   const isSelected = filterFamilia === fam;
                   return (
                      <button
                         key={fam}
                         onClick={() => setFilterFamilia(fam)}
                         className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                           isSelected 
                             ? `${colorClasses} ring-2 shadow-md transform scale-[1.02]` 
                             : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                         }`}
                      >
                         {fam}
                      </button>
                   );
                })}
             </div>
          </div>

          {/* Fila 3: Selectores Secundarios */}
          <div className="flex flex-col md:flex-row gap-3 items-center flex-wrap pt-4 mt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 shrink-0 mr-2">
              <Filter className="w-4 h-4" />
              <span className="font-bold text-sm uppercase tracking-wider">Filtros Avanzados:</span>
            </div>
            
            <select value={filterTipoOferta} onChange={(e) => setFilterTipoOferta(e.target.value)} className={`px-3 py-2 border rounded-lg text-sm outline-none transition-colors cursor-pointer ${filterTipoOferta !== 'Todos' ? 'bg-purple-50 border-purple-300 text-purple-800 font-medium' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
              <option value="Todos">Oferta: Todas</option><option value="Capacitación Laboral">Cap. Laboral</option><option value="Curso">Curso</option><option value="Trayecto">Trayecto</option>
            </select>
            
            <select value={filterTurno} onChange={(e) => setFilterTurno(e.target.value)} className={`px-3 py-2 border rounded-lg text-sm outline-none transition-colors cursor-pointer ${filterTurno !== 'Todos' ? 'bg-amber-50 border-amber-300 text-amber-800 font-medium' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
              <option value="Todos">Turno: Todos</option><option value="TM">Mañana</option><option value="TT">Tarde</option><option value="TN">Noche</option>
            </select>
            
            <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className={`px-3 py-2 border rounded-lg text-sm outline-none transition-colors cursor-pointer ${filterEstado !== 'Todos' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
              <option value="Todos">Estado: Todos</option>
              {uniqueEstados.map(est => <option key={est} value={est}>{est}</option>)}
            </select>
            
            <select value={filterActividad} onChange={(e) => setFilterActividad(e.target.value)} className={`px-3 py-2 border rounded-lg text-sm outline-none transition-colors cursor-pointer max-w-[150px] md:max-w-[200px] truncate ${filterActividad !== 'Todas' ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-medium' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
              <option value="Todas">Actividad: Todas</option>
              {uniqueActivities.map(act => <option key={act} value={act}>{act}</option>)}
            </select>

            <select value={filterDocente} onChange={(e) => setFilterDocente(e.target.value)} className={`px-3 py-2 border rounded-lg text-sm outline-none transition-colors cursor-pointer max-w-[150px] md:max-w-[200px] truncate ${filterDocente !== 'Todos' ? 'bg-cyan-50 border-cyan-300 text-cyan-800 font-medium' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
              <option value="Todos">Docente: Todos</option>
              {uniqueDocentes.map(doc => <option key={doc} value={doc}>{doc}</option>)}
              <option value="Sin Asignar">Sin Asignar</option>
            </select>

            <select value={filterPropuesta} onChange={(e) => setFilterPropuesta(e.target.value)} className={`px-3 py-2 border rounded-lg text-sm outline-none transition-colors cursor-pointer max-w-[150px] md:max-w-[200px] truncate ${filterPropuesta !== 'Todas' ? 'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-800 font-medium' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
              <option value="Todas">Propuesta: Todas</option>
              {uniquePropuestas.map(prop => <option key={prop} value={prop}>{prop}</option>)}
              <option value="Sin Propuesta">Sin Propuesta</option>
            </select>
            
          </div>
        </Card>

        {/* Gráficos de Torta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-4 flex flex-col items-center">
            <h3 className="font-bold text-slate-700 mb-2 w-full text-center border-b pb-2">Distribución por Género</h3>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.chartDataGenero} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" label={renderCustomLabel}>
                    {stats.chartDataGenero.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.key] || COLORS.Unknown} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} inscriptos`, name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 flex flex-col items-center">
            <h3 className="font-bold text-slate-700 mb-2 w-full text-center border-b pb-2">Distribución por Turno</h3>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.chartDataTurno} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={renderCustomLabel}>
                    {stats.chartDataTurno.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.key] || COLORS.Unknown} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} inscriptos`, name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 flex flex-col items-center">
            <h3 className="font-bold text-slate-700 mb-2 w-full text-center border-b pb-2">Estado de Inscripciones</h3>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.chartDataEstado} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={renderCustomLabel}>
                    {stats.chartDataEstado.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} inscriptos`, name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>


        {/* Tablas de Ranking (2 Columnas) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <Card className="p-4 border-t-4 border-t-blue-400">
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2">
               <BookOpen className="w-5 h-5 text-blue-500" />
               Top 5 Actividades Más Demandadas
            </h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b uppercase text-xs">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Actividad</th>
                    <th className="p-3 text-right w-32">Inscriptos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {}
                  {stats.chartDataActividad.slice(0, 5).map((act, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="p-3 text-slate-700">
                        <div className="font-semibold" title={act.fullName}>{act.name}</div>
                        {act.propuesta && act.propuesta !== 'Sin Propuesta' && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                              {act.propuesta}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <span className="inline-block bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-bold">
                          {act.value}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.chartDataActividad.length === 0 && (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-slate-400">
                        No hay datos de actividades para mostrar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4 border-t-4 border-t-fuchsia-400">
            <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2">
               <Award className="w-5 h-5 text-fuchsia-500" />
               Top 5 Propuestas Más Demandadas
            </h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-fuchsia-50 text-fuchsia-600 border-b border-fuchsia-100 uppercase text-xs">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Propuesta Formativa</th>
                    <th className="p-3 text-right w-32">Inscriptos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fuchsia-50">
                  {stats.chartDataPropuesta.slice(0, 5).map((prop, index) => (
                    <tr key={index} className="hover:bg-fuchsia-50/50 transition-colors">
                      <td className="p-3 text-center font-bold text-fuchsia-300">{index + 1}</td>
                      <td className="p-3 font-semibold text-slate-800" title={prop.fullName}>{prop.name}</td>
                      <td className="p-3 text-right">
                        <span className="inline-block bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200 py-1 px-3 rounded-full font-bold">
                          {prop.value}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.chartDataPropuesta.length === 0 && (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-slate-400">
                        Cargue el archivo Matriz para ver las propuestas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Botones para alternar Gráficos Completos */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
          <button 
            onClick={() => setShowFullActChart(!showFullActChart)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${showFullActChart ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'}`}
          >
            <BarChartIcon className="w-5 h-5" />
            {showFullActChart ? 'Ocultar Gráfico de Actividades' : 'Ver Distribución Completa por Actividad'}
          </button>

          <button 
            onClick={() => setShowFullPropChart(!showFullPropChart)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${showFullPropChart ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200 border border-fuchsia-200'}`}
          >
            <Award className="w-5 h-5" />
            {showFullPropChart ? 'Ocultar Gráfico de Propuestas' : 'Ver Distribución Completa por Propuestas'}
          </button>

          <button 
            onClick={() => setShowFullInicialesChart(!showFullInicialesChart)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${showFullInicialesChart ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'}`}
          >
            <Target className="w-5 h-5" />
            {showFullInicialesChart ? 'Ocultar Actividades Iniciales' : 'Ver Distribución Actividades Iniciales'}
          </button>
        </div>
      </div>

      {/* Gráfico Completo de Actividades */}
      {showFullActChart && (
        <Card className="p-4 mb-8 print:hidden animate-in fade-in zoom-in duration-300">
          <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-blue-600" />
            Distribución Completa de Inscriptos por Actividad
          </h3>
          <div className="w-full overflow-hidden" style={{ height: fullChartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartDataActividad} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={220} tick={{fontSize: 12, fill: '#475569'}} />
                {}
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl max-w-sm">
                          <p className="font-bold text-slate-800 text-sm mb-1">{data.fullName}</p>
                          {data.propuesta && data.propuesta !== 'Sin Propuesta' && (
                            <p className="text-xs text-indigo-600 font-semibold mb-1.5 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                              Propuesta: {data.propuesta}
                            </p>
                          )}
                          <p className="text-blue-600 font-semibold text-sm">Total Inscriptos: {data.value}</p>
                        </div>
                      );
                    } return null;
                  }} 
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24}>
                  {stats.chartDataActividad.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#60A5FA'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Gráfico Completo de Propuestas */}
      {showFullPropChart && (
        <Card className="p-4 mb-8 print:hidden animate-in fade-in zoom-in duration-300">
          <h3 className="font-bold text-slate-700 mb-4 border-b pb-2 flex items-center gap-2">
            <Award className="w-5 h-5 text-fuchsia-600" />
            Distribución Completa de Inscriptos por Propuesta
          </h3>
          <div className="w-full overflow-hidden" style={{ height: fullPropChartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartDataPropuesta} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={220} tick={{fontSize: 12, fill: '#475569'}} />
                <Tooltip 
                  cursor={{fill: '#fdf4ff'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl max-w-sm">
                          <p className="font-bold text-slate-800 text-sm mb-1">{data.fullName}</p>
                          <p className="text-fuchsia-600 font-semibold text-sm">Total Inscriptos: {data.value}</p>
                        </div>
                      );
                    } return null;
                  }} 
                />
                <Bar dataKey="value" fill="#d946ef" radius={[0, 4, 4, 0]} barSize={24}>
                  {stats.chartDataPropuesta.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#d946ef' : '#e879f9'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Gráfico de Actividades Iniciales */}
      {showFullInicialesChart && (
        <Card className="p-4 mb-8 print:hidden animate-in fade-in zoom-in duration-300 border-t-4 border-t-emerald-400">
          <h3 className="font-bold text-slate-700 mb-2 border-b pb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Distribución de Actividades Iniciales (Cursos, Cap. Laborales y Módulos Iniciales de Trayectos)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Información generada dinámicamente según archivo de Matriz.</p>
          <div className="w-full overflow-hidden" style={{ height: fullInicialesChartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartDataIniciales} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={220} tick={{fontSize: 12, fill: '#475569'}} />
                <Tooltip 
                  cursor={{fill: '#ecfdf5'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl max-w-sm">
                          <p className="font-bold text-slate-800 text-sm mb-1">{data.fullName}</p>
                          <p className="text-emerald-600 font-semibold text-sm">Total Inscriptos: {data.value}</p>
                        </div>
                      );
                    } return null;
                  }} 
                />
                <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24}>
                  {stats.chartDataIniciales.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10B981' : '#34D399'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Tabla Principal */}
      <Card className="overflow-hidden print:shadow-none print:border-none print:rounded-none">
        
        {/* ENCABEZADO DE TABLA PARA WEB Y PARA IMPRESIÓN */}
        <div className="p-4 border-b bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:bg-white print:border-none print:p-0 print:mb-4 w-full">
          
          <div className="flex flex-col gap-1 w-full">
            <h3 className="font-bold text-slate-700 text-lg print:text-2xl print:mb-1">
              Listado de Alumnos ({filteredData.length})
            </h3>
            
            {/* Etiquetas normales para la vista Web */}
            {activeFiltersLabels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1 print:hidden">
                {activeFiltersLabels.map(label => (
                  <span key={label} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-200 font-semibold shadow-sm">
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* SECCIÓN EXCLUSIVA PARA LA IMPRESIÓN */}
            <div className="hidden print:block text-sm text-black border-b-2 border-slate-800 pb-3 mt-2 w-full">
               <div className="grid grid-cols-1 gap-1.5 leading-relaxed">
                  <p><span className="font-bold">Familia Profesional:</span> {filterFamilia}</p>
                  <p><span className="font-bold">Propuesta Formativa:</span> {filterPropuesta}</p>
                  <p><span className="font-bold">Actividad:</span> {filterActividad}</p>
                  <p><span className="font-bold">Docente a cargo:</span> {filterDocente}</p>
                  
                  {/* Si hay otros filtros aplicados, mostrarlos sutilmente abajo */}
                  {(filterTurno !== 'Todos' || filterEstado !== 'Todos' || filterTipoOferta !== 'Todos') && (
                     <p className="mt-1 text-slate-600 text-xs italic">
                       Filtros adicionales: {[
                         filterTurno !== 'Todos' ? `Turno: ${filterTurno}` : null,
                         filterEstado !== 'Todos' ? `Estado: ${filterEstado}` : null,
                         filterTipoOferta !== 'Todos' ? `Oferta: ${filterTipoOferta}` : null
                       ].filter(Boolean).join(' | ')}
                     </p>
                  )}
               </div>
            </div>

          </div>

          <div className="flex gap-2 print:hidden shrink-0">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition shadow-sm border border-slate-200">
              <Printer className="w-4 h-4" /> Imprimir Listado
            </button>
            <button onClick={handleDownloadCSV} className="flex items-center gap-2 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-md text-sm font-medium transition shadow-sm border border-green-200">
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>

        </div>

        {/* CONTENIDO DE LA TABLA */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm print:text-[11px]">
            <thead className="bg-slate-100 uppercase text-xs print:bg-white print:border-b-2 print:border-black">
              <tr>
                <th className="p-4 print:py-2 print:px-1">Alumno</th>
                <th className="p-4 print:py-2 print:px-1">DNI</th>
                <th className="p-4 print:py-2 print:px-1">Familia Prof.</th>
                <th className="p-4 print:py-2 print:px-1">Turno</th>
                <th className="p-4 print:py-2 print:px-1">Teléfono</th>
                <th className="p-4 print:py-2 print:px-1">Mail</th>
                <th className="p-4 print:py-2 print:px-1">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-300">
              {filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 print:hover:bg-transparent">
                  <td className="p-4 font-medium print:py-2 print:px-1">{row.alumno}</td>
                  <td className="p-4 text-slate-500 print:text-black print:py-2 print:px-1">{row.dni}</td>
                  <td className="p-4 print:py-2 print:px-1 text-slate-500 font-semibold text-xs">{row.familia}</td>
                  <td className="p-4 print:py-2 print:px-1"><Badge type={row.turno}>{row.turno}</Badge></td>
                  <td className="p-4 text-slate-500 print:text-black print:py-2 print:px-1">{row.telefono}</td>
                  <td className="p-4 text-slate-500 print:text-black print:py-2 print:px-1">{row.email}</td>
                  <td className="p-4 print:py-2 print:px-1"><Badge type={row.estado}>{row.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center p-8 text-slate-500">No hay alumnos que coincidan con estos filtros.</div>
          )}
        </div>
      </Card>
      
      <div className="mt-4 text-center text-xs text-slate-400 print:hidden">Sistema v1.21 - Matriz Unificada con Filtro de Familia</div>
    </div>
  );
}
