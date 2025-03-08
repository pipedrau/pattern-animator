/**
 * color-utils.js
 * Utilidades para el manejo de colores
 */
const ColorUtils = {
  inicializarPaleta() {
    console.log("Inicializando paleta de colores");
    Config.paletaColores = [];
    
    // Colores vibrantes para mejor visibilidad
    Config.paletaColores.push(color(255, 0, 0));     // Rojo
    Config.paletaColores.push(color(0, 255, 0));     // Verde
    Config.paletaColores.push(color(0, 0, 255));     // Azul
    Config.paletaColores.push(color(255, 255, 0));   // Amarillo
    Config.paletaColores.push(color(0, 255, 255));   // Cian
    Config.paletaColores.push(color(255, 0, 255));   // Magenta
    Config.paletaColores.push(color(255, 128, 0));   // Naranja
    Config.paletaColores.push(color(128, 0, 255));   // Púrpura
    Config.paletaColores.push(color(0, 255, 128));   // Verde menta
    
    console.log("Paleta inicializada con", Config.paletaColores.length, "colores");
  },
  
  obtenerColorAleatorio() {
    if (Config.paletaColores.length === 0) {
      this.inicializarPaleta();
    }
    return random(Config.paletaColores);
  },
  
  // Utilidad para mapear un valor a un color de la paleta
  obtenerColorPorIndice(indice) {
    if (Config.paletaColores.length === 0) {
      this.inicializarPaleta();
    }
    // Manejar el índice cíclicamente
    return Config.paletaColores[indice % Config.paletaColores.length];
  },
  
  // Crea un gradiente entre dos colores
  crearGradiente(color1, color2, pasos) {
    let resultado = [];
    for (let i = 0; i < pasos; i++) {
      let r = map(i, 0, pasos - 1, red(color1), red(color2));
      let g = map(i, 0, pasos - 1, green(color1), green(color2));
      let b = map(i, 0, pasos - 1, blue(color1), blue(color2));
      resultado.push(color(r, g, b));
    }
    return resultado;
  }
}; 