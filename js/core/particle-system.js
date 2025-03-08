/**
 * particle-system.js
 * Sistema de gestión de partículas
 */
const ParticleSystem = {
  particulas: [],
  
  inicializar() {
    console.log("Inicializando sistema de partículas");
    this.particulas = [];
    
    for (let i = 0; i < Config.cantidadParticulas; i++) {
      this.particulas.push(new Particula());
    }
    
    console.log(`Creadas ${this.particulas.length} partículas`);
  },
  
  actualizar(campo, cols, rows) {
    for (let i = 0; i < this.particulas.length; i++) {
      this.particulas[i].seguir(campo, cols, rows);
      this.particulas[i].update();
    }
  },
  
  dibujar(pg) {
    for (let i = 0; i < this.particulas.length; i++) {
      this.particulas[i].mostrarEnLayer(pg);
    }
  },
  
  // Añadir una partícula en la posición especificada
  agregarParticula(x, y) {
    let p = new Particula();
    p.pos.x = x;
    p.pos.y = y;
    this.particulas.push(p);
    return p;
  },
  
  // Eliminar partículas (útil para ajustar la cantidad)
  eliminarParticulas(cantidad) {
    // No eliminar más partículas de las que hay
    cantidad = Math.min(cantidad, this.particulas.length);
    this.particulas.splice(0, cantidad);
  },
  
  // Obtener estadísticas del sistema
  obtenerEstadisticas() {
    return {
      cantidad: this.particulas.length,
      modo: Config.modoMovimiento
    };
  }
}; 