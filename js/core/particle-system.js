/**
 * particle-system.js
 * Sistema de gestión de partículas
 */
const ParticleSystem = {
  particulas: [],
  
  inicializar() {
    console.log("Inicializando sistema de partículas");
    this.particulas = [];
    
    const patronSeleccionado = Config.patronInicial;
    console.log(`Creando partículas con patrón: ${patronSeleccionado}`);
    
    switch (patronSeleccionado) {
      case 'Cuadrícula':
        this._crearPatronCuadricula();
        break;
      case 'Círculo':
        this._crearPatronCirculo();
        break;
      case 'Espiral':
        this._crearPatronEspiral();
        break;
      case 'Líneas':
        this._crearPatronLineas();
        break;
      case 'Estrella':
        this._crearPatronEstrella();
        break;
      case 'Anillos':
        this._crearPatronAnillos();
        break;
      case 'Hexágonos':
        this._crearPatronHexagonos();
        break;
      case 'Ondas':
        this._crearPatronOndas();
        break;
      case 'Diagonal':
        this._crearPatronDiagonal();
        break;
      default:
        // Patrón por defecto: Aleatorio
        this._crearPatronAleatorio();
    }
    
    console.log(`Creadas ${this.particulas.length} partículas`);
  },
  
  // Patrón: Aleatorio
  _crearPatronAleatorio() {
    for (let i = 0; i < Config.cantidadParticulas; i++) {
      this.particulas.push(new Particula());
    }
  },
  
  // Patrón: Cuadrícula
  _crearPatronCuadricula() {
    const cantidadTotal = Config.cantidadParticulas;
    const filas = Math.floor(Math.sqrt(cantidadTotal));
    const columnas = Math.ceil(cantidadTotal / filas);
    
    // Espaciado entre partículas
    const espacioX = width / (columnas + 1);
    const espacioY = height / (filas + 1);
    
    let contador = 0;
    for (let fila = 1; fila <= filas && contador < cantidadTotal; fila++) {
      for (let col = 1; col <= columnas && contador < cantidadTotal; col++) {
        const x = col * espacioX;
        const y = fila * espacioY;
        
        const particula = new Particula();
        particula.pos.x = x;
        particula.pos.y = y;
        
        this.particulas.push(particula);
        contador++;
      }
    }
  },
  
  // Patrón: Círculo
  _crearPatronCirculo() {
    const cantidadTotal = Config.cantidadParticulas;
    const centroX = width / 2;
    const centroY = height / 2;
    const radio = Math.min(width, height) / 3; // Un tercio del tamaño más pequeño
    
    for (let i = 0; i < cantidadTotal; i++) {
      const angulo = (i / cantidadTotal) * Math.PI * 2; // 0 a 2π
      const x = centroX + Math.cos(angulo) * radio;
      const y = centroY + Math.sin(angulo) * radio;
      
      const particula = new Particula();
      particula.pos.x = x;
      particula.pos.y = y;
      
      this.particulas.push(particula);
    }
  },
  
  // Patrón: Espiral
  _crearPatronEspiral() {
    const cantidadTotal = Config.cantidadParticulas;
    const centroX = width / 2;
    const centroY = height / 2;
    let radio = 0;
    const pasoAngular = 0.1;
    
    for (let i = 0; i < cantidadTotal; i++) {
      const angulo = i * pasoAngular;
      radio += 0.5; // Incremento constante del radio
      
      const x = centroX + Math.cos(angulo) * radio;
      const y = centroY + Math.sin(angulo) * radio;
      
      const particula = new Particula();
      particula.pos.x = x;
      particula.pos.y = y;
      
      this.particulas.push(particula);
    }
  },
  
  // Patrón: Líneas
  _crearPatronLineas() {
    const cantidadTotal = Config.cantidadParticulas;
    // Calcular número aproximado de líneas y partículas por línea
    const lineas = Math.floor(Math.sqrt(cantidadTotal));
    const espacioY = height / (lineas + 1);
    
    let contador = 0;
    for (let i = 0; i < lineas && contador < cantidadTotal; i++) {
      const y = espacioY * (i + 1);
      const particulasPorLinea = Math.floor(cantidadTotal / lineas);
      
      for (let j = 0; j < particulasPorLinea && contador < cantidadTotal; j++) {
        const x = (width / (particulasPorLinea + 1)) * (j + 1);
        
        const particula = new Particula();
        particula.pos.x = x;
        particula.pos.y = y;
        
        this.particulas.push(particula);
        contador++;
      }
    }
  },
  
  // Patrón: Estrella
  _crearPatronEstrella() {
    const cantidadTotal = Config.cantidadParticulas;
    const centroX = width / 2;
    const centroY = height / 2;
    const puntas = 5;
    const radioInterior = Math.min(width, height) / 10;
    const radioExterior = Math.min(width, height) / 3;
    const pasoAngular = Math.PI * 2 / (puntas * 2);
    
    for (let i = 0; i < cantidadTotal; i++) {
      const angulo = i * pasoAngular;
      // Alternar entre radio interior y exterior
      const radio = i % 2 === 0 ? radioExterior : radioInterior;
      
      const x = centroX + Math.cos(angulo) * radio;
      const y = centroY + Math.sin(angulo) * radio;
      
      const particula = new Particula();
      particula.pos.x = x;
      particula.pos.y = y;
      
      this.particulas.push(particula);
    }
  },
  
  // Patrón: Anillos
  _crearPatronAnillos() {
    const cantidadTotal = Config.cantidadParticulas;
    const centroX = width / 2;
    const centroY = height / 2;
    const anillos = Math.floor(Math.sqrt(cantidadTotal / Math.PI)); // Aproximación
    const espacioAnillos = Math.min(width, height) / (anillos * 2);
    
    let contador = 0;
    for (let r = espacioAnillos; r < Math.min(width, height) / 2 && contador < cantidadTotal; r += espacioAnillos) {
      // Cantidad de partículas proporcional a la circunferencia
      const particulasAnillo = Math.floor(2 * Math.PI * r / (Config.tamanoParticula * 2));
      
      for (let i = 0; i < particulasAnillo && contador < cantidadTotal; i++) {
        const angulo = (i / particulasAnillo) * Math.PI * 2;
        const x = centroX + Math.cos(angulo) * r;
        const y = centroY + Math.sin(angulo) * r;
        
        const particula = new Particula();
        particula.pos.x = x;
        particula.pos.y = y;
        
        this.particulas.push(particula);
        contador++;
      }
    }
  },
  
  // Patrón: Hexágonos
  _crearPatronHexagonos() {
    const cantidadTotal = Config.cantidadParticulas;
    // Similar a cuadrícula pero con desplazamiento en filas alternas
    const filas = Math.floor(Math.sqrt(cantidadTotal));
    const columnas = Math.ceil(cantidadTotal / filas);
    
    const espacioX = width / columnas;
    const espacioY = height / filas * 0.866; // Factor para estructura hexagonal
    
    let contador = 0;
    for (let fila = 0; fila < filas && contador < cantidadTotal; fila++) {
      const offsetX = fila % 2 === 0 ? 0 : espacioX / 2; // Desplazamiento en filas impares
      
      for (let col = 0; col < columnas && contador < cantidadTotal; col++) {
        const x = col * espacioX + espacioX / 2 + offsetX;
        const y = fila * espacioY + espacioY / 2;
        
        const particula = new Particula();
        particula.pos.x = x;
        particula.pos.y = y;
        
        this.particulas.push(particula);
        contador++;
      }
    }
  },
  
  // Patrón: Ondas
  _crearPatronOndas() {
    const cantidadTotal = Config.cantidadParticulas;
    const amplitud = height / 4; // 1/4 de la altura
    const frecuencia = 0.05;
    
    for (let i = 0; i < cantidadTotal; i++) {
      const x = (width / cantidadTotal) * i;
      const y = height / 2 + Math.sin(x * frecuencia) * amplitud;
      
      const particula = new Particula();
      particula.pos.x = x;
      particula.pos.y = y;
      
      this.particulas.push(particula);
    }
  },
  
  // Patrón: Diagonal
  _crearPatronDiagonal() {
    const cantidadTotal = Config.cantidadParticulas;
    
    for (let i = 0; i < cantidadTotal; i++) {
      const t = i / (cantidadTotal - 1); // Valor entre 0 y 1
      const x = width * t;
      const y = height * t;
      
      const particula = new Particula();
      particula.pos.x = x;
      particula.pos.y = y;
      
      this.particulas.push(particula);
    }
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