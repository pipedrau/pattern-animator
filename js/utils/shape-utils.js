/**
 * shape-utils.js
 * Utilidades para dibujar formas geométricas
 */
const ShapeUtils = {
  /**
   * Dibuja un polígono regular
   * @param {p5.Graphics} pg - El contexto gráfico donde dibujar
   * @param {number} x - Coordenada X del centro
   * @param {number} y - Coordenada Y del centro
   * @param {number} radius - Radio del polígono
   * @param {number} npoints - Número de puntos (lados)
   */
  polygon(pg, x, y, radius, npoints) {
    let angle = TWO_PI / npoints;
    pg.beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius;
      let sy = y + sin(a) * radius;
      pg.vertex(sx, sy);
    }
    pg.endShape(CLOSE);
  },
  
  /**
   * Dibuja una estrella
   * @param {p5.Graphics} pg - El contexto gráfico donde dibujar
   * @param {number} x - Coordenada X del centro
   * @param {number} y - Coordenada Y del centro
   * @param {number} radius1 - Radio exterior
   * @param {number} radius2 - Radio interior
   * @param {number} npoints - Número de puntas
   */
  star(pg, x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    pg.beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius1;
      let sy = y + sin(a) * radius1;
      pg.vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius2;
      sy = y + sin(a + halfAngle) * radius2;
      pg.vertex(sx, sy);
    }
    pg.endShape(CLOSE);
  },
  
  /**
   * Dibuja un degradado
   * @param {p5.Graphics} pg - El contexto gráfico donde dibujar
   * @param {number} x - Coordenada X inicial
   * @param {number} y - Coordenada Y inicial
   * @param {number} w - Ancho
   * @param {number} h - Alto
   * @param {p5.Color} c1 - Color inicial
   * @param {p5.Color} c2 - Color final
   * @param {string} axis - Eje del degradado ('X' o 'Y')
   */
  setGradient(pg, x, y, w, h, c1, c2, axis) {
    pg.noFill();
    if (axis === 'Y') {
      for (let i = y; i <= y + h; i++) {
        let inter = map(i, y, y + h, 0, 1);
        let c = lerpColor(color(c1), color(c2), inter);
        pg.stroke(c);
        pg.line(x, i, x + w, i);
      }
    } else if (axis === 'X') {
      for (let i = x; i <= x + w; i++) {
        let inter = map(i, x, x + w, 0, 1);
        let c = lerpColor(color(c1), color(c2), inter);
        pg.stroke(c);
        pg.line(i, y, i, y + h);
      }
    }
  }
}; 