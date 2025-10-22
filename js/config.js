/**
 * config.js
 * Configuración global para el sistema de partículas
 */
const Config = {
  // Configuración del canvas
  canvasWidth: window.innerWidth,
  canvasHeight: window.innerHeight,
  
  // Configuración de partículas
  cantidadParticulas: 200,
  tamanoParticula: 8,
  velocidadMaxima: 4,
  turbulencia: 0,
  
  // Configuración de patrones
  patronInicial: 'Aleatorio',
  patronesDisponibles: [
    'Aleatorio', 
    'Cuadrícula', 
    'Cuadrícula Polar', 
    'Espiral',
    'Líneas', 
    'Estrella', 
    'Anillos', 
    'Hexágonos', 
    'Ondas',
    'Diagonal',
    'Centro'
  ],
  
  // Configuración de visualización
  colorFondo: '#000000',
  transparenciaParticulas: 255,
  escala: 20,
  mostrarRastro: true,
  trailLength: 20,
  trailFinalSize: 0.1, // Tamaño final del rastro (proporción del tamaño original)
  formaParticula: 'Círculo',
  rotacionParticula: 0,
  
  // Configuración de rotación inicial
  tipoRotacionInicial: 'Aleatoria',
  tiposRotacionInicial: [
    'Aleatoria',
    'Uniforme 0°',
    'Uniforme 30°',
    'Uniforme 45°',
    'Uniforme 60°',
    'Uniforme 90°',
    'Contraria'
  ],
  
  // Opciones de forma
  formasDisponibles: [
    'Círculo',
    'Cuadrado',
    'Triángulo',
    'Estrella',
    'Pentágono',
    'Hexágono',
    'Octágono',
    'Línea',
    'Curva',
    'Irregular',
    'Línea Larga'
  ],
  
  // SVGs personalizados
  formaPersonalizada: false, // Indica si se está usando una forma personalizada
  formasPersonalizadas: [], // Array para guardar las formas SVG personalizadas
  formaPersonalizadaActual: null, // Índice de la forma personalizada actual
  
  // Configuración de movimiento
  modoMovimiento: 'Flujo de Campo',
  modosDisponibles: [
    'Flujo de Campo',
    'Movimiento Aleatorio',
    'Onda Senoidal',
    'Movimiento Zigzag',
    'Movimiento Circular',
    'Movimiento Espiral',
    'Movimiento Lissajous',
    'Movimiento Browniano',
    'Atracción al Mouse',
    'Repulsión del Mouse',
    'Movimiento Figura Ocho',
    'Movimiento Corazón',
    'Movimiento Órbita',
    'Movimiento Explosión',
    'Movimiento Rosa Polar',
    'Movimiento Fractal',
    'Mover Abajo',
    'Mover Arriba',
    'Mover Derecha',
    'Mover Izquierda',
    'Mover Diagonal Derecha',
    'Mover Diagonal Izquierda',
    'Gravedad',
    'Caos'
  ],
  
  // Efectos visuales
  desenfoque: 0,
  ruidoGrafico: 0,
  
  // Efecto pixelado
  pixeladoActivo: false,
  pixeladoTamano: 4, // 1-100 donde 1 es casi normal y 100 es muy pixelado
  pixeladoSobreDesenfoque: false, // Determina si se aplica por encima del desenfoque
  
  // Efecto bloom (resplandor)
  bloomActivo: false,
  bloomIntensidad: 50, // 0-100
  bloomUmbral: 50, // 0-100, umbral de brillo para aplicar bloom
  bloomColor: '#FFFFFF', // Color del resplandor
  
  // Efecto semitono
  semitonoActivo: false,
  semitonoEscala: 0.2, // 0-1, donde 0 es mínimo y 1 es máximo (anteriormente era 1-100)
  semitonoSobreDesenfoque: false, // Determina si se aplica por encima del desenfoque
  semitonoModoFusion: 'normal', // Modos: normal, superposicion, multiplicar, negativo
  semitonoPreservarColores: true, // Si es true, usa los colores originales; si es false, usa blanco y negro
  
  // Efecto aberración cromática
  aberracionActiva: false,
  aberracionIntensidad: 30, // 0-100
  aberracionAnimada: false, // Si la aberración se anima con el tiempo
  
  // Efecto glitch
  glitchActivo: false,
  glitchIntensidad: 50, // 0-100
  glitchSobreDesenfoque: false, // Determina si se aplica por encima del desenfoque
  
  // Interfaz
  mostrarInfo: false,
  controlVisible: true,
  
  // Configuración de efectos visuales avanzados
  gradienteFondo: false,
  fondoColor1: '#000000',
  fondoColor2: '#FFFFFF',
  gradienteParticulas: false,
  particulaColorInterior: '#FFFFFF',
  particulaColorExterior: '#000000',
  glowActivo: false,
  glowAmount: 0,
  glowColor: '#FFFFFF',
  strokeActivo: false,
  strokeColor: '#FFFFFF',
  strokeOpacity: 255,
  strokeWeightValue: 1,
  
  // Opciones específicas para el patrón Ondas
  amplitudOndas: 100,      // Amplitud de las ondas (altura)
  frecuenciaOndas: 0.05,   // Frecuencia de las ondas (más bajo = ondas más amplias)
  cantidadOndas: 3,        // Cantidad de ondas que se dibujan
  
  // Paleta de colores
  paletaColores: []
}; 