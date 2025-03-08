/**
 * particula.js
 * Clase para representar una partícula en el sistema
 */
class Particula {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = Config.velocidadMaxima;
    this.size = Config.tamanoParticula;
    this.historia = [];
    this.maxHistory = Config.trailLength;
    
    // Inicializar rotación según el tipo seleccionado
    this.rotacion = this._inicializarRotacion();
    
    this.lastPos = null; // Guardamos la última posición válida
    
    // Propiedades de color
    this.color = ColorUtils.obtenerColorAleatorio();
    this.alpha = Config.transparenciaParticulas;
    
    // Forma irregular para ese tipo de partícula
    this.formaIrregular = [];
    for (let i = 0; i < 5; i++) {
      this.formaIrregular.push(createVector(random(-this.size / 2, this.size / 2), random(-this.size / 2, this.size / 2)));
    }
  }
  
  // Método para inicializar la rotación según el tipo seleccionado
  _inicializarRotacion() {
    switch (Config.tipoRotacionInicial) {
      case 'Aleatoria':
        return random(TWO_PI);
        
      case 'Uniforme 0°':
        return 0;
        
      case 'Uniforme 30°':
        return PI / 6; // 30 grados en radianes
        
      case 'Uniforme 45°':
        return PI / 4; // 45 grados en radianes
        
      case 'Uniforme 60°':
        return PI / 3; // 60 grados en radianes
        
      case 'Uniforme 90°':
        return PI / 2; // 90 grados en radianes
        
      case 'Contraria':
        // Mitad de las partículas en una dirección, mitad en la contraria
        // Usamos el índice de partícula para determinar la dirección
        // Como no tenemos acceso al índice, usamos un valor aleatorio
        return random() > 0.5 ? 0 : PI;
        
      default:
        return random(TWO_PI);
    }
  }

  seguir(campo, cols, rows) {
    // Aplicar fuerza según el modo de movimiento seleccionado
    switch (Config.modoMovimiento) {
      case 'Flujo de Campo':
      case 'Campo de Flujo':
        this._aplicarFuerzaCampo(campo, cols, rows);
        break;
        
      case 'Movimiento Aleatorio':
      case 'Aleatorio':
        // Usar una magnitud un poco mayor para que sea más visible
        let fuerzaAleatoria = p5.Vector.random2D();
        fuerzaAleatoria.setMag(0.5);
        this.applyForce(fuerzaAleatoria);
        break;
        
      case 'Onda Senoidal':
        // El componente horizontal varía según una función seno basada en la posición vertical
        let fuerzaSeno = createVector(sin(this.pos.y * 0.05 + frameCount * 0.05), 0);
        fuerzaSeno.setMag(0.5);
        this.applyForce(fuerzaSeno);
        break;
        
      case 'Movimiento Zigzag':
        // Combina senos y cosenos basados en la posición y el tiempo
        let t = frameCount * 0.05;
        let fuerzaZigzag = createVector(sin(t + this.pos.y * 0.1), cos(t + this.pos.x * 0.1));
        fuerzaZigzag.setMag(0.5);
        this.applyForce(fuerzaZigzag);
        break;
        
      case 'Movimiento Circular':
        // Movimiento circular alrededor del centro del canvas
        let centro = createVector(width / 2, height / 2);
        let direccion = p5.Vector.sub(this.pos, centro);
        // Usar copy() para no modificar el vector original
        let fuerzaCircular = direccion.copy().rotate(HALF_PI);
        fuerzaCircular.setMag(0.5);
        this.applyForce(fuerzaCircular);
        break;
        
      case 'Movimiento Espiral':
        // Similar al circular pero la magnitud varía con la distancia
        let centroEspiral = createVector(width / 2, height / 2);
        let direccionEspiral = p5.Vector.sub(this.pos, centroEspiral);
        let fuerzaEspiral = direccionEspiral.copy().rotate(HALF_PI);
        let distancia = direccionEspiral.mag();
        // Evitar división por cero y limitar la fuerza máxima
        if (distancia > 5) {
          fuerzaEspiral.setMag(100 / distancia);
        } else {
          fuerzaEspiral.setMag(20);
        }
        this.applyForce(fuerzaEspiral);
        break;
        
      case 'Movimiento Lissajous':
        // Curvas de Lissajous usando senos en ambas direcciones
        let fuerzaLissajous = createVector(
          sin(this.pos.y * 0.03 + frameCount * 0.02),
          sin(this.pos.x * 0.03 + frameCount * 0.02)
        );
        fuerzaLissajous.setMag(0.5);
        this.applyForce(fuerzaLissajous);
        break;
        
      case 'Movimiento Browniano':
        // Movimiento aleatorio con magnitud variable
        let fuerzaBrowniana = p5.Vector.random2D();
        // Usar la turbulencia como factor de escala
        let magnitudBrowniana = random(0, max(0.01, Config.turbulencia * 5));
        fuerzaBrowniana.mult(magnitudBrowniana);
        this.applyForce(fuerzaBrowniana);
        break;
        
      case 'Atracción al Mouse':
        // Atracción hacia la posición del mouse
        let mouse = createVector(mouseX, mouseY);
        let fuerzaAtraccion = p5.Vector.sub(mouse, this.pos);
        // La magnitud disminuye con la distancia, pero con un límite inferior
        let distanciaAtraccion = max(10, fuerzaAtraccion.mag());
        fuerzaAtraccion.setMag(2 / sqrt(distanciaAtraccion));
        this.applyForce(fuerzaAtraccion);
        break;
        
      case 'Repulsión del Mouse':
        // Repulsión desde la posición del mouse
        let mousePosRepulsion = createVector(mouseX, mouseY);
        let fuerzaRepulsion = p5.Vector.sub(this.pos, mousePosRepulsion);
        // La magnitud disminuye con la distancia, con un límite para evitar fuerzas extremas
        let distanciaRepulsion = max(10, fuerzaRepulsion.mag());
        fuerzaRepulsion.setMag(2 / sqrt(distanciaRepulsion));
        this.applyForce(fuerzaRepulsion);
        break;
        
      case 'Movimiento Figura Ocho':
        // Figura de ocho usando seno y coseno
        let tOcho = frameCount * 0.02;
        let fuerzaOcho = createVector(sin(tOcho), sin(tOcho) * cos(tOcho));
        fuerzaOcho.setMag(0.5);
        this.applyForce(fuerzaOcho);
        break;
        
      case 'Movimiento Corazón':
        // Forma de corazón usando ecuaciones paramétricas
        let tCorazon = frameCount * 0.02;
        // Ecuación paramétrica de un corazón
        let xCorazon = 16 * pow(sin(tCorazon), 3);
        let yCorazon = 13 * cos(tCorazon) - 5 * cos(2 * tCorazon) - 2 * cos(3 * tCorazon) - cos(4 * tCorazon);
        let fuerzaCorazon = createVector(xCorazon, -yCorazon);
        fuerzaCorazon.setMag(0.05);
        this.applyForce(fuerzaCorazon);
        break;
        
      case 'Movimiento Órbita':
        // Órbita alrededor de un punto que se mueve con el tiempo
        let centroOrbita = createVector(width / 2, height / 2);
        let anguloOrbita = frameCount * 0.01 + this.pos.x * 0.001;
        let radioOrbita = 200;
        let xOrbita = centroOrbita.x + radioOrbita * cos(anguloOrbita);
        let yOrbita = centroOrbita.y + radioOrbita * sin(anguloOrbita);
        let objetivo = createVector(xOrbita, yOrbita);
        let fuerzaOrbita = p5.Vector.sub(objetivo, this.pos);
        // La fuerza de atracción es proporcional a la distancia
        fuerzaOrbita.setMag(fuerzaOrbita.mag() * 0.01);
        this.applyForce(fuerzaOrbita);
        break;
        
      case 'Movimiento Explosión':
        // Explosión desde el centro
        let centroExplosion = createVector(width / 2, height / 2);
        let fuerzaExplosion = p5.Vector.sub(this.pos, centroExplosion);
        // La fuerza es constante independientemente de la distancia
        fuerzaExplosion.setMag(0.05);
        this.applyForce(fuerzaExplosion);
        break;
        
      case 'Movimiento Rosa Polar':
        // Rosa polar (curva con forma de pétalos)
        let tRosa = frameCount * 0.02 + this.pos.x * 0.001;
        let k = 5; // Número de pétalos
        let rRosa = 200 * cos(k * tRosa);
        let xRosa = width / 2 + rRosa * cos(tRosa);
        let yRosa = height / 2 + rRosa * sin(tRosa);
        let objetivoRosa = createVector(xRosa, yRosa);
        let fuerzaRosa = p5.Vector.sub(objetivoRosa, this.pos);
        // La fuerza es proporcional a la distancia
        fuerzaRosa.setMag(fuerzaRosa.mag() * 0.01);
        this.applyForce(fuerzaRosa);
        break;
        
      case 'Movimiento Fractal':
        // Movimiento con aspecto fractal usando ruido
        let tFractal = frameCount * 0.02;
        // Usar la posición actual para generar fuerzas fractales
        let xFractal = sin(tFractal * this.pos.y * 0.001) * 100;
        let yFractal = cos(tFractal * this.pos.x * 0.001) * 100;
        let fuerzaFractal = createVector(xFractal, yFractal);
        fuerzaFractal.setMag(0.05);
        this.applyForce(fuerzaFractal);
        break;
        
      case 'Mover Abajo':
        // Movimiento constante hacia abajo
        let fuerzaAbajo = createVector(0, 0.1);
        this.applyForce(fuerzaAbajo);
        break;
        
      case 'Mover Arriba':
        // Movimiento constante hacia arriba
        let fuerzaArriba = createVector(0, -0.1);
        this.applyForce(fuerzaArriba);
        break;
        
      case 'Mover Derecha':
        // Movimiento constante hacia la derecha
        let fuerzaDerecha = createVector(0.1, 0);
        this.applyForce(fuerzaDerecha);
        break;
        
      case 'Mover Izquierda':
        // Movimiento constante hacia la izquierda
        let fuerzaIzquierda = createVector(-0.1, 0);
        this.applyForce(fuerzaIzquierda);
        break;
        
      case 'Mover Diagonal Derecha':
        // Movimiento diagonal hacia abajo-derecha
        let fuerzaDiagDerecha = createVector(0.1, 0.1);
        this.applyForce(fuerzaDiagDerecha);
        break;
        
      case 'Mover Diagonal Izquierda':
        // Movimiento diagonal hacia abajo-izquierda
        let fuerzaDiagIzquierda = createVector(-0.1, 0.1);
        this.applyForce(fuerzaDiagIzquierda);
        break;
        
      case 'Gravedad':
        // Simula gravedad con rebote
        this._aplicarGravedad();
        break;
        
      case 'Caos':
        // Múltiples atractores que generan caos
        this._aplicarCaos();
        break;
        
      default:
        // Movimiento aleatorio suave por defecto
        this._movimientoAleatorio(0.1);
    }
  }
  
  _aplicarFuerzaCampo(campo, cols, rows) {
    // Obtener posición en la grilla
    let x = floor(this.pos.x / Config.escala);
    let y = floor(this.pos.y / Config.escala);
    
    // Asegurar que los índices sean válidos
    x = constrain(x, 0, cols - 1);
    y = constrain(y, 0, rows - 1);
    
    let indice = x + y * cols;
    
    // Verificar que el índice sea válido y que el campo tenga un vector
    if (indice >= 0 && indice < campo.length && campo[indice]) {
      let fuerza = campo[indice].copy(); // Siempre usar copy para no modificar el original
      this.applyForce(fuerza);
    }
  }
  
  _movimientoAleatorio(magnitud) {
    let fuerza = p5.Vector.random2D();
    fuerza.setMag(magnitud);
    this.applyForce(fuerza);
  }
  
  _aplicarGravedad() {
    // Fuerza de gravedad hacia abajo
    let gravedad = createVector(0, 0.1);
    this.applyForce(gravedad);
    
    // Rebote en los bordes con pérdida de energía
    if (this.pos.y > height - this.size) {
      this.pos.y = height - this.size;
      this.vel.y *= -0.8; // Rebote con pérdida de energía
    }
  }
  
  _aplicarCaos() {
    // Crear atractores dinámicos basados en ruido Perlin
    let numAtractores = 3;
    for (let i = 0; i < numAtractores; i++) {
      // Posición del atractor basada en ruido para movimiento fluido
      let t = frameCount * 0.01 + i;
      let atrX = width * noise(t, 0);
      let atrY = height * noise(0, t);
      
      // Vector hacia el atractor
      let atractor = createVector(atrX, atrY);
      let fuerza = p5.Vector.sub(atractor, this.pos);
      
      // Fuerza inversamente proporcional a la distancia
      let d = fuerza.mag();
      if (d > 5) {  // Prevenir divisiones por cero o fuerzas extremas
        fuerza.setMag(0.3 / d);  // Ajustar magnitud
        
        // Alternar entre atracción y repulsión según el índice del atractor
        if (i % 2 === 0) {
          fuerza.mult(-1);
        }
        
        this.applyForce(fuerza);
      }
    }
  }

  applyForce(f) {
    if (!f) return;
    this.acc.add(f);
  }

  update() {
    // Guardar posición anterior para verificar si cruza un borde
    this.lastPos = this.pos.copy();
    
    // Aplicar turbulencia
    if (Config.turbulencia > 0) {
      let ruido = p5.Vector.random2D();
      ruido.setMag(Config.turbulencia);
      this.applyForce(ruido);
    }
    
    // Actualizar velocidad y posición
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    // Variable para detectar cuando cruza un borde
    let envuelta = false;
    
    // Envolver en los bordes del canvas (toroidal)
    if (this.pos.x > width) {
      this.pos.x = this.pos.x % width;
      envuelta = true;
    } else if (this.pos.x < 0) {
      this.pos.x = (this.pos.x + width) % width;
      envuelta = true;
    }
    
    if (this.pos.y > height) {
      this.pos.y = this.pos.y % height;
      envuelta = true;
    } else if (this.pos.y < 0) {
      this.pos.y = (this.pos.y + height) % height;
      envuelta = true;
    }
    
    // Actualizar rotación
    this.rotacion += Config.rotacionParticula;
    
    // Actualizar historial para el rastro
    if (Config.mostrarRastro) {
      // Si cruzó un borde, limpiar el historial para evitar líneas que atraviesan todo el canvas
      if (envuelta) {
        this.historia = [];
        this.lastPos = null; // Invalidar la última posición
      } else {
        // Guardar posición, rotación y cualquier otra propiedad necesaria para el rastro
        this.historia.push({
          pos: createVector(this.pos.x, this.pos.y),
          rot: this.rotacion,
          time: frameCount // Guardar el tiempo para efectos de desvanecimiento
        });
        
        // Mantener solo las últimas maxHistory posiciones
        if (this.historia.length > this.maxHistory) {
          this.historia.splice(0, 1);
        }
      }
    }
  }

  mostrarEnLayer(pg) {
    // Dibujar el rastro primero (para que la partícula actual quede encima)
    if (Config.mostrarRastro && this.historia.length > 0) {
      this._dibujarRastro(pg);
    }
    
    // Dibujar la partícula actual
    pg.push();
    pg.translate(this.pos.x, this.pos.y);
    pg.rotate(this.rotacion);
    
    // Aplicar configuración de estilo
    this._aplicarEstilos(pg);
    
    // Dibujar según la forma seleccionada
    this._dibujarForma(pg);
    
    pg.pop();
  }
  
  _aplicarEstilos(pg) {
    // Color base de la partícula
    let col = color(this.color);
    col.setAlpha(Config.transparenciaParticulas);
    
    // Aplicar gradiente si está activado
    if (Config.gradienteParticulas) {
      let gradient = pg.drawingContext.createRadialGradient(
        0, 0, 0,
        0, 0, this.size / 2
      );
      
      let colorInterior = color(Config.particulaColorInterior);
      colorInterior.setAlpha(Config.transparenciaParticulas);
      
      let colorExterior = color(Config.particulaColorExterior);
      colorExterior.setAlpha(Config.transparenciaParticulas);
      
      gradient.addColorStop(0, colorInterior.toString());
      gradient.addColorStop(1, colorExterior.toString());
      
      pg.drawingContext.fillStyle = gradient;
    } else {
      pg.fill(col);
    }
    
    // Aplicar borde si está activado
    if (Config.strokeActivo) {
      let strokeCol = color(Config.strokeColor);
      strokeCol.setAlpha(Config.strokeOpacity);
      pg.stroke(strokeCol);
      pg.strokeWeight(Config.strokeWeightValue);
    } else {
      pg.noStroke();
    }
    
    // Aplicar resplandor si está activado
    if (Config.glowActivo) {
      pg.drawingContext.shadowBlur = Config.glowAmount;
      pg.drawingContext.shadowColor = Config.glowColor;
    } else {
      pg.drawingContext.shadowBlur = 0;
    }
  }
  
  _dibujarForma(pg) {
    switch (Config.formaParticula) {
      case 'Círculo':
        pg.ellipse(0, 0, this.size, this.size);
        break;
        
      case 'Cuadrado':
        pg.rectMode(CENTER);
        pg.rect(0, 0, this.size, this.size);
        break;
        
      case 'Triángulo':
        ShapeUtils.polygon(pg, 0, 0, this.size / 2, 3);
        break;
        
      case 'Estrella':
        ShapeUtils.star(pg, 0, 0, this.size / 2, this.size / 4, 5);
        break;
        
      case 'Pentágono':
        ShapeUtils.polygon(pg, 0, 0, this.size / 2, 5);
        break;
        
      case 'Hexágono':
        ShapeUtils.polygon(pg, 0, 0, this.size / 2, 6);
        break;
        
      case 'Octágono':
        ShapeUtils.polygon(pg, 0, 0, this.size / 2, 8);
        break;
        
      case 'Línea':
        let savedFill = pg.drawingContext.fillStyle;
        pg.noFill();
        pg.stroke(this.color);
        pg.strokeWeight(this.size / 10);
        pg.line(-this.size / 2, 0, this.size / 2, 0);
        // Restaurar el fill original si es necesario
        if (Config.gradienteParticulas) {
          pg.drawingContext.fillStyle = savedFill;
        }
        break;
        
      case 'Curva':
        pg.beginShape();
        pg.curveVertex(-this.size / 2, 0);
        pg.curveVertex(-this.size / 4, -this.size / 4);
        pg.curveVertex(0, 0);
        pg.curveVertex(this.size / 4, this.size / 4);
        pg.curveVertex(this.size / 2, 0);
        pg.endShape();
        break;
        
      case 'Irregular':
        pg.beginShape();
        for (let v of this.formaIrregular) {
          pg.vertex(v.x, v.y);
        }
        pg.endShape(CLOSE);
        break;
        
      case 'Línea Larga':
        let savedFillLl = pg.drawingContext.fillStyle;
        pg.noFill();
        pg.stroke(this.color);
        pg.strokeWeight(this.size / 10);
        pg.line(-width * 2, 0, width * 2, 0);
        // Restaurar el fill original si es necesario
        if (Config.gradienteParticulas) {
          pg.drawingContext.fillStyle = savedFillLl;
        }
        break;
        
      default:
        pg.ellipse(0, 0, this.size, this.size);
    }
  }
  
  _dibujarRastro(pg) {
    // Calcular cuántas instancias del rastro dibujar (basado en cuántas posiciones históricas tenemos)
    let numPosiciones = this.historia.length;
    
    // Dibujar cada posición histórica como una instancia más pequeña de la partícula
    for (let i = 0; i < numPosiciones; i++) {
      let punto = this.historia[i];
      
      // Calcular el factor de escala basado en la posición en el historial
      // 0 = más viejo (más pequeño), 1 = más reciente (más grande)
      let t = i / (numPosiciones - 1);
      
      // Calcular el tamaño (escala) basado en el tamaño final configurado
      // Interpolar entre el tamaño final y el tamaño actual de la partícula
      let escala = lerp(Config.trailFinalSize, 1.0, t);
      
      // Calcular la opacidad (más transparente para los más viejos)
      let opacidad = lerp(50, Config.transparenciaParticulas, t);
      
      pg.push();
      pg.translate(punto.pos.x, punto.pos.y);
      pg.rotate(punto.rot);
      
      // Escalar para lograr el efecto de reducción gradual
      pg.scale(escala);
      
      // Aplicar color con transparencia decreciente para los puntos más viejos
      let col = color(this.color);
      col.setAlpha(opacidad);
      
      // Dibujar forma semitransparente
      pg.noStroke();
      pg.fill(col);
      
      // Dibujar la forma según la configuración actual
      this._dibujarFormaRastro(pg, escala);
      
      pg.pop();
    }
  }
  
  _dibujarFormaRastro(pg, escala) {
    // Usar la misma forma que la partícula actual, pero escalada
    switch (Config.formaParticula) {
      case 'Círculo':
        pg.ellipse(0, 0, this.size, this.size);
        break;
        
      case 'Cuadrado':
        pg.rectMode(CENTER);
        pg.rect(0, 0, this.size, this.size);
        break;
        
      case 'Triángulo':
        ShapeUtils.polygon(pg, 0, 0, this.size / 2, 3);
        break;
        
      case 'Estrella':
        ShapeUtils.star(pg, 0, 0, this.size / 2, this.size / 4, 5);
        break;
        
      case 'Pentágono':
        ShapeUtils.polygon(pg, 0, 0, this.size / 2, 5);
        break;
        
      case 'Hexágono':
        ShapeUtils.polygon(pg, 0, 0, this.size / 2, 6);
        break;
        
      case 'Octágono':
        ShapeUtils.polygon(pg, 0, 0, this.size / 2, 8);
        break;
        
      case 'Línea':
        pg.stroke(this.color);
        pg.strokeWeight(this.size / 10);
        pg.line(-this.size / 2, 0, this.size / 2, 0);
        break;
        
      case 'Curva':
        pg.beginShape();
        pg.curveVertex(-this.size / 2, 0);
        pg.curveVertex(-this.size / 4, -this.size / 4);
        pg.curveVertex(0, 0);
        pg.curveVertex(this.size / 4, this.size / 4);
        pg.curveVertex(this.size / 2, 0);
        pg.endShape();
        break;
        
      case 'Irregular':
        pg.beginShape();
        for (let v of this.formaIrregular) {
          pg.vertex(v.x, v.y);
        }
        pg.endShape(CLOSE);
        break;
        
      case 'Línea Larga':
        pg.stroke(this.color);
        pg.strokeWeight(this.size / 10);
        pg.line(-width * 2, 0, width * 2, 0);
        break;
        
      default:
        pg.ellipse(0, 0, this.size, this.size);
    }
  }
} 