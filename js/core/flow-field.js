/**
 * flow-field.js
 * Clase para generar y gestionar un campo de vectores de flujo
 */
const FlowField = {
  campo: [],
  cols: 0,
  rows: 0,
  zOffset: 0,
  
  inicializar(width, height, escala) {
    console.log("Inicializando campo de flujo");
    
    // Calcular número de columnas y filas basado en las dimensiones y la escala
    this.cols = Math.floor(width / escala);
    this.rows = Math.floor(height / escala);
    
    console.log(`Campo de flujo: ${this.cols} x ${this.rows} celdas`);
    
    // Inicializar el campo con vectores vacíos
    this.campo = new Array(this.cols * this.rows);
    
    // Inicializar el offset para el ruido Perlin
    this.zOffset = random(1000);
    
    return {
      cols: this.cols,
      rows: this.rows
    };
  },
  
  calcular() {
    // Calcular campo de flujo basado en ruido Perlin
    let yoff = 0;
    
    for (let y = 0; y < this.rows; y++) {
      let xoff = 0;
      
      for (let x = 0; x < this.cols; x++) {
        // Calcular índice en el arreglo unidimensional
        let idx = x + y * this.cols;
        
        // Usar ruido Perlin para obtener un ángulo
        // Multiplicamos por TWO_PI * 4 para obtener más variedad en las direcciones
        let angulo = noise(xoff, yoff, this.zOffset) * TWO_PI * 4;
        
        // Crear vector a partir del ángulo
        let vector = p5.Vector.fromAngle(angulo);
        
        // Normalizar el vector (magnitud 1)
        vector.setMag(1);
        
        // Almacenar el vector en el campo
        this.campo[idx] = vector;
        
        // Incrementar offset para el siguiente punto
        xoff += 0.1;
      }
      
      yoff += 0.1;
    }
    
    // Incrementar offset para animación en el tiempo
    this.zOffset += 0.005;
    
    return this.campo;
  },
  
  // Método para visualizar el campo (útil para depuración)
  visualizar(pg) {
    pg.stroke(128, 128, 255, 70);
    pg.strokeWeight(1);
    
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let idx = x + y * this.cols;
        let vector = this.campo[idx];
        
        if (vector) {
          let escala = Config.escala;
          let cx = x * escala + escala / 2;
          let cy = y * escala + escala / 2;
          
          pg.push();
          pg.translate(cx, cy);
          pg.line(0, 0, vector.x * escala * 0.8, vector.y * escala * 0.8);
          
          // Dibujar una pequeña flecha en la punta
          let angulo = vector.heading();
          pg.rotate(angulo);
          pg.line(escala * 0.6, 0, escala * 0.5, escala * 0.1);
          pg.line(escala * 0.6, 0, escala * 0.5, -escala * 0.1);
          pg.pop();
        }
      }
    }
  }
}; 