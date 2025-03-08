/**
 * visual-effects.js
 * Gestor de efectos visuales
 */
const VisualEffects = {
  sceneBuffer: null,
  noiseLayer: null,
  
  inicializar(width, height) {
    console.log("Inicializando efectos visuales");
    
    // Si ya existen buffers, destruirlos para liberar memoria
    if (this.sceneBuffer) {
      this.sceneBuffer.remove();
    }
    
    if (this.noiseLayer) {
      this.noiseLayer.remove();
    }
    
    // Crear nuevos buffers con las dimensiones actualizadas
    this.sceneBuffer = createGraphics(width, height);
    this.noiseLayer = createGraphics(width, height);
    
    // Inicializar con fondo completamente opaco
    this.sceneBuffer.background(Config.colorFondo);
    
    console.log(`Buffers de efectos inicializados con dimensiones ${width}x${height}`);
  },
  
  aplicarRuidoGrafico() {
    if (Config.ruidoGrafico <= 0) return;
    
    this.noiseLayer.clear();
    this.noiseLayer.noStroke();
    this.noiseLayer.fill(255, Config.ruidoGrafico);
    
    for (let i = 0; i < width * height * 0.01; i++) {
      let x = random(width);
      let y = random(height);
      this.noiseLayer.rect(x, y, 1, 1);
    }
    
    image(this.noiseLayer, 0, 0);
  },
  
  dibujarEscena() {
    // Verificar si necesitamos recrear los buffers
    if (!this.sceneBuffer || this.sceneBuffer.width !== width || this.sceneBuffer.height !== height) {
      this.inicializar(width, height);
    }
    
    // Limpiar buffer con un fondo más opaco
    let bgColor = color(Config.colorFondo);
    
    // Si se activa el rastro, usar un fondo semitransparente para efecto de estela
    if (Config.mostrarRastro) {
      bgColor.setAlpha(80); // Valor más alto = rastro más corto, menos líneas
    } else {
      bgColor.setAlpha(255); // Fondo completamente opaco cuando no hay rastro
    }
    
    this.sceneBuffer.background(bgColor);
    
    return this.sceneBuffer;
  },
  
  // Aplicar desenfoque (efecto blur)
  aplicarDesenfoque(pg) {
    if (Config.desenfoque <= 0) return;
    
    pg.filter(BLUR, Config.desenfoque);
  },
  
  // Guardar la escena actual
  guardarImagen() {
    saveCanvas('pattern_animator_' + Date.now(), 'png');
  },
  
  // Reiniciar los efectos visuales
  reiniciar() {
    if (this.sceneBuffer) {
      this.sceneBuffer.background(Config.colorFondo);
    }
  }
}; 