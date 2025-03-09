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
  
  // Aplicar ruido gráfico con rendimiento extremadamente optimizado
  aplicarRuidoGrafico() {
    if (Config.ruidoGrafico <= 0) return;
    
    // Cachear el efecto de ruido con puntos prerenderizados
    // Solo regenerar cuando cambie la configuración o cada 15 frames
    if (!this._cachedNoiseFrame || 
        this._cachedNoiseIntensity !== Config.ruidoGrafico || 
        frameCount % 15 === 0) {
      
      // Actualizar valor cacheado
      this._cachedNoiseIntensity = Config.ruidoGrafico;
      this._cachedNoiseFrame = frameCount;
      
      // Limpiar la capa de ruido
    this.noiseLayer.clear();
      
      // Si la intensidad es muy baja, no hacer nada
      if (Config.ruidoGrafico < 5) return;
      
      // Puntos de ruido prerenderizados
      const intensidad = map(Config.ruidoGrafico, 0, 100, 0.1, 1.0);
      
      // Técnica de puntos aleatorios para simular ruido
      // Usar modelo de densidad variable según intensidad
    this.noiseLayer.noStroke();
      
      // Optimización: Usar puntos estratégicos en lugar de puntos completamente aleatorios
      // Esto reduce la cantidad de operaciones de dibujo
      
      // Crear una cuadrícula de puntos posibles
      const gridSize = map(Config.ruidoGrafico, 0, 100, 20, 5);
      const cols = Math.ceil(width / gridSize);
      const rows = Math.ceil(height / gridSize);
      
      // Para cada celda de la cuadrícula, decidir si dibujar un punto
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Probabilidad basada en intensidad
          if (random() < intensidad * 0.3) {
            // Posición con ligera variación aleatoria dentro de la celda
            const posX = x * gridSize + random(-2, 2);
            const posY = y * gridSize + random(-2, 2);
            
            // Tamaño y opacidad variables
            const tamano = random(0.5, 2.5);
            const opacidad = random(50, 200) * (intensidad * 0.8);
            
            // Color aleatorio para ruido más natural
            this.noiseLayer.fill(random(180, 255), opacidad);
            
            // Usar rectángulos es más eficiente que círculos
            this.noiseLayer.rect(posX, posY, tamano, tamano);
          }
        }
      }
    }
    
    // Aplicar el ruido encima de la escena con blend mode para mejor integración
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
  
  // Aplicar desenfoque optimizado como capa de ajuste
  aplicarDesenfoque() {
    if (Config.desenfoque <= 0) return;
    
    // Crear o reutilizar el buffer de desenfoque
    if (!this._blurBuffer) {
      // Para mayor rendimiento, usamos un buffer más pequeño
      this._blurBuffer = createGraphics(Math.floor(width * 0.5), Math.floor(height * 0.5));
    }
    
    // Calcular la intensidad del desenfoque
    const blurAmount = map(Config.desenfoque, 0, 10, 5, 80);
    
    // Recalcular solo cuando cambie la intensidad o cada 10 frames para animaciones
    if (this._cachedBlurValue !== Config.desenfoque || !this._blurTexture || frameCount % 10 === 0) {
      this._cachedBlurValue = Config.desenfoque;
      
      // Limpiar el buffer
      this._blurBuffer.clear();
      
      // Copiar la escena actual pero a menor resolución para rendimiento
      this._blurBuffer.image(get(), 0, 0, this._blurBuffer.width, this._blurBuffer.height);
      
      // Simular desenfoque mediante superposición de imágenes ligeramente desplazadas
      // Esta técnica es mucho más eficiente que usar filter(BLUR)
      if (!this._blurTexture) {
        this._blurTexture = createGraphics(this._blurBuffer.width, this._blurBuffer.height);
      }
      
      // Guardar imagen original
      this._blurTexture.clear();
      this._blurTexture.image(this._blurBuffer, 0, 0);
      
      // Limpiar buffer para aplicar el efecto
      this._blurBuffer.clear();
      
      // Intensidad basada en la configuración
      const desplazamiento = map(Config.desenfoque, 0, 10, 1, 4);
      
      // Simular desenfoque usando superposición de imágenes con poca opacidad
      this._blurBuffer.blendMode(BLEND);
      this._blurBuffer.tint(255, 255, 255, 255); // Imagen original a full opacidad
      this._blurBuffer.image(this._blurTexture, 0, 0);
      
      // Dibujar múltiples copias con poca opacidad y desplazamiento
      this._blurBuffer.tint(255, 255, 255, 50); // Baja opacidad para las copias
      
      // Menos iteraciones = mejor rendimiento
      for (let i = 1; i <= 3; i++) {
        const offset = i * desplazamiento;
        // 8 direcciones para simular desenfoque radial
        this._blurBuffer.image(this._blurTexture, offset, 0);
        this._blurBuffer.image(this._blurTexture, -offset, 0);
        this._blurBuffer.image(this._blurTexture, 0, offset);
        this._blurBuffer.image(this._blurTexture, 0, -offset);
      }
      
      this._blurBuffer.noTint();
    }
    
    // Aplicar el desenfoque escalándolo de vuelta al tamaño completo
    blendMode(BLEND);
    
    // La opacidad controla la intensidad del efecto
    tint(255, blurAmount);
    image(this._blurBuffer, 0, 0, width, height);
    noTint();
  },
  
  // Aplicar efecto pixelado optimizado
  aplicarPixelado() {
    if (!Config.pixeladoActivo || Config.pixeladoTamano <= 1) return;
    
    // Cachear el efecto pixelado para no recalcularlo en cada frame
    if (this._cachedPixelSize !== Config.pixeladoTamano || !this._pixelBuffer || frameCount % 15 === 0) {
      this._cachedPixelSize = Config.pixeladoTamano;
      
      // Crear buffer si no existe, o redimensionarlo si es necesario
      if (!this._pixelBuffer || this._pixelBuffer.width !== width || this._pixelBuffer.height !== height) {
        if (this._pixelBuffer) this._pixelBuffer.remove();
        this._pixelBuffer = createGraphics(width, height);
      }
      
      // Calcular el tamaño del píxel (entre 2 y 32)
      const pixelSize = Math.floor(map(Config.pixeladoTamano, 1, 100, 2, 32));
      
      // Obtener la imagen actual para pixelarla
      const img = get();
      
      // Limpiar el buffer
      this._pixelBuffer.clear();
      this._pixelBuffer.noStroke();
      
      // Dibujar pixeles grandes sobre la imagen original
      // Optimización: reducir la cantidad de operaciones de dibujo
      const stepsX = Math.ceil(width / pixelSize);
      const stepsY = Math.ceil(height / pixelSize);
      
      for (let y = 0; y < stepsY; y++) {
        for (let x = 0; x < stepsX; x++) {
          // Coordenadas en la imagen original
          const srcX = x * pixelSize;
          const srcY = y * pixelSize;
          
          // Obtener el color de un punto en el centro del píxel grande
          // para mejor representación visual
          const sampleX = Math.min(srcX + Math.floor(pixelSize/2), width-1);
          const sampleY = Math.min(srcY + Math.floor(pixelSize/2), height-1);
          
          // Obtener el color usando get() que es más preciso que los pixels[]
          const col = img.get(sampleX, sampleY);
          
          // Dibujar un rectángulo con ese color
          this._pixelBuffer.fill(col);
          
          // Asegurarse de que no dibuje fuera del canvas
          const drawWidth = Math.min(pixelSize, width - srcX);
          const drawHeight = Math.min(pixelSize, height - srcY);
          
          this._pixelBuffer.rect(srcX, srcY, drawWidth, drawHeight);
        }
      }
      
      // Liberar memoria
      img.remove();
    }
    
    // Aplicar el efecto pixelado
    image(this._pixelBuffer, 0, 0);
  },
  
  // Aplicar efecto bloom (resplandor) altamente optimizado
  aplicarBloom() {
    if (!Config.bloomActivo || Config.bloomIntensidad <= 0) return;
    
    // Usar un buffer más pequeño para mejorar rendimiento
    const bloomScale = 0.25; // Sólo 1/4 del tamaño original = mucho más rápido
    
    // Optimización: cachear el efecto bloom y solo recalcularlo cuando cambien los parámetros
    // o cada 30 frames para animaciones (menos frecuente = mejor rendimiento)
    const recalcular = !this._bloomBuffer || 
                       this._cachedBloomIntensity !== Config.bloomIntensidad ||
                       this._cachedBloomUmbral !== Config.bloomUmbral ||
                       this._cachedBloomColor !== Config.bloomColor ||
                       frameCount % 30 === 0;
    
    if (recalcular) {
      // Actualizar valores cacheados
      this._cachedBloomIntensity = Config.bloomIntensidad;
      this._cachedBloomUmbral = Config.bloomUmbral;
      this._cachedBloomColor = Config.bloomColor;
      
      // Crear buffer a menor resolución si no existe
      if (!this._bloomBuffer) {
        this._bloomBuffer = createGraphics(Math.floor(width * bloomScale), Math.floor(height * bloomScale));
      }
      
      // Limpiar el buffer antes de dibujar
      this._bloomBuffer.clear();
      
      // Obtener la imagen actual y reducirla a la resolución del buffer
      const currentImg = get();
      this._bloomBuffer.image(currentImg, 0, 0, this._bloomBuffer.width, this._bloomBuffer.height);
      
      // Aplicar umbral para extraer áreas brillantes (más rápido que manipular píxeles)
      // En lugar de procesamiento de píxeles, usar un shader simulado con blend modes
      
      const thresholdBuffer = createGraphics(this._bloomBuffer.width, this._bloomBuffer.height);
      
      // Calcular umbral (0-1)
      const umbral = map(Config.bloomUmbral, 0, 100, 0.3, 0.9);
      
      // Aplicar umbral usando una técnica de ajuste de niveles
      thresholdBuffer.image(this._bloomBuffer, 0, 0);
      
      // Limpiar el buffer original
      this._bloomBuffer.clear();
      
      // Configurar buffer para threshold
      this._bloomBuffer.push();
      this._bloomBuffer.blendMode(SCREEN); // Usar SCREEN para preservar áreas brillantes
      
      // Ajustar contraste para enfatizar áreas brillantes y eliminar oscuras
      for (let i = 0; i < 3; i++) {
        // Intensidad basada en umbral
        let opacity = map(umbral, 0.3, 0.9, 150, 50);
        this._bloomBuffer.tint(255, opacity);
        this._bloomBuffer.image(thresholdBuffer, 0, 0);
      }
      
      this._bloomBuffer.pop();
      
      // Aplicar un desenfoque simple al resultado
      // Usar técnica de desplazamiento en lugar de filter(BLUR)
      const blurBuffer = createGraphics(this._bloomBuffer.width, this._bloomBuffer.height);
      blurBuffer.image(this._bloomBuffer, 0, 0);
      
      this._bloomBuffer.clear();
      
      // Intensidad basada en configuración
      const blurAmount = map(Config.bloomIntensidad, 0, 100, 1, 3);
      
      // Aplicar blur mediante superposición con desplazamiento
      this._bloomBuffer.image(blurBuffer, 0, 0); // Original
      
      this._bloomBuffer.blendMode(SCREEN);
      for (let i = 1; i <= 2; i++) {
        const offset = i * blurAmount;
        this._bloomBuffer.tint(255, 50);
        
        // 4 direcciones principales para optimizar rendimiento
        this._bloomBuffer.image(blurBuffer, offset, 0);
        this._bloomBuffer.image(blurBuffer, -offset, 0);
        this._bloomBuffer.image(blurBuffer, 0, offset);
        this._bloomBuffer.image(blurBuffer, 0, -offset);
      }
      
      // Liberar memoria
      thresholdBuffer.remove();
      blurBuffer.remove();
      currentImg.remove();
    }
    
    // Aplicar el bloom con el color configurado
    const bloomColor = color(Config.bloomColor);
    const bloomAlpha = map(Config.bloomIntensidad, 0, 100, 50, 200);
    
    // Usar SCREEN para mezclar áreas brillantes correctamente
    blendMode(SCREEN);
    tint(red(bloomColor), green(bloomColor), blue(bloomColor), bloomAlpha);
    
    // Dibujar el bloom escalado al tamaño completo
    image(this._bloomBuffer, 0, 0, width, height);
    
    // Restaurar configuración
    blendMode(BLEND);
    noTint();
  },
  
  // Aplicar efecto semitono mejorado
  aplicarSemitono() {
    // Verificar si el efecto está activo y la escala es mayor que cero
    if (!Config.semitonoActivo || Config.semitonoEscala <= 0) return;
    
    // Calcular el tamaño de los puntos según la escala (0-1)
    // Usar un rango más adecuado para preservar la relación de aspecto
    const pointSize = map(Config.semitonoEscala, 0, 1, 3, 20);
    
    // Crear el buffer si no existe
    if (!this.semitonoBuffer) {
      this.semitonoBuffer = createGraphics(width, height);
    }
    
    // Limpiar el buffer
    this.semitonoBuffer.clear();
    this.semitonoBuffer.background(255);
    
    // Obtener la imagen actual
    const img = get();
    
    // Usar una cuadrícula uniforme para evitar deformación
    const cols = Math.floor(width / pointSize);
    const rows = Math.floor(height / pointSize);
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    
    // Dibujar puntos basados en la luminosidad de la imagen original
    this.semitonoBuffer.noStroke();
    this.semitonoBuffer.fill(0);
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Posición central de la celda
        const posX = x * cellWidth + cellWidth / 2;
        const posY = y * cellHeight + cellHeight / 2;
        
        // Muestrear el color en esa posición
        const c = img.get(Math.floor(posX), Math.floor(posY));
        
        // Calcular el brillo (0-255)
        const brightness = (red(c) + green(c) + blue(c)) / 3;
        
        // Calcular el tamaño del punto (invertido: más oscuro = punto más grande)
        const dotSize = map(brightness, 0, 255, pointSize * 0.95, pointSize * 0.05);
        
        // Dibujar el punto si tiene un tamaño visible
        if (dotSize > 0) {
          this.semitonoBuffer.ellipse(posX, posY, dotSize, dotSize);
        }
      }
    }
    
    // Dibujar el buffer de semitono en la pantalla
    image(this.semitonoBuffer, 0, 0);
    
    // Liberar memoria
    img.remove();
  },
  
  // Aplicar aberración cromática (completamente rediseñado)
  aplicarAberracionCromatica() {
    // Verificar si el efecto está activo y la intensidad es mayor que cero
    if (!Config.aberracionActiva || Config.aberracionIntensidad <= 0) return;
    
    // Crear o reutilizar buffer de aberración a menor escala para rendimiento
    const scale = 0.5; // Usar resolución reducida para mejor rendimiento
    
    if (!this._aberrationBuffer || 
        this._aberrationBuffer.width !== Math.floor(width * scale) ||
        this._aberrationBuffer.height !== Math.floor(height * scale)) {
      if (this._aberrationBuffer) this._aberrationBuffer.remove();
      this._aberrationBuffer = createGraphics(Math.floor(width * scale), Math.floor(height * scale));
    }
    
    // Cachear parámetros y recalcular solo cuando cambien o cada 15 frames
    if (this._cachedAberrationParams !== `${Config.aberracionIntensidad}-${Config.aberracionAnimada}-${frameCount % 15}`) {
      this._cachedAberrationParams = `${Config.aberracionIntensidad}-${Config.aberracionAnimada}-${frameCount % 15}`;
      
      // Calcular desplazamiento máximo basado en intensidad
      const maxOffset = map(Config.aberracionIntensidad, 0, 100, 1, 15);
      
      // Calcular desplazamientos para cada canal (R, G, B)
      let offsetX, offsetY;
      
      if (Config.aberracionAnimada) {
        // Actualizar ángulo para animación
        if (!this._aberrationAngle) this._aberrationAngle = 0;
        this._aberrationAngle += 0.03;
        
        // Movimiento circular para la animación
        offsetX = cos(this._aberrationAngle) * maxOffset;
        offsetY = sin(this._aberrationAngle) * maxOffset * 0.5;
      } else {
        // Desplazamiento estático
        offsetX = maxOffset;
        offsetY = 0;
      }
      
      // Obtener la imagen actual y escalarla al tamaño del buffer
      const currentImg = get();
      
      // Limpiar buffer para el nuevo frame
      this._aberrationBuffer.clear();
      
      // Separar y desplazar canales de color
      // Canal rojo - desplazado positivamente
      this._aberrationBuffer.push();
      this._aberrationBuffer.blendMode(ADD);
      this._aberrationBuffer.tint(255, 0, 0);
      this._aberrationBuffer.image(currentImg, offsetX * scale, offsetY * scale, 
                                   this._aberrationBuffer.width, this._aberrationBuffer.height);
      
      // Canal verde - centrado
      this._aberrationBuffer.tint(0, 255, 0);
      this._aberrationBuffer.image(currentImg, 0, 0, 
                                   this._aberrationBuffer.width, this._aberrationBuffer.height);
      
      // Canal azul - desplazado negativamente
      this._aberrationBuffer.tint(0, 0, 255);
      this._aberrationBuffer.image(currentImg, -offsetX * scale, -offsetY * scale, 
                                   this._aberrationBuffer.width, this._aberrationBuffer.height);
      this._aberrationBuffer.pop();
      
      // Liberar memoria
      currentImg.remove();
    }
    
    // Aplicar el efecto de aberración cromática
    blendMode(BLEND);
    image(this._aberrationBuffer, 0, 0, width, height);
  },
  
  // Aplicar efecto glitch
  aplicarGlitch() {
    if (!Config.glitchActivo || Config.glitchIntensidad <= 0) return;
    
    // Parámetros basados en la intensidad
    const intensity = map(Config.glitchIntensidad, 0, 100, 0.1, 1.0);
    
    // Crear buffer si no existe
    if (!this._glitchBuffer) {
      this._glitchBuffer = createGraphics(width, height);
    }
    
    // Actualizar el efecto cada pocos frames para simular "error digital"
    // o cuando cambia la intensidad
    if (this._cachedGlitchIntensity !== Config.glitchIntensidad || 
        frameCount % 15 === 0 || 
        random() < intensity * 0.3) {
      
      this._cachedGlitchIntensity = Config.glitchIntensidad;
      
      // Obtener la imagen actual
      const currentImg = get();
      
      // Limpiar el buffer
      this._glitchBuffer.clear();
      this._glitchBuffer.image(currentImg, 0, 0);
      
      // Simular glitch con fragmentos de imagen desplazados
      // Número de fragmentos de glitch basado en intensidad
      const numGlitches = Math.floor(map(intensity, 0.1, 1.0, 2, 10));
      
      if (random() < intensity * 0.8) {
        // Técnica 1: Cortes horizontales con desplazamiento
        for (let i = 0; i < numGlitches; i++) {
          if (random() < intensity) {
            // Altura y posición aleatorias para el corte
            const glitchHeight = random(5, 20) * intensity;
            const y = random(height - glitchHeight);
            
            // Desplazamiento aleatorio
            const xOffset = random(-20, 20) * intensity;
            
            // Cortar una sección horizontal y redibujarla con desplazamiento
            const stripImg = this._glitchBuffer.get(0, y, width, glitchHeight);
            
            // Limpiar la sección original
            this._glitchBuffer.fill(0);
            this._glitchBuffer.noStroke();
            this._glitchBuffer.rect(0, y, width, glitchHeight);
            
            // Dibujar la sección con desplazamiento
            this._glitchBuffer.image(stripImg, xOffset, y);
          }
        }
      }
      
      // Técnica 2: Desplazamiento de canales de color (RGB split)
      if (random() < intensity * 0.6) {
        this._glitchBuffer.loadPixels();
        
        // Evitar procesar todos los píxeles - sólo algunos puntos aleatorios
        const sampleSize = Math.max(1, Math.floor(width * height * 0.01));
        
        for (let i = 0; i < sampleSize; i++) {
          const x = Math.floor(random(width));
          const y = Math.floor(random(height));
          const index = (y * width + x) * 4;
          
          // Intercambiar canales (R, G, B) aleatoriamente
          if (random() < intensity * 0.3) {
            const temp = this._glitchBuffer.pixels[index]; // R
            this._glitchBuffer.pixels[index] = this._glitchBuffer.pixels[index + 2]; // B -> R
            this._glitchBuffer.pixels[index + 2] = temp; // R -> B
          }
        }
        
        this._glitchBuffer.updatePixels();
      }
      
      // Técnica 3: Areas de "error" (cuadros aleatorios)
      if (random() < intensity * 0.4) {
        const numAreas = Math.floor(random(1, 5) * intensity);
        
        for (let i = 0; i < numAreas; i++) {
          const areaSize = random(10, 50) * intensity;
          const x = random(width - areaSize);
          const y = random(height - areaSize);
          
          // Color aleatorio para el área de error
          const r = random(255);
          const g = random(255);
          const b = random(255);
          const a = random(100, 200) * intensity;
          
          this._glitchBuffer.fill(r, g, b, a);
          this._glitchBuffer.noStroke();
          this._glitchBuffer.rect(x, y, areaSize, areaSize);
        }
      }
      
      // Liberar memoria
      currentImg.remove();
    }
    
    // Aplicar el efecto glitch
    image(this._glitchBuffer, 0, 0);
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
  
  // Aplicar todos los efectos en secuencia
  aplicarEfectos() {
    // Limpiar estado del render
    blendMode(BLEND);
    noTint();
    
    // Aplicar efectos en orden optimizado para calidad visual
    
    // 1. Primero el pixelado (afecta a toda la imagen)
    if (Config.pixeladoActivo && Config.pixeladoTamano > 1) {
      this.aplicarPixelado();
    }
    
    // 2. Semitono (incompatible con pixelado, solo aplicar si no hay pixelado)
    if (Config.semitonoActivo && Config.semitonoEscala > 0 && 
        !(Config.pixeladoActivo && Config.pixeladoTamano > 1)) {
      this.aplicarSemitono();
    }
    
    // 3. Bloom (mejor aplicarlo antes que el desenfoque para que las luces brillen)
    if (Config.bloomActivo && Config.bloomIntensidad > 0) {
      this.aplicarBloom();
    }
    
    // 4. Aberración cromática (mejor antes del desenfoque para que se vea más definida)
    if (Config.aberracionActiva && Config.aberracionIntensidad > 0) {
      this.aplicarAberracionCromatica();
    }
    
    // 5. Desenfoque (efecto sutil)
    if (Config.desenfoque > 0) {
      this.aplicarDesenfoque();
    }
    
    // 6. Glitch (mejor al final porque altera toda la imagen)
    if (Config.glitchActivo && Config.glitchIntensidad > 0) {
      this.aplicarGlitch();
    }
    
    // 7. Ruido gráfico (último porque se aplica encima de todo)
    if (Config.ruidoGrafico > 0) {
      this.aplicarRuidoGrafico();
    }
    
    // Restaurar estado de renderizado
    blendMode(BLEND);
    noTint();
  }
}; 