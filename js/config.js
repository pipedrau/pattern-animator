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
  formaParticula: 'Círculo',
  rotacionParticula: 0,
  
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
  
  // Paleta de colores
  paletaColores: []
}; 