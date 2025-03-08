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
    this.rotacion = random(TWO_PI);
    
    // Propiedades de color
    this.color = ColorUtils.obtenerColorAleatorio();
    this.alpha = Config.transparenciaParticulas;
    
    // Forma irregular para ese tipo de partícula
    this.formaIrregular = [];
    for (let i = 0; i < 5; i++) {
      this.formaIrregular.push(createVector(random(-this.size / 2, this.size / 2), random(-this.size / 2, this.size / 2)));
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
        this._movimientoAleatorio(0.5);
        break;
        
      case 'Gravedad':
        this._aplicarGravedad();
        break;
        
      case 'Caos':
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
      let fuerza = campo[indice].copy();
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
    // Crear atractores dinámicos
    let numAtractores = 3;
    for (let i = 0; i < numAtractores; i++) {
      // Posición del atractor basada en ruido
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
        
        // Alternar entre atracción y repulsión
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
    
    // Envolver en los bordes del canvas (toroidal)
    if (this.pos.x > width) this.pos.x = 0;
    else if (this.pos.x < 0) this.pos.x = width;
    
    if (this.pos.y > height) this.pos.y = 0;
    else if (this.pos.y < 0) this.pos.y = height;
    
    // Actualizar rotación
    this.rotacion += Config.rotacionParticula;
    
    // Actualizar historial para el rastro
    if (Config.mostrarRastro) {
      this.historia.push(createVector(this.pos.x, this.pos.y));
      if (this.historia.length > this.maxHistory) {
        this.historia.splice(0, 1);
      }
    }
  }

  mostrarEnLayer(pg) {
    pg.push();
    pg.translate(this.pos.x, this.pos.y);
    pg.rotate(this.rotacion);
    
    // Configurar estilo
    pg.noStroke();
    pg.fill(this.color);
    
    // Dibujar según la forma seleccionada
    if (Config.formaParticula === 'Círculo') {
      pg.ellipse(0, 0, this.size * 2, this.size * 2);
    } else if (Config.formaParticula === 'Cuadrado') {
      pg.rect(-this.size, -this.size, this.size * 2, this.size * 2);
    } else if (Config.formaParticula === 'Triángulo') {
      pg.triangle(0, -this.size, this.size, this.size, -this.size, this.size);
    } else if (Config.formaParticula === 'Irregular') {
      pg.beginShape();
      for (let v of this.formaIrregular) {
        pg.vertex(v.x, v.y);
      }
      pg.endShape(CLOSE);
    }
    
    pg.pop();
    
    // Dibujar rastro
    if (Config.mostrarRastro && this.historia.length > 1) {
      pg.noFill();
      pg.stroke(this.color);
      pg.strokeWeight(1);
      
      pg.beginShape();
      for (let i = 0; i < this.historia.length; i++) {
        let pos = this.historia[i];
        pg.vertex(pos.x, pos.y);
      }
      pg.endShape();
    }
  }
} 