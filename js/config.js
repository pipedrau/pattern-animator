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
    'Gravedad',
    'Caos'
  ],
  
  // Efectos visuales
  desenfoque: 0,
  ruidoGrafico: 0,
  
  // Interfaz
  mostrarInfo: true,
  controlVisible: true,
  
  // Paleta de colores
  paletaColores: []
}; 