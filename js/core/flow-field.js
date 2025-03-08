/**
 * flow-field.js
 * Módulo para gestionar el campo de flujo
 */
const FlowField = {
  campo: [],
  cols: 0,
  rows: 0,
  
  inicializar(width, height, escala) {
    console.log("Inicializando campo de flujo");
    
    this.cols = floor(width / escala);
    this.rows = floor(height / escala);
    console.log(`Dimensiones del campo: ${this.cols} x ${this.rows}`);
    
    // Inicializar el array si no existe o tiene tamaño incorrecto
    if (this.campo.length !== this.cols * this.rows) {
      this.campo = new Array(this.cols * this.rows);
      console.log(`Creado campo de flujo con ${this.campo.length} elementos`);
    }
    
    return {
      cols: this.cols,
      rows: this.rows
    };
  },
  
  calcular() {
    let yOffset = 0;
    for (let y = 0; y < this.rows; y++) {
      let xOffset = 0;
      for (let x = 0; x < this.cols; x++) {
        let indice = x + y * this.cols;
        
        // Usar diferentes dimensiones de ruido para variedad
        let angulo = noise(xOffset, yOffset, frameCount * 0.01) * TWO_PI * 4;
        
        // Crear vector con el ángulo calculado
        let vector = p5.Vector.fromAngle(angulo);
        vector.setMag(1);
        
        // Guardar el vector en el campo
        this.campo[indice] = vector;
        
        xOffset += 0.1;
      }
      yOffset += 0.1;
    }
    
    return this.campo;
  },
  
  // Visualiza el campo de flujo (útil para depuración)
  visualizar(pg) {
    let escala = Config.escala;
    
    pg.push();
    pg.stroke(100, 100, 255, 100);
    pg.strokeWeight(1);
    
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let indice = x + y * this.cols;
        let vector = this.campo[indice];
        
        if (!vector) continue;
        
        // Posición central del cuadro
        let posX = x * escala + escala / 2;
        let posY = y * escala + escala / 2;
        
        // Dibujar vector
        pg.push();
        pg.translate(posX, posY);
        pg.line(0, 0, vector.x * escala * 0.5, vector.y * escala * 0.5);
        
        // Flecha en la punta
        let angulo = vector.heading();
        pg.rotate(angulo);
        pg.line(0, 0, escala * 0.3, 0);
        pg.pop();
      }
    }
    
    pg.pop();
  }
}; 