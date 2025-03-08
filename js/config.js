/**
 * config.js
 * Configuración global para el sistema de partículas
 */
const Config = {
  // Configuración del canvas
  canvasWidth: 800,
  canvasHeight: 600,
  
  // Configuración de partículas
  cantidadParticulas: 200,
  tamanoParticula: 8,
  velocidadMaxima: 4,
  turbulencia: 0,
  
  // Configuración de visualización
  colorFondo: '#000000',
  transparenciaParticulas: 255,
  escala: 20,
  mostrarRastro: false,
  trailLength: 20,
  trailFinalSize: 1, // Tamaño final del rastro (proporción del tamaño original)
  formaParticula: 'Círculo',
  rotacionParticula: 0,
  
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
  
  // Paleta de colores
  paletaColores: []
}; 