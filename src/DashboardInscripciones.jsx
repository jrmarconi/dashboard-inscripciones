import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Upload, Users, Filter, Search, 
  UserCheck, Trash2, Download, Printer, RefreshCw, AlertTriangle,
  Sun, Moon, Sunset, BookOpen, Award, X, BarChart as BarChartIcon
} from 'lucide-react';

// ==============================================================================
// CONFIGURACIÓN DE ORIGEN DE DATOS
// ==============================================================================
const DATA_SOURCE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-4w1Lcx6FefPFWYVxlU_pMxGx5j_r4xENfPmhuiL2Y6qLRggLixxcHFudlXl4BZlBrELxln97B7Hu/pub?gid=1856440278&single=true&output=csv"; 

// ==============================================================================
// BASE DE DOCENTES PREDEFINIDA (Reemplazar con el contenido de tu CSV real)
// ==============================================================================
const DEFAULT_DOCENTES_CSV = `ApellidoDocente;Nombres;dni;Actividad;Comisión;Modalidad;Propuesta
ALVAREZ FERNANDEZ;RICARDO JOSE;17708098;(TR_16_ME_1)Montaje de Líneas y Circuitos Eléctricos de Muy Baja Tensión;CFP N° 1 - Río Cuarto - 1993 - 02-TM;Presencial;Electricista en Inmuebles
ALVAREZ FERNANDEZ;RICARDO JOSE;17708098;(TR_16_ME_2)Instalaciones Eléctricas en Inmuebles;CFP N° 1 - Río Cuarto - 1993 - 02-TM;Presencial;Electricista en Inmuebles
ALVAREZ FERNANDEZ;RICARDO JOSE;17708098;(TR_16_ME_3)Proyecto de Instalaciones Eléctricas;CFP N° 1 - Río Cuarto - 1993 - 02-TM;Presencial;Electricista en Inmuebles
ALVAREZ FERNANDEZ;RICARDO JOSE;17708098;(TR_EEL_MC_1)Circuitos Eléctricos y Mediciones;CFP N° 1 - Río Cuarto - 1993 - 08-TM;Presencial;Montador/a electricista domiciliario
ALVAREZ FERNANDEZ;RICARDO JOSE;17708098;(TR_EEL_MC_3)Representación Gráfica;CFP N° 1 - Río Cuarto - 1993 - 08-TM;Presencial;Electricista en Inmuebles
ALVAREZ FERNANDEZ;RICARDO JOSE;17708098;(TR_EEL_ME_1)Montaje de Canalizaciones y Tableros Eléctricos;CFP N° 1 - Río Cuarto - 1993 - 08-TM;Presencial;Montador/a electricista domiciliario
ALVAREZ FERNANDEZ;RICARDO JOSE;17708098;(TR_EEL_ME_2)Montaje de Líneas y Circuitos Eléctricos de Baja Tensión;CFP N° 1 - Río Cuarto - 1993 - 08-TM;Presencial;Montador/a electricista domiciliario
ALVES DA SILVA;JOHANNA;31407295;(TR_40_ME_1)Peinado;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;Peluquero/a
ALVES DA SILVA;JOHANNA;31407295;(TR_40_ME_2)Corte;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;Peluquero/a
ALVES DA SILVA;JOHANNA;31407295;(TR_EST_MC_1)Piel y Anexos Cutáneos;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;Peluquero/a
BRAMUGLIA;JAVIER LEONARDO;21155317;(CT_0908)MANTENIMIENTO Y REPARACIÓN DE AIRE ACONDICIONADO DEL AUTOMOTOR;CFP N° 1 - Río Cuarto - 1993 - 02-TN;Presencial;MANTENIMIENTO Y REPARACIÓN DE AIRE ACOND DEL AUTO
BRAMUGLIA;JAVIER LEONARDO;21155317;(CT_0939)MECÁNICA LIGERA DEL AUTOMOTOR;CFP N° 1 - Río Cuarto - 1993 - 03-TN;Presencial;MECÁNICA LIGERA DEL AUTOMOTOR
CAMPODONICO;CARLOS ESTEBAN;32531805;(TR_16_ME_1)Montaje de Líneas y Circuitos Eléctricos de Muy Baja Tensión;CFP N° 1 - Río Cuarto - 1993 - 04-TT;Presencial;Electricista en Inmuebles
CAMPODONICO;CARLOS ESTEBAN;32531805;(TR_16_ME_2)Instalaciones Eléctricas en Inmuebles;CFP N° 1 - Río Cuarto - 1993 - 04-TT;Presencial;Electricista en Inmuebles
CAMPODONICO;CARLOS ESTEBAN;32531805;(TR_16_ME_3)Proyecto de Instalaciones Eléctricas;CFP N° 1 - Río Cuarto - 1993 - 04-TT;Presencial;Electricista en Inmuebles
CASTRO;LUCAS EZEQUIEL;36807489;(TR_INF_MC_2)Organización del computador;CFP N° 1 - Río Cuarto - 1993 - 01-TN;Presencial;Instalador y soporte de sistemas informáticos
CELASCO;JUAN CARLOS;24817160;(TR_40_ME_1)Peinado;CFP N° 1 - Río Cuarto - 1993 - 02-TT;Presencial;Peluquero/a
CELASCO;JUAN CARLOS;24817160;(TR_40_ME_1)Peinado;CFP N° 1 - Río Cuarto - 1993 - 03-TN;Presencial;Peluquero/a
CELASCO;JUAN CARLOS;24817160;(TR_40_ME_2)Corte;CFP N° 1 - Río Cuarto - 1993 - 02-TT;Presencial;Peluquero/a
CELASCO;JUAN CARLOS;24817160;(TR_40_ME_2)Corte;CFP N° 1 - Río Cuarto - 1993 - 03-TN;Presencial;Peluquero/a
CELASCO;JUAN CARLOS;24817160;(TR_EST_MC_1)Piel y Anexos Cutáneos;CFP N° 1 - Río Cuarto - 1993 - 02-TT;Presencial;Peluquero/a
CELASCO;JUAN CARLOS;24817160;(TR_EST_MC_1)Piel y Anexos Cutáneos;CFP N° 1 - Río Cuarto - 1993 - 03-TN;Presencial;Peluquero/a
CONTERNO;NESTOR EDUARDO;23815939;(CL_1699)Carpintero/a básico de muebles de melamina;CFP N° 1 - Río Cuarto - 1993 - 01-TT;Presencial;Carpintero/a Básico de Muebles de Melamina
CONTERNO;NESTOR EDUARDO;23815939;(CL_1699)Carpintero/a básico de muebles de melamina;CFP N° 1 - Río Cuarto - 1993 - 02-TN;Presencial;Carpintero/a Básico de Muebles de Melamina
COSTA;CINTIA LORENA;24930070;(TR_EST_MC_3)Relaciones laborales y orientación profesional;CFP N° 1 - Río Cuarto - 1993 - 02-TT-Presencial/Híbrida;Presencial/Híbrida/Presencial;Maquillador/a profesional
COSTA;CINTIA LORENA;24930070;(TR_EST_MC_3)Relaciones laborales y orientación profesional;CFP N° 1 - Río Cuarto - 1993 - 02-TT-Presencial/Híbrida;Presencial/Híbrida/Presencial;Peluquero/a
COSTA;CINTIA LORENA;24930070;(TR_MYA_MC_3)Gestión y/o atención clientes externos;CFP N° 1 - Río Cuarto - 1993 - 06-TT;Presencial/Híbrida;Mecánico/a de Motos
COSTA;CINTIA LORENA;24930070;(TR_MYA_MC_4)Gestión de servicio;CFP N° 1 - Río Cuarto - 1993 - 04-TM;Presencial/Híbrida;Mec. Sistemas de encendido y alimentación (2026)
COSTA;CINTIA LORENA;24930070;(TR_MYA_MC_4)Gestión de servicio;CFP N° 1 - Río Cuarto - 1993 - 12-TT;Presencial/Híbrida;Mecánico/a de Motos
COSTA;CINTIA LORENA;24930070;(TR_MYA_MC_5)Relaciones Laborales y Orientación profesional;CFP N° 1 - Río Cuarto - 1993 - 01-TM-Presencial/Híbrida;Presencial/Híbrida;Mecánico/a de Bicicletas
COSTA;CINTIA LORENA;24930070;(TR_MYA_MC_5)Relaciones Laborales y Orientación profesional;CFP N° 1 - Río Cuarto - 1993 - 01-TM-Presencial/Híbrida;Presencial/Híbrida;Mecánico/a de Motos
COSTA;CINTIA LORENA;24930070;(TR_MYA_MC_7)Gestión de servicio y atención al cliente;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial/Híbrida;Mecánico/a de Bicicletas
COSTA;SOFIA;37370272;(TR_39_ME_1)Maquillaje Social;CFP N° 1 - Río Cuarto - 1993 - 04-TT;Presencial;Maquillador/a profesional
COSTA;SOFIA;37370272;(TR_EST_MC_1)Piel y Anexos Cutáneos;CFP N° 1 - Río Cuarto - 1993 - 04-TT;Presencial;Maquillador/a profesional
COSTA;SOFIA;37370272;(TR_EST_MC_2)Gestión del proceso de trabajo en estética profesional;CFP N° 1 - Río Cuarto - 1993 - 04-TT;Presencial/Híbrida;Maquillador/a profesional
DE CARO FERREIRA;Cristian Nicolas;39468676;(CL_1436)Operador de Herramientas de Marketing Digital;CFP N° 1 - Río Cuarto - 1993 - 02-TN;Presencial;Operador/a de Herramientas de Marketing Digital
DE CARO FERREIRA;Cristian Nicolas;39468676;(CL_1640)Operador/a en Gestión y Procesamiento de Datos;CFP N° 1 - Río Cuarto - 1993 - 02-TN;Presencial;Operador/a en Gestión y Procesamiento de Datos
DE CARO FERREIRA;Cristian Nicolas;39468676;(TR_INF_MC_3)Tecnología de redes;CFP N° 1 - Río Cuarto - 1993 - 01-TN;Presencial;Instalador y soporte de sistemas informáticos
ECHAIDE;OMAR EDUARDO;24335948;(TR_EEL_MC_1)Circuitos Eléctricos y Mediciones;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;Montador/a electricista domiciliario
ECHAIDE;OMAR EDUARDO;24335948;(TR_EEL_MC_3)Representación Gráfica;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;Electricista en Inmuebles
ECHAIDE;OMAR EDUARDO;24335948;(TR_EEL_ME_1)Montaje de Canalizaciones y Tableros Eléctricos;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;Montador/a electricista domiciliario
ECHAIDE;OMAR EDUARDO;24335948;(TR_EEL_ME_2)Montaje de Líneas y Circuitos Eléctricos de Baja Tensión;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;Montador/a electricista domiciliario
FEDERICO;JUAN MARTIN;36930525;(TR_22_ME_2)Base de Datos;CFP N° 1 - Río Cuarto - 1993 - 01 -TM;Presencial/Híbrida;Programador
FEDERICO;JUAN MARTIN;36930525;(TR_INF_MC_4)Técnicas de Programación;CFP N° 1 - Río Cuarto - 1993 - 01 -TM;Presencial/Híbrida;Programador
FERNANDEZ;EMERIO MARTIN;18029824;(TR_11_ME_1)Función, Estructura y Sistema de Transmisión;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;Mecánico/a de Bicicletas
FERNANDEZ;EMERIO MARTIN;18029824;(TR_11_ME_1)Función, Estructura y Sistema de Transmisión;CFP N° 1 - Río Cuarto - 1993 - 02-TT;Presencial;Mecánico/a de Bicicletas
FERNANDEZ;EMERIO MARTIN;18029824;(TR_11_ME_1)Función, Estructura y Sistema de Transmisión;CFP N° 1 - Río Cuarto - 1993 - 03-TN;Presencial;Mecánico/a de Bicicletas
FERNANDEZ;EMERIO MARTIN;18029824;(TR_11_ME_2)Sistemas de Dirección Suspensión y Frenos;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;Mecánico/a de Bicicletas
FERNANDEZ;EMERIO MARTIN;18029824;(TR_11_ME_2)Sistemas de Dirección Suspensión y Frenos;CFP N° 1 - Río Cuarto - 1993 - 02-TT;Presencial;Mecánico/a de Bicicletas
FERNANDEZ;EMERIO MARTIN;18029824;(TR_11_ME_2)Sistemas de Dirección Suspensión y Frenos;CFP N° 1 - Río Cuarto - 1993 - 03-TN;Presencial;Mecánico/a de Bicicletas
FERNANDEZ;EMERIO MARTIN;18029824;(TR_11_ME_3)Sistema de Desplazamiento;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;Mecánico/a de Bicicletas
FERNANDEZ;EMERIO MARTIN;18029824;(TR_11_ME_3)Sistema de Desplazamiento;CFP N° 1 - Río Cuarto - 1993 - 02-TT;Presencial;Mecánico/a de Bicicletas
FERNANDEZ;EMERIO MARTIN;18029824;(TR_11_ME_3)Sistema de Desplazamiento;CFP N° 1 - Río Cuarto - 1993 - 03-TN;Presencial;Mecánico/a de Bicicletas
FERNANDEZ;EMERIO MARTIN;18029824;(TR_MYA_MC_7)Gestión de servicio y atención al cliente;CFP N° 1 - Río Cuarto - 1993 - 02-TT;Presencial/Híbrida;Mecánico/a de Bicicletas
FERNANDEZ;EMERIO MARTIN;18029824;(TR_MYA_MC_7)Gestión de servicio y atención al cliente;CFP N° 1 - Río Cuarto - 1993 - 03-TN;Presencial/Híbrida;Mecánico/a de Bicicletas
FERNANDEZ;VICTOR JAVIER;29636266;(TR_17_ME_1)Instalaciones eléctricas industriales;CFP N° 1 - Río Cuarto - 1993 - 07-TN;Presencial;Electricista Industrial
FERNANDEZ;VICTOR JAVIER;29636266;(TR_EEL_MC_4)Tecnología de control;CFP N° 1 - Río Cuarto - 1993 - 07-TN;Presencial;Electricista Industrial
FERNANDEZ;VICTOR JAVIER;29636266;(TR_EEL_ME_4)Instalación y mantenimiento de máquinas eléctricas;CFP N° 1 - Río Cuarto - 1993 - 07-TN;Presencial;Electricista Industrial
GIADANES;RUBEN DANIEL;23508297;(TR_MYA_ME_1)Sistema motor de combustión interna;CFP N° 1 - Río Cuarto - 1993 - 04-TM;Presencial;Auxiliar mecánico de motores de combustión interna
GUERETA;WALTER;17610424;(TR_07_ME_6)Sistema Motor y Transmisión;CFP N° 1 - Río Cuarto - 1993 - 06-TT;Presencial;Mecánico/a de Motos
GUERETA;WALTER;17610424;(TR_MYA_MC_1)Mediciones y Diagnósticos Eléctricos;CFP N° 1 - Río Cuarto - 1993 - 06-TT;Presencial;Mecánico/a de Motos
GUERETA;WALTER;17610424;(TR_MYA_MC_2)Mediciones y Diagnósticos Mecánicos;CFP N° 1 - Río Cuarto - 1993 - 06-TT;Presencial;Mecánico/a de Motos
IBARRA;CALISTO;24915373;(CT_0133)AUXILIAR CONTABLE;CFP N° 1 - Río Cuarto - 1993 - 01-TT;Presencial;AUXILIAR CONTABLE
IBARRA;CALISTO;24915373;(CT_0133)AUXILIAR CONTABLE;CFP N° 1 - Río Cuarto - 1993 - 02-TN;Presencial;AUXILIAR CONTABLE
IBARRA;CALISTO;24915373;(CT_0887)LIQUIDACIÓN DE SUELDOS Y JORNALES;CFP N° 1 - Río Cuarto - 1993 - 01-TN;Presencial;LIQUIDACIÓN DE SUELDOS Y JORNALES
INFANTINO;MARCELO A;21484603;(TR_MYA_MC_4)Gestión de servicio;CFP N° 1 - Río Cuarto - 1993 - 05-TN;Presencial/Híbrida;Mec. Sistemas de encendido y alimentación (2026)
INFANTINO;MARCELO A;21484603;(TR_MYA_ME_1)Sistema motor de combustión interna;CFP N° 1 - Río Cuarto - 1993 - 05-TN;Presencial;Auxiliar mecánico de motores de combustión interna
JEREZ MEDINA;MARCELO;31358862;(CT_0939)MECÁNICA LIGERA DEL AUTOMOTOR;CFP N° 1 - Río Cuarto - 1993 - 02-TT;Presencial;MECÁNICA LIGERA DEL AUTOMOTOR
JEREZ MEDINA;MARCELO;31358862;(TR_12_ME_2)Sistemas de Control;CFP N° 1 - Río Cuarto - 1993 - 08-TN;Presencial;Electricista de automotores
JEREZ MEDINA;MARCELO;31358862;(TR_MYA_MC_1)Mediciones y Diagnósticos Eléctricos;CFP N° 1 - Río Cuarto - 1993 - 08-TN;Presencial;Electricista de automotores
JEREZ MEDINA;MARCELO;31358862;(TR_MYA_MC_3)Gestión y/o atención clientes externos;CFP N° 1 - Río Cuarto - 1993 - 08-TN;Presencial/Híbrida;Electricista de automotores
LUTZ;FEDERICO ARIEL;27463794;(TR_16_ME_1)Montaje de Líneas y Circuitos Eléctricos de Muy Baja Tensión;CFP N° 1 - Río Cuarto - 1993 - 06-TN;Presencial;Electricista en Inmuebles
LUTZ;FEDERICO ARIEL;27463794;(TR_16_ME_2)Instalaciones Eléctricas en Inmuebles;CFP N° 1 - Río Cuarto - 1993 - 06-TN;Presencial;Electricista en Inmuebles
LUTZ;FEDERICO ARIEL;27463794;(TR_16_ME_3)Proyecto de Instalaciones Eléctricas;CFP N° 1 - Río Cuarto - 1993 - 06-TN;Presencial;Electricista en Inmuebles
MENDIETA;HUGO ANIBAL;21558916;(TR_EEL_MC_1)Circuitos Eléctricos y Mediciones;CFP N° 1 - Río Cuarto - 1993 - 03-TT;Presencial;Montador/a electricista domiciliario
MENDIETA;HUGO ANIBAL;21558916;(TR_EEL_MC_1)Circuitos Eléctricos y Mediciones;CFP N° 1 - Río Cuarto - 1993 - 05-TN;Presencial;Montador/a electricista domiciliario
MENDIETA;HUGO ANIBAL;21558916;(TR_EEL_MC_3)Representación Gráfica;CFP N° 1 - Río Cuarto - 1993 - 05-TN;Presencial;Electricista en Inmuebles
MENDIETA;HUGO ANIBAL;21558916;(TR_EEL_ME_1)Montaje de Canalizaciones y Tableros Eléctricos;CFP N° 1 - Río Cuarto - 1993 - 03-TT;Presencial;Montador/a electricista domiciliario
MENDIETA;HUGO ANIBAL;21558916;(TR_EEL_ME_1)Montaje de Canalizaciones y Tableros Eléctricos;CFP N° 1 - Río Cuarto - 1993 - 05-TN;Presencial;Montador/a electricista domiciliario
MENDIETA;HUGO ANIBAL;21558916;(TR_EEL_ME_2)Montaje de Líneas y Circuitos Eléctricos de Baja Tensión;CFP N° 1 - Río Cuarto - 1993 - 03-TT;Presencial;Montador/a electricista domiciliario
MENDIETA;HUGO ANIBAL;21558916;(TR_EEL_ME_2)Montaje de Líneas y Circuitos Eléctricos de Baja Tensión;CFP N° 1 - Río Cuarto - 1993 - 05-TN;Presencial;Montador/a electricista domiciliario
MORCILLO;GUSTAVO ERNESTO;18262416;(TR_EEL_MC_2)Relaciones Laborales y Orientación Profesional;CFP N° 1 - Río Cuarto - 1993 - 03-TT;Presencial/Híbrida;Montador/a electricista domiciliario
MORCILLO;GUSTAVO ERNESTO;18262416;(TR_MYA_MC_3)Gestión y/o atención clientes externos;CFP N° 1 - Río Cuarto - 1993 - 07-TN;Presencial/Híbrida;Mecánico/a de Motos
MORCILLO;GUSTAVO ERNESTO;18262416;(TR_MYA_MC_5)Relaciones Laborales y Orientación profesional;CFP N° 1 - Río Cuarto - 1993 - 04-TT-Presencial/Híbrida;Presencial/Híbrida;Auxiliar mecánico de motores de combustión interna
MORCILLO;GUSTAVO ERNESTO;18262416;(TR_MYA_MC_5)Relaciones Laborales y Orientación profesional;CFP N° 1 - Río Cuarto - 1993 - 04-TT-Presencial/Híbrida;Presencial/Híbrida;Electricista de automotores
MORCILLO;GUSTAVO ERNESTO;18262416;(TR_MYA_MC_5)Relaciones Laborales y Orientación profesional;CFP N° 1 - Río Cuarto - 1993 - 04-TT-Presencial/Híbrida;Presencial/Híbrida;Mecánico Sistemas de Suspensión y Dirección
PALACIOS;MARCELO ALEJANDRO;20685716;(CT_0908)MANTENIMIENTO Y REPARACIÓN DE AIRE ACONDICIONADO DEL AUTOMOTOR;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;MANTENIMIENTO Y REPARACIÓN DE AIRE ACOND DEL AUTO
PALACIOS;MARCELO ALEJANDRO;20685716;(CT_0939)MECÁNICA LIGERA DEL AUTOMOTOR;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;MECÁNICA LIGERA DEL AUTOMOTOR
PERALTA;LEONEL IGNACIO;36729276;(CL_1640)Operador/a en Gestión y Procesamiento de Datos;CFP N° 1 - Río Cuarto - 1993 - 01-TT;Presencial;Operador/a en Gestión y Procesamiento de Datos
PERALTA;LEONEL IGNACIO;36729276;(TR_EEL_MC_3)Representación Gráfica;CFP N° 1 - Río Cuarto - 1993 - 03-TT;Presencial;Electricista en Inmuebles
PERALTA;MARIA SANDRA;23085797;(CT_0548)ESTÉTICA FACIAL;CFP N° 1 - Río Cuarto - 1993 - 01-TM;Presencial;ESTÉTICA FACIAL
PERALTA;MARIA SANDRA;23085797;(CT_0548)ESTÉTICA FACIAL;CFP N° 1 - Río Cuarto - 1993 - 02-TM;Presencial;ESTÉTICA FACIAL
PICCOLO;DIEGO SEBASTIAN;20568524;(TR_05_ME_7)Sistema de Alimentación y Encendido;CFP N° 1 - Río Cuarto - 1993 - 11-TN;Presencial;Mecánico/a de Sistemas de encendido y alimentación
PICCOLO;DIEGO SEBASTIAN;20568524;(TR_MYA_MC_1)Mediciones y Diagnósticos Eléctricos;CFP N° 1 - Río Cuarto - 1993 - 11-TN;Presencial;Mecánico/a de Sistemas de encendido y alimentación
PICCOLO;DIEGO SEBASTIAN;20568524;(TR_MYA_MC_4)Gestión de servicio;CFP N° 1 - Río Cuarto - 1993 - 11-TN;Presencial/Híbrida;Mecánico/a de Sistemas de encendido y alimentación
RIVERO;JULIAN MATIAS;41559623;(TR_MYA_MC_1)Mediciones y Diagnósticos Eléctricos;CFP N° 1 - Río Cuarto - 1993 - 09-TN;Presencial;Mecánico Sistemas de Suspensión y Dirección
RIVERO;JULIAN MATIAS;41559623;(TR_MYA_MC_2)Mediciones y Diagnósticos Mecánicos;CFP N° 1 - Río Cuarto - 1993 - 09-TN;Presencial;Mecánico Sistemas de Suspensión y Dirección
RIVERO;JULIAN MATIAS;41559623;(TR_MYA_MC_3)Gestión y/o atención clientes externos;CFP N° 1 - Río Cuarto - 1993 - 09-TN;Presencial/Híbrida;Mecánico Sistemas de Suspensión y Dirección
RIVERO;JULIAN MATIAS;41559623;(TR_MYA_MC_6)Tren de tracción Delantero / Trasero;CFP N° 1 - Río Cuarto - 1993 - 09-TN;Presencial;Mecánico Sistemas de Suspensión y Dirección
ROJAS MARCONI;JORGE ENRIQUE;18769313;(CL_1436)Operador de Herramientas de Marketing Digital;CFP N° 1 - Río Cuarto - 1993 - 01-TT;Presencial;Operador/a de Herramientas de Marketing Digital
TRIPOLI;FERNANDO GUILLERMO;20427688;(TR_05_ME_7)Sistema de Alimentación y Encendido;CFP N° 1 - Río Cuarto - 1993 - 10-TM;Presencial;Mecánico/a de Sistemas de encendido y alimentación
TRIPOLI;FERNANDO GUILLERMO;20427688;(TR_07_ME_6)Sistema Motor y Transmisión;CFP N° 1 - Río Cuarto - 1993 - 07-TN;Presencial;Mecánico/a de Motos
TRIPOLI;FERNANDO GUILLERMO;20427688;(TR_07_ME_7)Sistema de Alimentación y Encendido;CFP N° 1 - Río Cuarto - 1993 - 12-TT;Presencial;Mecánico/a de Motos
TRIPOLI;FERNANDO GUILLERMO;20427688;(TR_07_ME_9)Suspensión, Dirección y Chasis;CFP N° 1 - Río Cuarto - 1993 - 12-TT;Presencial;Mecánico/a de Motos
TRIPOLI;FERNANDO GUILLERMO;20427688;(TR_MYA_MC_1)Mediciones y Diagnósticos Eléctricos;CFP N° 1 - Río Cuarto - 1993 - 07-TN;Presencial;Mecánico/a de Motos
TRIPOLI;FERNANDO GUILLERMO;20427688;(TR_MYA_MC_1)Mediciones y Diagnósticos Eléctricos;CFP N° 1 - Río Cuarto - 1993 - 10-TM;Presencial;Mecánico/a de Sistemas de encendido y alimentación
TRIPOLI;FERNANDO GUILLERMO;20427688;(TR_MYA_MC_2)Mediciones y Diagnósticos Mecánicos;CFP N° 1 - Río Cuarto - 1993 - 07-TN;Presencial;Mecánico/a de Motos
TRIPOLI;FERNANDO GUILLERMO;20427688;(TR_MYA_MC_4)Gestión de servicio;CFP N° 1 - Río Cuarto - 1993 - 10-TM;Presencial/Híbrida;Mecánico/a de Sistemas de encendido y alimentación
ULIBARRI;KARINA;25475562;(CT_0543)ESPECIALISTA EN TRATAMIENTOS ESTÉTICO CORPORALES;CFP N° 1 - Río Cuarto - 1993 - 01-TN;Presencial;ESPECIALISTA EN TRATAMIENTOS ESTÉTICO CORPORALES
ULIBARRI;KARINA;25475562;(CT_0547)ESTÉTICA CORPORAL;CFP N° 1 - Río Cuarto - 1993 - 01-TT;Presencial;ESTÉTICA CORPORAL
ULIBARRI;KARINA;25475562;(CT_0547)ESTÉTICA CORPORAL;CFP N° 1 - Río Cuarto - 1993 - 02-TN;Presencial;ESTÉTICA CORPORAL
`;
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

// --- Helper de Normalización para Cruce de Datos ---
const normalizeKey = (str) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '');
};

// Extrae SOLO el código entre paréntesis para hacer un match perfecto
const extractActivityCode = (act) => {
  if (!act) return '';
  const match = act.match(/\(([^)]+)\)/);
  if (match) return normalizeKey(match[1]);
  return normalizeKey(act);
};

const buildKey = (comision, actividad) => {
  return `${normalizeKey(comision)}|${extractActivityCode(actividad)}`;
};

// --- Lógica de Inferencia de Género (se mantiene para la gráfica) ---
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

// Datos de muestra principal
const SAMPLE_CSV = `Alumno,Identificación,Mail,Teléfono,Comisión,Estado Insc.,Actividad
"Aguirre Zanca, Karina Ana",DNI 24804039,karinaguirre75@gmail.com,1126549320,CFP N° 1 - Río Cuarto - 1993 - 01-TT,Pendiente,(CL_1436) Operador de Herramientas de Marketing Digital
"ALARCON VILLAMAYOR, OLGA LILIOSA",DNI 95625371,lili90villamayor@gmail.com,1128732605,CFP N° 1 - Río Cuarto - 1993 - 02-TN,Pendiente,(CL_1436) Operador de Herramientas de Marketing Digital
"ALVAREZ, MIRTA SUSANA",DNI 23454865,alvarezsusana549@gmail.com,01160370455,CFP N° 1 - Río Cuarto - 1993 - 02-TN,Aceptada,(CL_1436) Operador de Herramientas de Marketing Digital
"Andriani, Camila AGUSTINA",DNI 47127952,camilalovers339@gmail.com,541159781620,CFP N° 1 - Río Cuarto - 1993 - 01-TT,Aceptada,(CL_1436) Operador de Herramientas de Marketing Digital
"PIREZ, PABLO NAHUEL",DNI 47435248,nahuelpirez12@gmail.com,3584112233,CFP N° 1 - Río Cuarto - 1993 - 05-TN,Pendiente,(TR_MYA_ME_1) Sistema motor de combustión interna
"RAMOS, AGOSTINA CELESTE",DNI 47738200,agostinacr28@gmail.com,3585998877,CFP N° 1 - Río Cuarto - 1993 - 04-TM,Pendiente,(TR_MYA_ME_1) Sistema motor de combustión interna
"REYNAGA VALE, FRANCISCO",DNI 94056832,juanrenvion@gmail.com,358987654,CFP N° 1 - Río Cuarto - 1993 - 04-TM,Rechazada,(TR_MYA_ME_1) Sistema motor de combustión interna`;

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
    case 'Aceptada': classes += "bg-green-100 text-green-800"; break;
    case 'Rechazada': classes += "bg-red-100 text-red-800"; break;
    case 'Pendiente': classes += "bg-yellow-100 text-yellow-800"; break;
    case 'TM': classes += "bg-amber-100 text-amber-800 border border-amber-200"; break;
    case 'TT': classes += "bg-orange-100 text-orange-800 border border-orange-200"; break;
    case 'TN': classes += "bg-indigo-100 text-indigo-800 border border-indigo-200"; break;
    default: classes += "bg-gray-100 text-gray-800";
  }
  return <span className={classes}>{children}</span>;
};

export default function DashboardInscripciones() {
  const [rawData, setRawData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [docentesMap, setDocentesMap] = useState({}); 
  
  // Filtros
  const [filterTurno, setFilterTurno] = useState('Todos');
  const [filterActividad, setFilterActividad] = useState('Todas');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterTipoOferta, setFilterTipoOferta] = useState('Todos');
  const [filterDocente, setFilterDocente] = useState('Todos');
  const [filterPropuesta, setFilterPropuesta] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para visibilidad del gráfico completo de actividades
  const [showFullActChart, setShowFullActChart] = useState(false);

  const [dataSource, setDataSource] = useState('sample');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [lastUpdateDate, setLastUpdateDate] = useState(null);

  useEffect(() => {
    if (DEFAULT_DOCENTES_CSV.trim() !== '') {
      processDocentesCSV(DEFAULT_DOCENTES_CSV, false);
    }

    const storedDocentes = localStorage.getItem('dashboard_docentes_map');
    if (storedDocentes) {
      try {
        setDocentesMap(prev => ({ ...prev, ...JSON.parse(storedDocentes) }));
      } catch (e) {
        console.warn("No se pudo cargar docentes locales.");
      }
    }

    loadData();
  }, []);

  const processDocentesCSV = (csvText, saveLocal = true) => {
    try {
      const parsed = parseCSV(csvText);
      if (parsed.length < 2) return 0;
      
      const headers = parsed[0].map(h => h.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim());
      const dataRows = parsed.slice(1);

      const map = {};
      const idxApellido = headers.findIndex(h => h.includes('apellido'));
      const idxNombres = headers.findIndex(h => h.includes('nombre'));
      const idxActividad = headers.findIndex(h => h.includes('actividad'));
      const idxComision = headers.findIndex(h => h.includes('comision'));
      const idxPropuesta = headers.findIndex(h => h.includes('propuesta'));

      if (idxApellido === -1 || idxActividad === -1 || idxComision === -1) {
        console.warn("El archivo de docentes no tiene las columnas requeridas (ApellidoDocente, Actividad, Comisión).");
        return 0;
      }

      let count = 0;
      dataRows.forEach(row => {
        if (row.length > Math.max(idxApellido, idxActividad, idxComision)) {
          const comisionRaw = row[idxComision] || '';
          const actividadRaw = row[idxActividad] || '';
          
          const apellido = row[idxApellido] ? row[idxApellido].trim() : '';
          const nombres = (idxNombres !== -1 && row[idxNombres]) ? row[idxNombres].trim() : '';
          const docenteFullName = `${apellido} ${nombres}`.trim() || 'Desconocido';
          
          const propuesta = (idxPropuesta !== -1 && row[idxPropuesta]) ? row[idxPropuesta].trim() : 'Sin Propuesta';
          
          const key = buildKey(comisionRaw, actividadRaw);
          map[key] = { docente: docenteFullName, propuesta };
          count++;
        }
      });

      setDocentesMap(prev => {
        const merged = { ...prev, ...map };
        if (saveLocal) {
          localStorage.setItem('dashboard_docentes_map', JSON.stringify(merged));
        }
        return merged;
      });

      return count;
    } catch (error) {
       console.error("Error procesando docentes", error);
       if (saveLocal) alert("Hubo un error al procesar el archivo de docentes.");
       return 0;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setFetchError(null);

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
        setFetchError("No se pudo conectar a Google Sheets. Mostrando datos locales.");
      }
    }

    const storedData = localStorage.getItem('dashboard_data');
    if (storedData) {
      try {
        setRawData(JSON.parse(storedData));
        setFileName(localStorage.getItem('dashboard_filename') || 'Archivo Guardado');
        setDataSource('local');
        setLastUpdateDate(new Date(localStorage.getItem('dashboard_last_update') || new Date()));
      } catch (e) {
        processCSV(SAMPLE_CSV, true, false);
      }
    } else {
      processCSV(SAMPLE_CSV, true, false);
    }
    setIsLoading(false);
  };

  const processCSV = (csvText, isSample = false, persist = false, newFileName = '', headerDate = null) => {
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
        setFileName('Datos de Ejemplo');
        setDataSource('sample');
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
      alert("Error al procesar el archivo.");
    }
  };

  // --- Cruce de Datos ---
  const enrichedData = useMemo(() => {
    return rawData.map(item => {
      const key = buildKey(item.comision, item.actividad);
      const mapping = docentesMap[key] || { docente: 'Sin Asignar', propuesta: 'Sin Propuesta' };
      
      return { ...item, docente: mapping.docente, propuesta: mapping.propuesta };
    });
  }, [rawData, docentesMap]);

  // --- Listas completas para los Selects ---
  const uniqueDocentes = useMemo(() => {
    const fromData = enrichedData.map(item => item.docente);
    const fromMap = Object.values(docentesMap).map(d => d.docente);
    return [...new Set([...fromData, ...fromMap].filter(d => d !== 'Sin Asignar'))].sort();
  }, [enrichedData, docentesMap]);

  const uniquePropuestas = useMemo(() => {
    const fromData = enrichedData.map(item => item.propuesta);
    const fromMap = Object.values(docentesMap).map(p => p.propuesta);
    return [...new Set([...fromData, ...fromMap].filter(p => p !== 'Sin Propuesta'))].sort();
  }, [enrichedData, docentesMap]);

  const uniqueActivities = useMemo(() => [...new Set(enrichedData.map(item => item.actividadSimple))].sort(), [enrichedData]);
  const uniqueEstados = useMemo(() => [...new Set(enrichedData.map(item => item.estado ? item.estado.trim() : null).filter(Boolean))].sort(), [enrichedData]);

  // Filtrado final
  useEffect(() => {
    let result = enrichedData;
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
  }, [enrichedData, filterTurno, filterEstado, filterActividad, filterTipoOferta, filterDocente, filterPropuesta, searchTerm]);

  // --- Controladores ---
  const handleManualUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => processCSV(e.target.result, false, true, file.name); 
      reader.readAsText(file);
    }
  };

  const handleDocentesUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultCount = processDocentesCSV(e.target.result, true);
        alert(`Se han cargado y guardado ${resultCount} comisiones de docentes con éxito.`);
      };
      reader.readAsText(file);
    }
  };

  const handleClearFilters = () => {
    setFilterTurno('Todos');
    setFilterTipoOferta('Todos');
    setFilterEstado('Todos');
    setFilterActividad('Todas');
    setFilterDocente('Todos');
    setFilterPropuesta('Todas');
    setSearchTerm('');
  };

  const hasActiveFilters = 
    filterTurno !== 'Todos' || 
    filterTipoOferta !== 'Todos' || 
    filterEstado !== 'Todos' || 
    filterActividad !== 'Todas' || 
    filterDocente !== 'Todos' || 
    filterPropuesta !== 'Todas' || 
    searchTerm !== '';

  const clearStorage = () => {
    if (window.confirm("¿Estás seguro de borrar los datos locales?")) {
      localStorage.removeItem('dashboard_data');
      localStorage.removeItem('dashboard_filename');
      localStorage.removeItem('dashboard_last_update');
      localStorage.removeItem('dashboard_docentes_map');
      setDocentesMap({}); 
      if (DEFAULT_DOCENTES_CSV.trim() !== '') {
        processDocentesCSV(DEFAULT_DOCENTES_CSV, false);
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

  const handleDownloadCSV = () => {
    const headers = ['Alumno', 'DNI', 'Turno', 'Teléfono', 'Mail', 'Estado'];
    const csvContent = [
      headers.join(';'),
      ...filteredData.map(row => [
        `"${row.alumno || ''}"`, row.dni, row.turno, `"${row.telefono || ''}"`, `"${row.email || ''}"`, row.estado
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
    const porTurno = { TM: 0, TT: 0, TN: 0, Desconocido: 0 };
    const porEstado = { Aceptada: 0, Pendiente: 0, Rechazada: 0 };
    const porGenero = { Femenino: 0, Masculino: 0, Desconocido: 0 };
    const porActividad = {};
    const porPropuesta = {};

    filteredData.forEach(item => {
      if (porTurno[item.turno] !== undefined) porTurno[item.turno]++; else porTurno.Desconocido++;
      const estado = item.estado ? item.estado.trim() : 'Desconocido';
      if (porEstado[estado] !== undefined) porEstado[estado]++;
      if (porGenero[item.genero] !== undefined) porGenero[item.genero]++; else porGenero.Desconocido++;
      
      const act = item.actividadSimple;
      porActividad[act] = (porActividad[act] || 0) + 1;

      if (item.propuesta && item.propuesta !== 'Sin Propuesta') {
        porPropuesta[item.propuesta] = (porPropuesta[item.propuesta] || 0) + 1;
      }
    });

    return { 
      total: filteredData.length, porTurno, porEstado, porGenero, 
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
        value: porActividad[key] 
      })).sort((a, b) => b.value - a.value),
      chartDataPropuesta: Object.keys(porPropuesta).map(key => ({ 
        fullName: key, 
        value: porPropuesta[key] 
      })).sort((a, b) => b.value - a.value)
    };
  }, [filteredData]);

  const fullChartHeight = Math.max(400, stats.chartDataActividad.length * 40);

  // Construir lista de etiquetas de filtros activos para el título de la tabla
  const activeFiltersLabels = [];
  if (filterTurno !== 'Todos') activeFiltersLabels.push(`Turno: ${filterTurno}`);
  if (filterPropuesta !== 'Todas') activeFiltersLabels.push(`Propuesta: ${filterPropuesta}`);
  if (filterActividad !== 'Todas') activeFiltersLabels.push(`Actividad: ${filterActividad}`);
  if (filterDocente !== 'Todos') activeFiltersLabels.push(`Docente: ${filterDocente}`);
  if (filterEstado !== 'Todos') activeFiltersLabels.push(`Estado: ${filterEstado}`);
  if (filterTipoOferta !== 'Todos') activeFiltersLabels.push(`Oferta: ${filterTipoOferta}`);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 md:p-8 print:bg-white print:p-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-600 print:hidden" />
            <span><span className="text-blue-600">CFP N°1 -</span> Tablero de Inscripciones</span>
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
           
           <label className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-200 transition shadow-sm text-sm font-medium" title="Subir manual (Opcional)">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Act. Docentes</span>
            <input type="file" accept=".csv,.txt" onChange={handleDocentesUpload} className="hidden" />
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 print:grid-cols-6 print:gap-2">
        <Card className="p-4 border-l-4 border-slate-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-full text-slate-600 print:hidden"><Users className="w-5 h-5" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Total Inscriptos</p><p className="text-xl font-bold">{stats.total}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-pink-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 rounded-full text-pink-600 print:hidden"><UserCheck className="w-5 h-5" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Mujeres (Est.)</p><p className="text-xl font-bold">{stats.porGenero.Femenino}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-full text-blue-600 print:hidden"><UserCheck className="w-5 h-5" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Hombres (Est.)</p><p className="text-xl font-bold">{stats.porGenero.Masculino}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-full text-amber-600 print:hidden"><Sun className="w-5 h-5" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Turno Mañana</p><p className="text-xl font-bold">{stats.porTurno.TM}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-full text-orange-600 print:hidden"><Sunset className="w-5 h-5" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Turno Tarde</p><p className="text-xl font-bold">{stats.porTurno.TT}</p></div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-indigo-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-full text-indigo-600 print:hidden"><Moon className="w-5 h-5" /></div>
            <div><p className="text-xs text-slate-500 font-medium">Turno Noche</p><p className="text-xl font-bold">{stats.porTurno.TN}</p></div>
          </div>
        </Card>
      </div>

      {/* Gráficos de Torta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
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

      {/* Filtros */}
      <Card className="p-4 mb-6 sticky top-0 z-20 shadow-md print:hidden">
        <div className="flex flex-col md:flex-row gap-3 items-center flex-wrap">
          <div className="flex items-center gap-2 text-slate-600"><Filter className="w-4 h-4" /><span className="font-semibold text-sm">Filtros:</span></div>
          
          <select value={filterTipoOferta} onChange={(e) => setFilterTipoOferta(e.target.value)} className={`px-3 py-2 border rounded-md text-sm outline-none transition-colors cursor-pointer ${filterTipoOferta !== 'Todos' ? 'bg-purple-50 border-purple-300 text-purple-800' : 'bg-white border-slate-200'}`}>
            <option value="Todos">Oferta: Todas</option><option value="Capacitación Laboral">Cap. Laboral</option><option value="Curso">Curso</option><option value="Trayecto">Trayecto</option>
          </select>
          
          <select value={filterTurno} onChange={(e) => setFilterTurno(e.target.value)} className={`px-3 py-2 border rounded-md text-sm outline-none transition-colors cursor-pointer ${filterTurno !== 'Todos' ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-200'}`}>
            <option value="Todos">Turno: Todos</option><option value="TM">Mañana</option><option value="TT">Tarde</option><option value="TN">Noche</option>
          </select>
          
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className={`px-3 py-2 border rounded-md text-sm outline-none transition-colors cursor-pointer ${filterEstado !== 'Todos' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200'}`}>
            <option value="Todos">Estado: Todos</option>
            {uniqueEstados.map(est => <option key={est} value={est}>{est}</option>)}
          </select>
          
          <select value={filterActividad} onChange={(e) => setFilterActividad(e.target.value)} className={`px-3 py-2 border rounded-md text-sm outline-none transition-colors cursor-pointer max-w-[150px] truncate ${filterActividad !== 'Todas' ? 'bg-indigo-50 border-indigo-300 text-indigo-800' : 'bg-white border-slate-200'}`}>
            <option value="Todas">Actividad: Todas</option>
            {uniqueActivities.map(act => <option key={act} value={act}>{act}</option>)}
          </select>

          <select value={filterDocente} onChange={(e) => setFilterDocente(e.target.value)} className={`px-3 py-2 border rounded-md text-sm outline-none transition-colors cursor-pointer max-w-[150px] truncate ${filterDocente !== 'Todos' ? 'bg-cyan-50 border-cyan-300 text-cyan-800' : 'bg-white border-slate-200'}`}>
            <option value="Todos">Docente: Todos</option>
            {uniqueDocentes.map(doc => <option key={doc} value={doc}>{doc}</option>)}
            <option value="Sin Asignar">Sin Asignar</option>
          </select>

          <select value={filterPropuesta} onChange={(e) => setFilterPropuesta(e.target.value)} className={`px-3 py-2 border rounded-md text-sm outline-none transition-colors cursor-pointer max-w-[150px] truncate ${filterPropuesta !== 'Todas' ? 'bg-fuchsia-50 border-fuchsia-300 text-fuchsia-800' : 'bg-white border-slate-200'}`}>
            <option value="Todas">Propuesta: Todas</option>
            {uniquePropuestas.map(prop => <option key={prop} value={prop}>{prop}</option>)}
            <option value="Sin Propuesta">Sin Propuesta</option>
          </select>
          
          <div className="relative flex-1 min-w-[150px]">
            <Search className={`absolute left-3 top-2.5 w-4 h-4 transition-colors ${searchTerm ? 'text-blue-600' : 'text-slate-400'}`} />
            <input type="text" placeholder="Buscar nombre / DNI..." className={`w-full pl-10 pr-4 py-2 border rounded-md text-sm outline-none transition-colors ${searchTerm ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-white border-slate-200'}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {hasActiveFilters && (
            <button 
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-md text-sm font-semibold transition-colors"
              title="Restaurar todos los filtros"
            >
              <X className="w-4 h-4" /> Limpiar
            </button>
          )}
        </div>
      </Card>

      {/* Tablas de Ranking (2 Columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4 print:hidden">
        
        {/* Top 5 Actividades */}
        <Card className="p-4">
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
                {stats.chartDataActividad.slice(0, 5).map((act, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="p-3 font-medium text-slate-700" title={act.fullName}>{act.name}</td>
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

        {/* Top 5 Propuestas */}
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
                    <td className="p-3 font-semibold text-slate-800">{prop.fullName}</td>
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
                      Cargue el archivo de docentes para ver las propuestas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* Botón para alternar Gráfico Completo */}
      <div className="flex justify-center md:justify-start mb-8 print:hidden">
        <button 
          onClick={() => setShowFullActChart(!showFullActChart)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm ${showFullActChart ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'}`}
        >
          <BarChartIcon className="w-5 h-5" />
          {showFullActChart ? 'Ocultar Gráfico Completo de Actividades' : 'Ver Distribución Completa por Actividad'}
        </button>
      </div>

      {/* Gráfico Completo de Actividades (Visible según Estado) */}
      {showFullActChart && (
        <Card className="p-4 mb-8 print:block animate-in fade-in zoom-in duration-300">
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
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl max-w-sm">
                          <p className="font-bold text-slate-800 text-sm mb-1">{data.fullName}</p>
                          <p className="text-blue-600 font-semibold text-sm">
                            Total Inscriptos: {data.value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24}>
                  {stats.chartDataActividad.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#60A5FA'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Tabla Principal */}
      <Card className="overflow-hidden print:shadow-none print:border-none">
        <div className="p-4 border-b bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:bg-white print:border-none print:p-0 print:mb-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-slate-700">Listado de Alumnos ({filteredData.length})</h3>
            {activeFiltersLabels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1 print:hidden">
                {activeFiltersLabels.map(label => (
                  <span key={label} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md border border-indigo-200 font-semibold shadow-sm">
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-sm font-medium transition">
              <Printer className="w-4 h-4" /> Imprimir Listado
            </button>
            <button onClick={handleDownloadCSV} className="flex items-center gap-2 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm font-medium transition">
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 uppercase text-xs print:bg-white print:border-b-2 print:border-black">
              <tr>
                <th className="p-4 print:p-2">Alumno</th>
                <th className="p-4 print:p-2">DNI</th>
                <th className="p-4 print:p-2">Turno</th>
                <th className="p-4 print:p-2">Teléfono</th>
                <th className="p-4 print:p-2">Mail</th>
                <th className="p-4 print:p-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 print:hover:bg-transparent">
                  <td className="p-4 font-medium print:p-2">{row.alumno}</td>
                  <td className="p-4 text-slate-500 print:p-2">{row.dni}</td>
                  <td className="p-4 print:p-2"><Badge type={row.turno}>{row.turno}</Badge></td>
                  <td className="p-4 text-slate-500 print:p-2">{row.telefono}</td>
                  <td className="p-4 text-slate-500 print:p-2">{row.email}</td>
                  <td className="p-4 print:p-2"><Badge type={row.estado}>{row.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center p-8 text-slate-500">No hay alumnos que coincidan con estos filtros.</div>
          )}
        </div>
      </Card>
      <div className="mt-4 text-center text-xs text-slate-400 print:hidden">Sistema v1.12 - Tablero Completo Integrado</div>
    </div>
  );
}