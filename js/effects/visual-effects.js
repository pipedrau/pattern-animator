/**
 * visual-effects.js
 * Gestor de efectos visuales
 */
const VisualEffects = {
  sceneBuffer: null,        // Buffer principal de la escena
  effectsBuffer: null,      // Buffer para aplicar efectos
  noiseLayer: null,         // Capa para el ruido gráfico
  blooms: [],               // Capas para el efecto bloom
  aberrationOffset: 0,      // Desplazamiento para aberración cromática
  
  inicializar(width, height) {
    console.log("Inicializando efectos visuales");
    
    // Si ya existen buffers, destruirlos para liberar memoria
    if (this.sceneBuffer) {
      this.sceneBuffer.remove();
    }
    
    if (this.effectsBuffer) {
      this.effectsBuffer.remove();
    }
    
    if (this.noiseLayer) {
      this.noiseLayer.remove();
    }
    
    // Limpiar array de blooms
    this.blooms.forEach(bloom => {
      if (bloom) bloom.remove();
    });
    this.blooms = [];
    
    // Crear nuevos buffers con las dimensiones actualizadas
    this.sceneBuffer = createGraphics(width, height);
    this.effectsBuffer = createGraphics(width, height);
    this.noiseLayer = createGraphics(width, height);
    
    // Inicializar con fondo completamente opaco
    this.sceneBuffer.background(Config.colorFondo);
    
    // Inicializar capas para bloom si está activado
    if (Config.bloomActivo) {
      this._inicializarCapasBloom(width, height);
    }
    
    console.log(`Buffers de efectos inicializados con dimensiones ${width}x${height}`);
  },
  
  // Método para inicializar capas de bloom
  _inicializarCapasBloom(width, height) {
    // Crear 3 capas con tamaños decrecientes para el efecto bloom
    for (let i = 0; i < 3; i++) {
      // Cada capa es más pequeña que la anterior para optimizar
      const escala = 1 / Math.pow(2, i);
      const bloomLayer = createGraphics(
        Math.floor(width * escala), 
        Math.floor(height * escala)
      );
      bloomLayer.clear();
      this.blooms.push(bloomLayer);
    }
  },
  
  // Aplicar ruido gráfico como capa final
  aplicarRuidoGrafico() {
    if (Config.ruidoGrafico <= 0) return;
    
    // Limpiar la capa de ruido
    this.noiseLayer.clear();
    
    // Si la intensidad es muy baja, no hacer nada
    if (Config.ruidoGrafico < 5) return;
    
    // Configuración simple
    this.noiseLayer.noStroke();
    this.noiseLayer.fill(255, Config.ruidoGrafico);
    
    // Dibujamos puntos aleatorios proporcionales al tamaño del canvas
    // Esta implementación es más simple y eficiente
    const puntos = width * height * 0.01;
    for (let i = 0; i < puntos; i++) {
      const x = random(width);
      const y = random(height);
      this.noiseLayer.rect(x, y, 1, 1);
    }
    
    // Aplicar el ruido encima de la escena
    blendMode(SCREEN);
    image(this.noiseLayer, 0, 0);
    blendMode(BLEND);
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
  
  // Aplicar desenfoque altamente optimizado
  aplicarDesenfoque() {
    if (Config.desenfoque <= 0) return;
    
    // La clave de la optimización es usar una resolución extremadamente baja para el desenfoque
    // y luego escalar de vuelta - técnica usada en glassmorphism en sitios web modernos
    
    // Calcular la escala basada en la intensidad del desenfoque
    // Más desenfoque = menor resolución = mejor rendimiento
    const blurScale = map(Config.desenfoque, 1, 100, 0.5, 0.05); // Reducido a 0.05 para desenfoques más extremos
    const blurWidth = Math.max(8, Math.floor(width * blurScale));
    const blurHeight = Math.max(8, Math.floor(height * blurScale));
    
    // Crear o redimensionar buffer de desenfoque según sea necesario
    if (!this._blurBuffer || 
        this._blurBuffer.width !== blurWidth || 
        this._blurBuffer.height !== blurHeight) {
      if (this._blurBuffer) this._blurBuffer.remove();
      this._blurBuffer = createGraphics(blurWidth, blurHeight);
    }
    
    // Sistema de caché inteligente: solo actualizar cuando sea necesario
    // Esto evita recalcular el desenfoque cada frame
    if (!this._cachedBlurValue || 
        this._cachedBlurValue !== Config.desenfoque || 
        frameCount % 10 === 0) { // Actualizar periódicamente para animaciones
      
      // Guardar valor para caché
      this._cachedBlurValue = Config.desenfoque;
      
      // Copiar la imagen actual al buffer pequeño (esto ya produce un primer nivel de desenfoque)
      this._blurBuffer.clear();
      this._blurBuffer.image(this.effectsBuffer, 0, 0, blurWidth, blurHeight);
      
      // Aplicar desenfoque adicional dependiendo de la intensidad
      // Para valores bajos, el reescalado ya proporciona suficiente desenfoque
      if (Config.desenfoque > 20) {
        this._blurBuffer.filter(BLUR, map(Config.desenfoque, 20, 100, 1, 6)); // Aumentado a 6 para desenfoques más intensos
        
        // Para valores extremos, aplicar una segunda pasada de desenfoque
        if (Config.desenfoque > 80) {
          this._blurBuffer.filter(BLUR, map(Config.desenfoque, 80, 100, 2, 4)); // Segunda pasada para efecto ultra profundo
        }
      }
    }
    
    // Dibujar el desenfoque sobre el buffer de efectos
    // Usar el modo BLEND para preservar detalles
    this.effectsBuffer.clear();
    this.effectsBuffer.image(this._blurBuffer, 0, 0, width, height);
  },
  
  // Aplicar efecto de pixelado
  aplicarPixelado() {
    // Evitar procesamiento si el tamaño es muy pequeño
    if (Config.pixeladoTamano <= 1) return;
    
    // Calcular el tamaño del píxel (asegurándonos de que sea un entero)
    const pixelSize = Math.max(1, Math.floor(Config.pixeladoTamano));
    
    // Para píxeles muy grandes, el cálculo normal podría dar un buffer demasiado pequeño
    // Establecemos un tamaño mínimo de 4 píxeles para evitar problemas de renderizado
    const tempWidth = Math.max(4, Math.ceil(width / pixelSize));
    const tempHeight = Math.max(4, Math.ceil(height / pixelSize));
    
    // Usar un buffer temporal para reducir la resolución
    // Solo crear un nuevo buffer si cambia el tamaño o es la primera vez
    if (!this._pixelBuffer || this._pixelBuffer.width !== tempWidth || this._pixelBuffer.height !== tempHeight) {
      if (this._pixelBuffer) this._pixelBuffer.remove();
      this._pixelBuffer = createGraphics(tempWidth, tempHeight);
    }
    
    // Copiar el buffer de efectos a menor resolución
    this._pixelBuffer.clear();
    this._pixelBuffer.image(this.effectsBuffer, 0, 0, tempWidth, tempHeight);
    
    // Dibujar la imagen de baja resolución de vuelta al buffer de efectos, ampliándola
    this.effectsBuffer.clear();
    this.effectsBuffer.noSmooth(); // Desactivar el suavizado para un efecto pixelado más nítido
    this.effectsBuffer.image(this._pixelBuffer, 0, 0, width, height);
    this.effectsBuffer.smooth(); // Restaurar el suavizado para otros efectos
  },
  
  // Aplicar efecto bloom (resplandor) optimizado
  aplicarBloom() {
    if (Config.bloomIntensidad <= 0) return;
    
    // Crear un buffer de baja resolución para mejor rendimiento
    if (!this._bloomBuffer) {
      this._bloomBuffer = createGraphics(width/4, height/4);
    }
    
    // Copiar la imagen actual al buffer de bloom a menor resolución
    this._bloomBuffer.clear();
    this._bloomBuffer.image(this.effectsBuffer, 0, 0, this._bloomBuffer.width, this._bloomBuffer.height);
    
    // Aplicar desenfoque para crear el efecto de resplandor
    // Una sola pasada con valor alto es más eficiente que múltiples pasadas
    this._bloomBuffer.filter(BLUR, map(Config.bloomIntensidad, 0, 100, 4, 12));
    
    // Ajustar el color del bloom si es diferente al blanco
    if (Config.bloomColor !== '#FFFFFF') {
      this._bloomBuffer.tint(color(Config.bloomColor));
    }
    
    // Mezclar el bloom con la imagen original
    const intensidad = map(Config.bloomIntensidad, 0, 100, 100, 200);
    
    // Dibujar el bloom sobre el buffer de efectos
    this.effectsBuffer.blendMode(ADD);  // ADD es mejor que SCREEN para el efecto bloom
    this.effectsBuffer.tint(255, intensidad);
    this.effectsBuffer.image(this._bloomBuffer, 0, 0, width, height);
    this.effectsBuffer.blendMode(BLEND);
    this.effectsBuffer.noTint();
  },
  
  // Aplicar efecto de semitono optimizado
  aplicarSemitono() {
    if (Config.semitonoEscala <= 0) return;
    
    // Usar un tamaño de punto adaptado a la escala
    const pointSize = map(Config.semitonoEscala, 0, 1, 4, 12);
    
    // Crear un buffer para el efecto de semitono
    if (!this._semitonoBuffer) {
      this._semitonoBuffer = createGraphics(width, height);
    }
    
    // Guardar el buffer original para aplicar el efecto con modos de fusión
    let originalBuffer = createGraphics(width, height);
    originalBuffer.image(this.effectsBuffer, 0, 0);
    
    // Limpiar el buffer de semitono
    this._semitonoBuffer.clear();
    this._semitonoBuffer.background(255);
    
    // Reducir la cantidad de puntos mediante un paso más grande
    // Usamos un valor mínimo de 2 para evitar demasiados puntos
    const step = Math.max(2, Math.floor(pointSize));
    const cols = Math.ceil(width / step);
    const rows = Math.ceil(height / step);
    
    // Configurar el estilo de dibujo base
    this._semitonoBuffer.noStroke();
    
    // Optimización: copiar datos una sola vez
    const tempBuffer = createGraphics(width, height);
    tempBuffer.image(this.effectsBuffer, 0, 0);
    tempBuffer.loadPixels();
    
    // Dibujar puntos basados en la luminosidad
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        // Calcular posición
        const posX = x * step;
        const posY = y * step;
        
        // Si está fuera del canvas, saltar
        if (posX >= width || posY >= height) continue;
        
        // Obtener color del pixel - más eficiente que get()
        const index = (posY * width + posX) * 4;
        if (index >= tempBuffer.pixels.length) continue;
        
        const r = tempBuffer.pixels[index];
        const g = tempBuffer.pixels[index + 1];
        const b = tempBuffer.pixels[index + 2];
        
        // Calcular brillo
        const brightness = (r + g + b) / 3;
        
        // Tamaño del punto basado en brillo (invertido)
        // Ajustamos el mínimo para que nunca sea cero
        const dotSize = map(brightness, 0, 255, pointSize * 0.9, Math.max(1, pointSize * 0.1));
        
        // Establecer el color del punto
        if (Config.semitonoPreservarColores) {
          // Usar el color original
          this._semitonoBuffer.fill(r, g, b);
        } else {
          // Modo blanco y negro tradicional
          this._semitonoBuffer.fill(0);
        }
        
        // Dibujar solo si tiene tamaño visible
        if (dotSize > 0.5) {
          this._semitonoBuffer.ellipse(posX, posY, dotSize, dotSize);
        }
      }
    }
    
    // Liberar memoria
    tempBuffer.remove();
    
    // Aplicar el resultado al buffer de efectos según el modo de fusión seleccionado
    this.effectsBuffer.clear();
    
    // Primero restauramos la imagen original
    if (Config.semitonoModoFusion !== 'normal') {
      this.effectsBuffer.image(originalBuffer, 0, 0);
    }
    
    // Aplicar diferentes modos de fusión
    switch (Config.semitonoModoFusion) {
      case 'superposicion':
        this.effectsBuffer.blendMode(OVERLAY);
        break;
      case 'multiplicar':
        this.effectsBuffer.blendMode(MULTIPLY);
        break;
      case 'negativo':
        this.effectsBuffer.blendMode(DIFFERENCE);
        break;
      default: // 'normal'
        this.effectsBuffer.blendMode(BLEND);
        break;
    }
    
    // Dibujar el semitono con el modo de fusión seleccionado
    this.effectsBuffer.image(this._semitonoBuffer, 0, 0);
    this.effectsBuffer.blendMode(BLEND); // Restaurar el modo normal
    
    // Liberar memoria
    originalBuffer.remove();
  },
  
  // Aplicar aberración cromática mejorada con efecto radial
  aplicarAberracionCromatica() {
    if (Config.aberracionIntensidad <= 0) return;
    
    // Crear buffer temporal si no existe
    if (!this._aberrationBuffer) {
      this._aberrationBuffer = createGraphics(width, height);
    }
    
    // Crear buffers separados para cada canal si no existen
    if (!this._redChannel) {
      this._redChannel = createGraphics(width, height);
      this._blueChannel = createGraphics(width, height);
    }
    
    // Calcular desplazamiento basado en intensidad - más exagerado para efecto notorio
    const maxOffset = map(Config.aberracionIntensidad, 0, 100, 2, 20);
    
    // Preparar canales separados
    this._redChannel.clear();
    this._blueChannel.clear();
    
    // Copiar la imagen original a los canales de color
    this._redChannel.image(this.effectsBuffer, 0, 0);
    this._blueChannel.image(this.effectsBuffer, 0, 0);
    
    // Aplicar transformación radial a los canales rojo y azul
    // El canal verde se queda en la posición original
    this._redChannel.loadPixels();
    this._blueChannel.loadPixels();
    this.effectsBuffer.loadPixels();
    
    // Solo procesamos una fracción de los píxeles para mantener el rendimiento
    // Saltar píxeles y usar una cuadrícula más espaciada
    const skipFactor = 2; // Procesar 1 de cada 2 píxeles
    
    // Centro de la imagen para el efecto radial
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Generar un mapa de desplazamiento más exagerado en los bordes
    for (let y = 0; y < height; y += skipFactor) {
      for (let x = 0; x < width; x += skipFactor) {
        // Calcular distancia desde el centro (normalizada de 0 a 1)
        const dx = (x - centerX) / (width / 2);
        const dy = (y - centerY) / (height / 2);
        const distFactor = Math.min(1, Math.sqrt(dx*dx + dy*dy));
        
        // Desplazamiento radial - más intenso en los bordes
        const offsetFactor = distFactor * maxOffset;
        
        // Ángulo desde el centro
        const angle = Math.atan2(dy, dx);
        
        // Calcular desplazamientos con un componente radial
        const redOffsetX = Math.cos(angle) * offsetFactor;
        const redOffsetY = Math.sin(angle) * offsetFactor;
        const blueOffsetX = -redOffsetX;
        const blueOffsetY = -redOffsetY;
        
        // Posiciones de destino para los canales rojo y azul
        const redX = Math.floor(x + redOffsetX);
        const redY = Math.floor(y + redOffsetY);
        const blueX = Math.floor(x + blueOffsetX);
        const blueY = Math.floor(y + blueOffsetY);
        
        // Verificar límites
        if (redX >= 0 && redX < width && redY >= 0 && redY < height &&
            blueX >= 0 && blueX < width && blueY >= 0 && blueY < height) {
          // Índices en los arrays de píxeles
          const srcIdx = (y * width + x) * 4;
          const redIdx = (redY * width + redX) * 4;
          const blueIdx = (blueY * width + blueX) * 4;
          
          // Aplicar componente rojo al canal rojo
          this._redChannel.pixels[redIdx] = this.effectsBuffer.pixels[srcIdx];     // R
          this._redChannel.pixels[redIdx + 1] = 0;                                // G
          this._redChannel.pixels[redIdx + 2] = 0;                                // B
          
          // Aplicar componente azul al canal azul
          this._blueChannel.pixels[blueIdx] = 0;                                  // R
          this._blueChannel.pixels[blueIdx + 1] = 0;                              // G
          this._blueChannel.pixels[blueIdx + 2] = this.effectsBuffer.pixels[srcIdx + 2]; // B
        }
      }
    }
    
    // Actualizar los píxeles modificados
    this._redChannel.updatePixels();
    this._blueChannel.updatePixels();
    
    // Combinar los canales con modo ADD
    this._aberrationBuffer.clear();
    
    // Canal verde (sin desplazamiento) - lo dejamos en la imagen original
    this._aberrationBuffer.image(this.effectsBuffer, 0, 0);
    
    // Mezclar canales rojo y azul
    this._aberrationBuffer.blendMode(ADD);
    this._aberrationBuffer.tint(255, 0, 0, 200); // Rojo
    this._aberrationBuffer.image(this._redChannel, 0, 0);
    this._aberrationBuffer.tint(0, 0, 255, 200); // Azul
    this._aberrationBuffer.image(this._blueChannel, 0, 0);
    this._aberrationBuffer.blendMode(BLEND);
    this._aberrationBuffer.noTint();
    
    // Aplicar el resultado al buffer de efectos
    this.effectsBuffer.clear();
    this.effectsBuffer.image(this._aberrationBuffer, 0, 0);
  },
  
  // Aplicar efecto glitch simplificado y visible
  aplicarGlitch() {
    if (Config.glitchIntensidad <= 0) return;
    
    // Crear buffer temporal si no existe
    if (!this._glitchBuffer) {
      this._glitchBuffer = createGraphics(width, height);
    }
    
    // Intensidad del efecto
    const intensidad = map(Config.glitchIntensidad, 0, 100, 0.2, 1.0);
    
    // Actualizar efecto cada cierto tiempo o por azar
    if (frameCount % 10 === 0 || random() < intensidad * 0.2) {
      // Copiar el buffer de efectos al buffer de glitch
      this._glitchBuffer.clear();
      this._glitchBuffer.image(this.effectsBuffer, 0, 0);
      
      // Efecto 1: Líneas horizontales desplazadas (más visibles)
      const numLines = floor(random(3, 10) * intensidad);
      
      for (let i = 0; i < numLines; i++) {
        const y = random(height);
        const h = random(5, 20) * intensidad;
        const xOffset = random(-30, 30) * intensidad;
        
        // Cortar y desplazar una línea horizontal
        const lineImg = this._glitchBuffer.get(0, y, width, h);
        this._glitchBuffer.fill(0, 100); // Dejar un rastro negro semitransparente
        this._glitchBuffer.rect(0, y, width, h);
        this._glitchBuffer.image(lineImg, xOffset, y);
      }
      
      // Efecto 2: Desplazamiento de colores RGB más visible
      if (random() < intensidad * 0.7) {
        // Crear una copia con desplazamiento RGB
        const tempImg = this._glitchBuffer.get();
        
        // Desplazar canal rojo
        this._glitchBuffer.tint(255, 0, 0, 150);
        this._glitchBuffer.image(tempImg, random(-10, 10) * intensidad, 0);
        
        // Desplazar canal azul
        this._glitchBuffer.tint(0, 0, 255, 150);
        this._glitchBuffer.image(tempImg, random(-10, 10) * intensidad, 0);
        
        this._glitchBuffer.noTint();
      }
      
      // Efecto 3: Bloques de "corrupción digital"
      const numBlocks = floor(random(2, 6) * intensidad);
      
      for (let i = 0; i < numBlocks; i++) {
        if (random() < intensidad * 0.5) {
          const blockX = random(width);
          const blockY = random(height);
          const blockW = random(20, 80) * intensidad;
          const blockH = random(5, 20);
          
          // Usar colores vivos para que sea más visible
          this._glitchBuffer.fill(random(255), random(255), random(255), 200);
          this._glitchBuffer.noStroke();
          this._glitchBuffer.rect(blockX, blockY, blockW, blockH);
        }
      }
    }
    
    // Aplicar el efecto al buffer principal
    this.effectsBuffer.image(this._glitchBuffer, 0, 0);
  },
  
  // Método auxiliar para la distorsión RGB en el efecto glitch
  _aplicarDistorsionRGB(intensidad) {
    // Seleccionar un canal aleatorio para distorsionar
    const canal = Math.floor(random(3)); // 0=R, 1=G, 2=B
    
    // Obtener la imagen como array de píxeles
    loadPixels();
    
    // Distorsionar el canal seleccionado
    for (let i = 0; i < pixels.length; i += 4) {
      if (random() < 0.1 * intensidad) { // Solo afectar algunos píxeles
        pixels[i + canal] = random(100, 255); // Sobresaturar el canal
      }
    }
    
    updatePixels();
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
  },
  
  // Aplicar todos los efectos en secuencia como post-procesado
  aplicarEfectos() {
    // Preparar el buffer de efectos
    this.effectsBuffer.clear();
    this.effectsBuffer.image(this.sceneBuffer, 0, 0);
    
    // Ahora todos los efectos se aplican al buffer de efectos, no directamente al canvas
    // Esto significa que procesamos una sola imagen en lugar de cada partícula individual
    
    // Orden optimizado para mejor resultado visual y rendimiento
    
    // =============================================
    // PRIMERA FASE: EFECTOS ANTES DEL DESENFOQUE
    // =============================================
    
    // 1. Primero el pixelado (afecta la base de la imagen) - solo si no está configurado para aplicarse sobre el desenfoque
    if (Config.pixeladoActivo && Config.pixeladoTamano > 1 && !Config.pixeladoSobreDesenfoque) {
      this.aplicarPixelado();
    }
    
    // 2. Glitch - solo si no está configurado para aplicarse sobre el desenfoque
    if (Config.glitchActivo && Config.glitchIntensidad > 0 && !Config.glitchSobreDesenfoque) {
      this.aplicarGlitch();
    }
    
    // 3. Semitono - solo si no está configurado para aplicarse sobre el desenfoque
    if (Config.semitonoActivo && Config.semitonoEscala > 0 && !Config.semitonoSobreDesenfoque && 
        !(Config.pixeladoActivo && Config.pixeladoTamano > 1 && !Config.pixeladoSobreDesenfoque)) {
      this.aplicarSemitono();
    }
    
    // 4. Aberración cromática (siempre antes del desenfoque para preservar definición)
    if (Config.aberracionActiva && Config.aberracionIntensidad > 0) {
      this.aplicarAberracionCromatica();
    }
    
    // 5. Desenfoque
    if (Config.desenfoque > 0) {
      this.aplicarDesenfoque();
    }
    
    // 6. Bloom (después del desenfoque para un efecto más suave)
    if (Config.bloomActivo && Config.bloomIntensidad > 0) {
      this.aplicarBloom();
    }
    
    // =============================================
    // SEGUNDA FASE: EFECTOS SOBRE EL DESENFOQUE
    // =============================================
    
    // 7. Pixelado sobre desenfoque
    if (Config.pixeladoActivo && Config.pixeladoTamano > 1 && Config.pixeladoSobreDesenfoque) {
      this.aplicarPixelado();
    }
    
    // 8. Glitch sobre desenfoque
    if (Config.glitchActivo && Config.glitchIntensidad > 0 && Config.glitchSobreDesenfoque) {
      this.aplicarGlitch();
    }
    
    // 9. Semitono sobre desenfoque
    if (Config.semitonoActivo && Config.semitonoEscala > 0 && Config.semitonoSobreDesenfoque) {
      this.aplicarSemitono();
    }
    
    // Dibujar el buffer de efectos procesado en el canvas principal
    blendMode(BLEND);
    image(this.effectsBuffer, 0, 0);
    
    // 10. Ruido gráfico (último porque se aplica encima de todo)
    if (Config.ruidoGrafico > 0) {
      this.aplicarRuidoGrafico();
    }
    
    // Restaurar estado de renderizado
    blendMode(BLEND);
    noTint();
  }
}; 