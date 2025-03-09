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
      case 'Cuadrícula Polar':
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
      case 'Centro':
        this._crearPatronCentro();
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
  
  // Patrón: Círculo (Cuadrícula Polar)
  _crearPatronCirculo() {
    const cantidadTotal = Config.cantidadParticulas;
    const centroX = width / 2;
    const centroY = height / 2;
    
    // Añadir una partícula en el centro
    const particulaCentral = new Particula();
    particulaCentral.pos.x = centroX;
    particulaCentral.pos.y = centroY;
    this.particulas.push(particulaCentral);
    
    // Si solo hay una partícula, salimos
    if (cantidadTotal <= 1) return;
    
    // Calcular la cantidad de anillos basado en la cantidad de partículas
    // Queremos una distribución equilibrada
    const anillos = Math.ceil(Math.sqrt(cantidadTotal) / 2);
    const radioMaximo = Math.min(width, height) / 3;
    let particulasRestantes = cantidadTotal - 1; // Restamos la partícula central
    
    for (let anillo = 1; anillo <= anillos && particulasRestantes > 0; anillo++) {
      // El radio aumenta proporcionalmente con el número de anillo
      const radio = (radioMaximo * anillo) / anillos;
      
      // La cantidad de partículas en el anillo es proporcional al radio
      // Más partículas en anillos exteriores para mantener una densidad uniforme
      const particulasEnAnillo = Math.min(
        Math.max(6 * anillo, 6), // Al menos 6 partículas, aumentando con el anillo
        particulasRestantes // Pero no más de las que quedan
      );
      
      for (let i = 0; i < particulasEnAnillo; i++) {
        const angulo = (i / particulasEnAnillo) * Math.PI * 2; // 0 a 2π
        const x = centroX + Math.cos(angulo) * radio;
        const y = centroY + Math.sin(angulo) * radio;
        
        const particula = new Particula();
        particula.pos.x = x;
        particula.pos.y = y;
        
        this.particulas.push(particula);
      }
      
      particulasRestantes -= particulasEnAnillo;
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
  
  // Patrón: Líneas (Diagonales)
  _crearPatronLineas() {
    const cantidadTotal = Config.cantidadParticulas;
    const lineas = Math.floor(Math.sqrt(cantidadTotal));
    
    // Definimos dos tipos de diagonales: ascendentes y descendentes
    const diagonalesAscendentes = Math.ceil(lineas / 2);
    const diagonalesDescendentes = lineas - diagonalesAscendentes;
    
    let contador = 0;
    
    // Diagonales ascendentes (de abajo-izquierda a arriba-derecha)
    for (let i = 0; i < diagonalesAscendentes && contador < cantidadTotal; i++) {
      // Posición inicial de la diagonal (en el eje x)
      const posInicialX = width * (i / diagonalesAscendentes) * 0.8;
      const particulasPorLinea = Math.floor(cantidadTotal / lineas);
      
      for (let j = 0; j < particulasPorLinea && contador < cantidadTotal; j++) {
        // Porcentaje de avance en la diagonal
        const t = j / (particulasPorLinea - 1);
        
        // Las coordenadas diagonales van de abajo-izquierda a arriba-derecha
        const x = posInicialX + t * width * 0.8;
        const y = height * (1 - t) * 0.8 + height * 0.1;
        
        const particula = new Particula();
        particula.pos.x = x;
        particula.pos.y = y;
        
        this.particulas.push(particula);
        contador++;
      }
    }
    
    // Diagonales descendentes (de arriba-izquierda a abajo-derecha)
    for (let i = 0; i < diagonalesDescendentes && contador < cantidadTotal; i++) {
      // Posición inicial de la diagonal (en el eje x)
      const posInicialX = width * (i / diagonalesDescendentes) * 0.8;
      const particulasPorLinea = Math.floor(cantidadTotal / lineas);
      
      for (let j = 0; j < particulasPorLinea && contador < cantidadTotal; j++) {
        // Porcentaje de avance en la diagonal
        const t = j / (particulasPorLinea - 1);
        
        // Las coordenadas diagonales van de arriba-izquierda a abajo-derecha
        const x = posInicialX + t * width * 0.8;
        const y = height * t * 0.8 + height * 0.1;
        
        const particula = new Particula();
        particula.pos.x = x;
        particula.pos.y = y;
        
        this.particulas.push(particula);
        contador++;
      }
    }
  },
  
  // Patrón: Estrella (Estrellas concéntricas)
  _crearPatronEstrella() {
    const cantidadTotal = Config.cantidadParticulas;
    const centroX = width / 2;
    const centroY = height / 2;
    const puntas = 5; // Número de puntas de las estrellas
    
    // Determinar cuántas estrellas vamos a crear
    const cantidadEstrellas = Math.min(Math.ceil(Math.sqrt(cantidadTotal) / 2), 5);
    const radioMaximo = Math.min(width, height) / 3;
    
    let contador = 0;
    
    // Crear una partícula en el centro
    const particulaCentral = new Particula();
    particulaCentral.pos.x = centroX;
    particulaCentral.pos.y = centroY;
    this.particulas.push(particulaCentral);
    contador++;
    
    // Si solo hay una partícula, salimos
    if (cantidadTotal <= 1) return;
    
    // Para cada estrella concéntrica
    for (let estrella = 1; estrella <= cantidadEstrellas && contador < cantidadTotal; estrella++) {
      // El tamaño de la estrella aumenta con el nivel
      const radioExterior = (radioMaximo * estrella) / cantidadEstrellas;
      const radioInterior = radioExterior * 0.4; // El radio interior es 40% del exterior
      
      // Aumentar el número de puntas con el nivel de la estrella
      const puntasEnEstrella = puntas + (estrella - 1); 
      
      // Calcular cuántas partículas quedan para esta estrella
      const particulasPorEstrella = Math.floor((cantidadTotal - contador) / (cantidadEstrellas - estrella + 1));
      
      // Crear las partículas para esta estrella
      for (let i = 0; i < particulasPorEstrella && contador < cantidadTotal; i++) {
        const puntosTotales = puntasEnEstrella * 2; // Cada punta requiere 2 puntos
        const posicionEnEstrella = i % puntosTotales;
        const angulo = (posicionEnEstrella / puntosTotales) * Math.PI * 2;
        
        // Alternar entre radio interior y exterior para crear las puntas
        const radio = posicionEnEstrella % 2 === 0 ? radioExterior : radioInterior;
        
        const x = centroX + Math.cos(angulo) * radio;
        const y = centroY + Math.sin(angulo) * radio;
        
        const particula = new Particula();
        particula.pos.x = x;
        particula.pos.y = y;
        
        this.particulas.push(particula);
        contador++;
      }
    }
  },
  
  // Patrón: Anillos (todas mirando al centro)
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
        
        // Calcular la rotación para que mire al centro
        // La rotación es el ángulo opuesto al del punto más PI/2 para que apunte hacia adentro
        particula.rotacion = angulo + Math.PI; // Rotación opuesta (mirando al centro)
        
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
  
  // Patrón: Ondas (múltiples ondas)
  _crearPatronOndas() {
    const cantidadTotal = Config.cantidadParticulas;
    const amplitud = Config.amplitudOndas;
    const frecuencia = Config.frecuenciaOndas;
    const cantidadOndas = Config.cantidadOndas;
    
    // Si cantidadOndas es 1, usamos el comportamiento anterior mejorado
    if (cantidadOndas === 1) {
      for (let i = 0; i < cantidadTotal; i++) {
        const x = (width / cantidadTotal) * i;
        const y = height / 2 + Math.sin(x * frecuencia) * amplitud;
        
        const particula = new Particula();
        particula.pos.x = x;
        particula.pos.y = y;
        
        this.particulas.push(particula);
      }
    } else {
      // Para múltiples ondas, distribuimos las partículas entre ellas
      const particulasPorOnda = Math.floor(cantidadTotal / cantidadOndas);
      const espacioVertical = height / (cantidadOndas + 1);
      
      let contador = 0;
      
      for (let onda = 0; onda < cantidadOndas && contador < cantidadTotal; onda++) {
        const centroY = espacioVertical * (onda + 1);
        
        for (let i = 0; i < particulasPorOnda && contador < cantidadTotal; i++) {
          const x = (width / particulasPorOnda) * i;
          // Cada onda tiene una fase ligeramente distinta para que no se superpongan
          const fase = onda * (Math.PI / cantidadOndas);
          const y = centroY + Math.sin(x * frecuencia + fase) * amplitud;
          
          const particula = new Particula();
          particula.pos.x = x;
          particula.pos.y = y;
          
          this.particulas.push(particula);
          contador++;
        }
      }
    }
  },
  
  // Patrón: Diagonal (diagonales contrarias)
  _crearPatronDiagonal() {
    const cantidadTotal = Config.cantidadParticulas;
    const lineas = Math.floor(Math.sqrt(cantidadTotal));
    
    // Definimos diagonales contrarias (principalmente de arriba-derecha a abajo-izquierda)
    const diagonalesContrarias = lineas;
    
    let contador = 0;
    
    // Diagonales contrarias (de arriba-derecha a abajo-izquierda)
    for (let i = 0; i < diagonalesContrarias && contador < cantidadTotal; i++) {
      // Posición inicial de la diagonal (en el eje x)
      const posInicialX = width - width * (i / diagonalesContrarias) * 0.8;
      const particulasPorLinea = Math.floor(cantidadTotal / diagonalesContrarias);
      
      for (let j = 0; j < particulasPorLinea && contador < cantidadTotal; j++) {
        // Porcentaje de avance en la diagonal
        const t = j / (particulasPorLinea - 1);
        
        // Las coordenadas diagonales van de arriba-derecha a abajo-izquierda
        const x = posInicialX - t * width * 0.8;
        const y = height * t * 0.8 + height * 0.1;
        
        const particula = new Particula();
        particula.pos.x = x;
        particula.pos.y = y;
        
        this.particulas.push(particula);
        contador++;
      }
    }
  },
  
  // Patrón: Centro
  _crearPatronCentro() {
    const cantidadTotal = Config.cantidadParticulas;
    const centroX = width / 2;
    const centroY = height / 2;
    const radioMaximo = Config.tamanoParticula / 2; // Pequeño radio para variación
    
    for (let i = 0; i < cantidadTotal; i++) {
      // Pequeña variación aleatoria para evitar superposición total
      const angulo = random(TWO_PI);
      const radio = random(radioMaximo);
      
      const x = centroX + cos(angulo) * radio;
      const y = centroY + sin(angulo) * radio;
      
      // Rotación aleatoria para que las partículas no tengan todas la misma orientación
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