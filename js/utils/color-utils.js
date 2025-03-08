/**
 * color-utils.js
 * Utilidades para el manejo de colores
 */
const ColorUtils = {
  inicializarPaleta() {
    console.log("Inicializando paleta de colores");
    Config.paletaColores = [];
    
    // Colores de la paleta solicitada
    Config.paletaColores.push(color(4, 80, 242));    // Azul eléctrico - #0551F2
    Config.paletaColores.push(color(0, 20, 63));     // Azul oscuro - #00143F
    Config.paletaColores.push(color(4, 110, 242));   // Azul medio - #046EF3
    Config.paletaColores.push(color(2, 128, 242));   // Azul claro - #0381F3
    Config.paletaColores.push(color(11, 239, 223));  // Cyan - #0CF0DF
    
    // Variaciones para más diversidad
    Config.paletaColores.push(color(4, 80, 242, 180));    // Azul eléctrico con transparencia
    Config.paletaColores.push(color(0, 20, 63, 200));     // Azul oscuro con transparencia
    Config.paletaColores.push(color(4, 110, 242, 160));   // Azul medio con transparencia
    Config.paletaColores.push(color(2, 128, 242, 140));   // Azul claro con transparencia
    Config.paletaColores.push(color(11, 239, 223, 120));  // Cyan con transparencia
    
    // Aseguramos que la paleta está disponible globalmente
    window.paletaColores = Config.paletaColores;
    
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
  },
  
  // Actualizar un color específico de la paleta
  actualizarColor(indice, nuevoColor) {
    if (indice >= 0 && indice < Config.paletaColores.length) {
      // Intentamos convertir a un objeto color válido en caso de recibir un string
      let colorObj = nuevoColor;
      if (typeof nuevoColor === 'string') {
        colorObj = color(nuevoColor);
      }
      
      console.log(`ColorUtils: Actualizando color ${indice} a: ${colorObj.toString()}`);
      
      // Asignar el nuevo color
      Config.paletaColores[indice] = colorObj;
      
      // Actualizamos también las versiones con transparencia si corresponde
      if (indice < 5) {
        // Calculamos la transparencia adecuada
        const transparencia = [180, 200, 160, 140, 120][indice];
        Config.paletaColores[indice + 5] = color(
          red(colorObj), 
          green(colorObj), 
          blue(colorObj), 
          transparencia
        );
      }
      
      // Actualizar la variable global
      window.paletaColores = Config.paletaColores;
      
      console.log(`ColorUtils: Paleta actualizada, ahora tiene ${Config.paletaColores.length} colores`);
      return true;
    } else {
      console.warn(`ColorUtils: Índice de color inválido: ${indice}`);
      return false;
    }
  }
}; 