/**
 * ui.js
 * Interfaz de usuario
 */
const UI = {
  controlPanel: null,
  addParticleOnClickEnabled: true, // Por defecto está habilitado
  grabacionDuracion: 5, // Duración de la grabación en segundos (por defecto 5s)
  grabacionFormato: 'webm', // Formato de grabación (siempre WebM por ahora)
  mediaRecorder: null, // Instancia del MediaRecorder
  grabacionEnProgreso: false, // Indica si hay una grabación en progreso
  grabacionTiempoInicio: 0, // Tiempo de inicio de la grabación
  grabacionChunks: [], // Fragmentos de la grabación
  grabacionTemporizador: null, // Temporizador para actualizar el tiempo de grabación
  
  crearControles() {
    console.log("Creando panel de control");
    
    this.controlPanel = createDiv();
    this.controlPanel.id('controles');
    
    // Secciones plegables
    this._crearSeccionBasica();
    this._crearSeccionPatrones();
    this._crearSeccionPaletaColores();
    this._crearSeccionMovimiento();
    this._crearSeccionApariencia();
    this._crearSeccionRastro();
    this._crearSeccionEfectos();
    this._crearSeccionAcciones();
    
    console.log("Panel de control creado");
    
    // Para dispositivos móviles, añadir botón de cierre
    if (typeof DeviceDetector !== 'undefined' && DeviceDetector.isMobile) {
      const closeButton = createDiv();
      closeButton.class('mobile-close-button');
      closeButton.parent(this.controlPanel);
      
      const closeIcon = createSpan('close');
      closeIcon.class('material-icons');
      closeIcon.parent(closeButton);
      
      closeButton.mousePressed(() => {
        this.toggleVisibilidad();
      });
    }
    
    // Inicializar las secciones plegables después de crear el DOM
    this._inicializarSeccionesPlegables();
  },
  
  // Modificar la sección básica para hacerla plegable
  _crearSeccionBasica() {
    // Crear la sección plegable usando el método existente
    let content = this._crearSeccionPlegable('Configuración Básica');
    
    // Dimensiones del canvas (en una línea)
    let canvasDimensionsDiv = createDiv();
    canvasDimensionsDiv.class('input-group');
    canvasDimensionsDiv.parent(content);
    
    let dimensionsLabel = createElement('p', 'Dimensiones:');
    dimensionsLabel.parent(canvasDimensionsDiv);
    
    let dimensionsContainer = createDiv();
    dimensionsContainer.style('display', 'flex');
    dimensionsContainer.style('width', '60%');
    dimensionsContainer.style('gap', '5px');
    dimensionsContainer.parent(canvasDimensionsDiv);
    
    let anchoInput = createInput(Config.canvasWidth.toString());
    anchoInput.attribute('type', 'number');
    anchoInput.attribute('min', '100');
    anchoInput.attribute('max', '5000');
    anchoInput.style('width', '50%');
    anchoInput.id('anchoCanvas');
    anchoInput.parent(dimensionsContainer);
    
    let altoInput = createInput(Config.canvasHeight.toString());
    altoInput.attribute('type', 'number');
    altoInput.attribute('min', '100');
    altoInput.attribute('max', '5000');
    altoInput.style('width', '50%');
    altoInput.id('altoCanvas');
    altoInput.parent(dimensionsContainer);
    
    let aplicarTamanoBtn = createButton('Aplicar');
    aplicarTamanoBtn.parent(content);
    aplicarTamanoBtn.mousePressed(() => {
      let nuevoAncho = parseInt(select('#anchoCanvas').value());
      let nuevoAlto = parseInt(select('#altoCanvas').value());
      
      // Validaciones
      if (isNaN(nuevoAncho) || isNaN(nuevoAlto)) {
        alert('Por favor, introduce valores numéricos válidos.');
        return;
      }
      
      if (nuevoAncho < 100 || nuevoAncho > 5000 || nuevoAlto < 100 || nuevoAlto > 5000) {
        alert('Por favor, introduce valores entre 100 y 5000.');
        return;
      }
      
      // Aplicar el cambio de tamaño
      cambiarTamanoCanvas(nuevoAncho, nuevoAlto);
    });
    
    // Cantidad de partículas
    let cantidadLabel = createElement('p', 'Cantidad de partículas: ' + Config.cantidadParticulas);
    cantidadLabel.parent(content);
    
    let cantidadSlider = createSlider(1, 500, Config.cantidadParticulas);
    cantidadSlider.parent(content);
    cantidadSlider.input(() => {
      Config.cantidadParticulas = cantidadSlider.value();
      cantidadLabel.html('Cantidad de partículas: ' + Config.cantidadParticulas);
      
      // Reinicializar para mantener el patrón
      ParticleSystem.inicializar();
    });
    
    // Tamaño de partículas
    let tamanoLabel = createElement('p', 'Tamaño: ' + Config.tamanoParticula);
    tamanoLabel.parent(content);
    
    let tamanoSlider = createSlider(1, 500, Config.tamanoParticula);
    tamanoSlider.parent(content);
    tamanoSlider.input(() => {
      Config.tamanoParticula = tamanoSlider.value();
      tamanoLabel.html('Tamaño: ' + Config.tamanoParticula);
      
      // Actualizar el tamaño en todas las partículas existentes
      for (let p of ParticleSystem.particulas) {
        p.size = Config.tamanoParticula;
        
        // Actualizar también la forma irregular si se usa esa forma
        if (Config.formaParticula === 'Irregular') {
          p.formaIrregular = [];
          for (let i = 0; i < 5; i++) {
            p.formaIrregular.push(createVector(
              random(-p.size / 2, p.size / 2), 
              random(-p.size / 2, p.size / 2)
            ));
          }
        }
      }
    });
    
    // Velocidad máxima
    let velocidadLabel = createElement('p', 'Velocidad: ' + Config.velocidadMaxima);
    velocidadLabel.parent(content);
    
    let velocidadSlider = createSlider(0, 100, Config.velocidadMaxima);
    velocidadSlider.parent(content);
    velocidadSlider.input(() => {
      Config.velocidadMaxima = velocidadSlider.value();
      velocidadLabel.html('Velocidad: ' + Config.velocidadMaxima);
      
      // Actualizar velocidad en partículas existentes
      for (let p of ParticleSystem.particulas) {
        p.maxSpeed = Config.velocidadMaxima;
      }
    });
  },
  
  // Crear sección plegable para patrones
  _crearSeccionPatrones() {
    let seccion = this._crearSeccionPlegable('Patrón Inicial');
    
    // Selector de patrón
    let patronSelector = createSelect();
    patronSelector.parent(seccion);
    
    // Agregar las opciones de patrones desde la configuración
    for (let patron of Config.patronesDisponibles) {
      patronSelector.option(patron);
    }
    
    // Establecer el valor actual
    patronSelector.selected(Config.patronInicial);
    
    // Contenedor para opciones adicionales de patrones específicos
    let opcionesAdicionales = createDiv();
    opcionesAdicionales.id('opciones-patron-adicionales');
    opcionesAdicionales.parent(seccion);
    opcionesAdicionales.style('margin-top', '10px');
    opcionesAdicionales.style('display', 'none');
    
    // Crear opciones específicas para el patrón de ondas
    let opcionesOndas = createDiv();
    opcionesOndas.id('opciones-ondas');
    opcionesOndas.parent(opcionesAdicionales);
    
    // Amplitud
    let amplitudLabel = createElement('p', 'Amplitud: ' + Config.amplitudOndas);
    amplitudLabel.parent(opcionesOndas);
    
    let amplitudSlider = createSlider(10, 300, Config.amplitudOndas, 5);
    amplitudSlider.parent(opcionesOndas);
    amplitudSlider.input(() => {
      Config.amplitudOndas = amplitudSlider.value();
      amplitudLabel.html('Amplitud: ' + Config.amplitudOndas);
      
      if (Config.patronInicial === 'Ondas') {
        ParticleSystem.inicializar();
      }
    });
    
    // Frecuencia
    let frecuenciaLabel = createElement('p', 'Frecuencia: ' + Config.frecuenciaOndas);
    frecuenciaLabel.parent(opcionesOndas);
    
    let frecuenciaSlider = createSlider(0.01, 0.2, Config.frecuenciaOndas, 0.01);
    frecuenciaSlider.parent(opcionesOndas);
    frecuenciaSlider.input(() => {
      Config.frecuenciaOndas = frecuenciaSlider.value();
      frecuenciaLabel.html('Frecuencia: ' + Config.frecuenciaOndas.toFixed(2));
      
      if (Config.patronInicial === 'Ondas') {
        ParticleSystem.inicializar();
      }
    });
    
    // Cantidad de ondas
    let ondasLabel = createElement('p', 'Cantidad de ondas: ' + Config.cantidadOndas);
    ondasLabel.parent(opcionesOndas);
    
    let ondasSlider = createSlider(1, 10, Config.cantidadOndas, 1);
    ondasSlider.parent(opcionesOndas);
    ondasSlider.input(() => {
      Config.cantidadOndas = ondasSlider.value();
      ondasLabel.html('Cantidad de ondas: ' + Config.cantidadOndas);
      
      if (Config.patronInicial === 'Ondas') {
        ParticleSystem.inicializar();
      }
    });
    
    // Manejar cambios en la selección
    patronSelector.changed(() => {
      Config.patronInicial = patronSelector.value();
      console.log(`Patrón seleccionado: ${Config.patronInicial}`);
      
      // Mostrar opciones adicionales si es patrón de ondas
      if (Config.patronInicial === 'Ondas') {
        opcionesAdicionales.style('display', 'block');
        opcionesOndas.style('display', 'block');
      } else {
        opcionesAdicionales.style('display', 'none');
      }
      
      // Reiniciar el sistema de partículas para aplicar el nuevo patrón
      ParticleSystem.inicializar();
    });
    
    // Mostrar opciones adicionales si ya está seleccionado el patrón de ondas
    if (Config.patronInicial === 'Ondas') {
      opcionesAdicionales.style('display', 'block');
      opcionesOndas.style('display', 'block');
    }
  },
  
  // Crear sección plegable para la paleta de colores
  _crearSeccionPaletaColores() {
    let seccion = this._crearSeccionPlegable('Paleta de Colores');
    
    // Color de fondo (movido desde la sección de apariencia)
    let fondoContainer = createDiv();
    fondoContainer.class('color-section');
    fondoContainer.parent(seccion);
    
    let fondoLabel = createElement('p', 'Color de fondo:');
    fondoLabel.parent(fondoContainer);
    
    let fondoPreview = createDiv();
    fondoPreview.class('color-preview');
    fondoPreview.id('fondo-preview');
    fondoPreview.style('background-color', Config.colorFondo);
    fondoPreview.parent(fondoContainer);
    
    // Crear el input de color y asegurarse de que funcione correctamente
    let fondoInput = createColorPicker(Config.colorFondo);
    fondoInput.id('fondo-color-picker');
    fondoInput.parent(fondoContainer);
    
    // Manejar cambios en el color de fondo
    fondoInput.input(() => {
      const nuevoColorFondo = fondoInput.value();
      console.log("Nuevo color de fondo seleccionado:", nuevoColorFondo);
      
      // Actualizar el color de fondo en la configuración
      Config.colorFondo = nuevoColorFondo;
      
      // Actualizar la previsualización
      fondoPreview.style('background-color', nuevoColorFondo);
      
      // Aplicar el nuevo color de fondo
      background(nuevoColorFondo);
      
      // Reiniciar efectos visuales para reflejar el cambio
      VisualEffects.reiniciar();
    });
    
    // Selector de paletas predefinidas
    let paletasContainer = createDiv();
    paletasContainer.class('paletas-container');
    paletasContainer.parent(seccion);
    
    let paletasLabel = createElement('p', 'Paletas predefinidas:');
    paletasLabel.parent(paletasContainer);
    
    let paletasSelector = createSelect();
    paletasSelector.parent(paletasContainer);
    paletasSelector.option('Azules');
    paletasSelector.option('Rojos');
    paletasSelector.option('Verdes');
    paletasSelector.option('Degradado Arcoíris');
    paletasSelector.option('Neón');
    paletasSelector.option('Monocromático');
    paletasSelector.option('Pastel');
    
    paletasSelector.changed(() => {
      const paletaSeleccionada = paletasSelector.value();
      this._aplicarPaletaPredefinida(paletaSeleccionada);
    });
    
    // Contenedor para colores recientes
    let recientesContainer = createDiv();
    recientesContainer.class('colores-recientes-container');
    recientesContainer.parent(seccion);
    
    let recientesLabel = createElement('p', 'Colores recientes:');
    recientesLabel.parent(recientesContainer);
    
    // Contenedor para los botones de colores recientes
    let recientesGrid = createDiv();
    recientesGrid.class('colores-recientes-grid');
    recientesGrid.parent(recientesContainer);
    
    // Inicializar colores recientes desde localStorage si existen
    if (!window.coloresRecientes) {
      try {
        const coloresGuardados = localStorage.getItem('coloresRecientes');
        if (coloresGuardados) {
          window.coloresRecientes = JSON.parse(coloresGuardados);
        } else {
          window.coloresRecientes = [];
        }
      } catch (e) {
        console.warn('Error al cargar colores recientes:', e);
        window.coloresRecientes = [];
      }
    }
    
    // Crear botones para colores recientes (inicialmente vacíos)
    for (let i = 0; i < 5; i++) {
      let colorBtn = createDiv();
      colorBtn.class('color-reciente');
      colorBtn.attribute('data-index', i);
      if (window.coloresRecientes && window.coloresRecientes[i]) {
        colorBtn.style('background-color', window.coloresRecientes[i]);
        colorBtn.style('opacity', '1');
      } else {
        colorBtn.style('background-color', '#888888');
        colorBtn.style('opacity', '0.3');
      }
      colorBtn.parent(recientesGrid);
      
      // Al hacer clic en un color reciente, aplicarlo al color actual seleccionado
      colorBtn.mousePressed(() => {
        if (window.coloresRecientes && window.coloresRecientes[i]) {
          const colorSeleccionado = window.selectedColorIndex || 0;
          if (this.colorPickers && this.colorPickers[colorSeleccionado]) {
            // No guardar este color como reciente (ya está en recientes)
            // Solo moverlo al principio de la lista
            const colorReciente = window.coloresRecientes[i];
            this._actualizarColorEnPaleta(colorSeleccionado, colorReciente, false);
            
            // Pero sí reordenar los colores recientes para que el usado quede primero
            this._guardarColorReciente(colorReciente);
          }
        }
      });
    }
    
    // Crear título para los colores de la paleta
    let paletaLabel = createElement('h4', 'Colores de la paleta:');
    paletaLabel.parent(seccion);
    
    // Grid para mostrar la paleta de colores
    let coloresGrid = createDiv();
    coloresGrid.class('colores-grid');
    coloresGrid.parent(seccion);
    
    // Crear controles para cada color principal con un diseño más compacto
    const nombresColores = ['Color 01', 'Color 02', 'Color 03', 'Color 04', 'Color 05'];
    
    for (let i = 0; i < 5; i++) {
      this._crearControlColor(coloresGrid, nombresColores[i], i);
    }
    
    // Botón para restaurar colores originales
    let restaurarColoresBtn = createButton('Restaurar colores predeterminados');
    restaurarColoresBtn.parent(seccion);
    restaurarColoresBtn.mousePressed(() => {
      ColorUtils.inicializarPaleta();
      // Actualizar los controles de color
      this._actualizarControlesColor();
      // Reiniciar el sistema para aplicar los nuevos colores
      ParticleSystem.inicializar();
    });
  },
  
  // Crear sección plegable para el modo de movimiento
  _crearSeccionMovimiento() {
    let seccion = this._crearSeccionPlegable('Modo de Movimiento');
    
    // Modo de movimiento
    let modoSelector = createSelect();
    modoSelector.parent(seccion);
    
    for (let modo of Config.modosDisponibles) {
      modoSelector.option(modo);
    }
    
    modoSelector.selected(Config.modoMovimiento);
    modoSelector.changed(() => {
      Config.modoMovimiento = modoSelector.value();
    });
    
    // Turbulencia
    let turbulenciaLabel = createElement('p', 'Turbulencia: ' + Config.turbulencia);
    turbulenciaLabel.parent(seccion);
    
    let turbulenciaSlider = createSlider(0, 1, Config.turbulencia, 0.01);
    turbulenciaSlider.parent(seccion);
    turbulenciaSlider.input(() => {
      Config.turbulencia = turbulenciaSlider.value();
      turbulenciaLabel.html('Turbulencia: ' + Config.turbulencia.toFixed(2));
    });
  },
  
  // Crear sección plegable para la apariencia
  _crearSeccionApariencia() {
    let seccion = this._crearSeccionPlegable('Apariencia');
    
    // Selector de forma
    let formaLabel = createElement('p', 'Forma de partícula:');
    formaLabel.parent(seccion);
    
    let formaSelector = createSelect();
    formaSelector.parent(seccion);
    
    // Agregar las formas disponibles
    for (let forma of Config.formasDisponibles) {
      formaSelector.option(forma);
    }
    
    // Establecer el valor actual
    formaSelector.selected(Config.formaParticula);
    
    // Manejar cambios en la selección
    formaSelector.changed(() => {
      Config.formaParticula = formaSelector.value();
      
      // Actualizar en partículas existentes
      for (let p of ParticleSystem.particulas) {
        p.forma = Config.formaParticula;
        
        // Reinicializar forma irregular si se selecciona
        if (Config.formaParticula === 'Irregular') {
          p.formaIrregular = [];
          for (let i = 0; i < 5; i++) {
            p.formaIrregular.push(createVector(
              random(-p.size / 2, p.size / 2), 
              random(-p.size / 2, p.size / 2)
            ));
          }
        }
      }
    });
    
    // Rotación inicial
    let rotacionInicialLabel = createElement('p', 'Rotación inicial:');
    rotacionInicialLabel.parent(seccion);
    
    let rotacionInicialSelector = createSelect();
    rotacionInicialSelector.parent(seccion);
    
    // Agregar las opciones de rotación inicial
    for (let tipo of Config.tiposRotacionInicial) {
      rotacionInicialSelector.option(tipo);
    }
    
    // Establecer valor actual
    rotacionInicialSelector.selected(Config.tipoRotacionInicial);
    
    // Manejar cambios
    rotacionInicialSelector.changed(() => {
      Config.tipoRotacionInicial = rotacionInicialSelector.value();
      // Reiniciar el sistema para aplicar la nueva rotación inicial
      ParticleSystem.inicializar();
    });
    
    // Velocidad de rotación
    let rotacionLabel = createElement('p', 'Velocidad de rotación: ' + Config.rotacionParticula);
    rotacionLabel.parent(seccion);
    
    let rotacionSlider = createSlider(-0.1, 0.1, Config.rotacionParticula, 0.001);
    rotacionSlider.parent(seccion);
    rotacionSlider.input(() => {
      Config.rotacionParticula = rotacionSlider.value();
      rotacionLabel.html('Velocidad de rotación: ' + Config.rotacionParticula.toFixed(3));
    });
  },
  
  // Crear sección plegable para el rastro
  _crearSeccionRastro() {
    let seccion = this._crearSeccionPlegable('Rastro de Partículas');
    
    let rastroContainer = createDiv();
    rastroContainer.class('control-item');
    rastroContainer.parent(seccion);
    
    let rastroCheck = createCheckbox('Mostrar rastro', Config.mostrarRastro);
    rastroCheck.parent(rastroContainer);
    rastroCheck.changed(() => {
      Config.mostrarRastro = rastroCheck.checked();
      
      // Limpiar el canvas y reiniciar los efectos visuales cuando se cambia esta configuración
      background(Config.colorFondo);
      VisualEffects.reiniciar();
      
      // Limpiar los historiales de las partículas
      for (let p of ParticleSystem.particulas) {
        p.historia = [];
      }
    });
    
    // Longitud del rastro
    let rastroLengthLabel = createElement('p', 'Longitud del rastro: ' + Config.trailLength);
    rastroLengthLabel.parent(seccion);
    
    let rastroLengthSlider = createSlider(1, 100, Config.trailLength);
    rastroLengthSlider.parent(seccion);
    rastroLengthSlider.input(() => {
      Config.trailLength = rastroLengthSlider.value();
      rastroLengthLabel.html('Longitud del rastro: ' + Config.trailLength);
      
      // Actualizar en partículas existentes
      for (let p of ParticleSystem.particulas) {
        p.maxHistory = Config.trailLength;
      }
    });
    
    // Tamaño final del rastro
    let rastroFinalSizeLabel = createElement('p', 'Tamaño final del rastro: ' + Config.trailFinalSize);
    rastroFinalSizeLabel.parent(seccion);
    
    let rastroFinalSizeSlider = createSlider(0.05, 1, Config.trailFinalSize, 0.01);
    rastroFinalSizeSlider.parent(seccion);
    rastroFinalSizeSlider.input(() => {
      Config.trailFinalSize = rastroFinalSizeSlider.value();
      rastroFinalSizeLabel.html('Tamaño final del rastro: ' + Config.trailFinalSize.toFixed(2));
    });
  },
  
  // Crear sección plegable para efectos visuales
  _crearSeccionEfectos() {
    let seccion = this._crearSeccionPlegable('Efectos');
    
    // Ruido gráfico
    let ruidoLabel = createElement('p', 'Ruido gráfico: ' + Config.ruidoGrafico);
    ruidoLabel.parent(seccion);
    
    let ruidoSlider = createSlider(0, 100, Config.ruidoGrafico);
    ruidoSlider.parent(seccion);
    ruidoSlider.input(() => {
      Config.ruidoGrafico = ruidoSlider.value();
      ruidoLabel.html('Ruido gráfico: ' + Config.ruidoGrafico);
    });
    
    // Desenfoque
    let desenfoqueLabel = createElement('p', 'Desenfoque: ' + Config.desenfoque);
    desenfoqueLabel.parent(seccion);
    
    let desenfoqueSlider = createSlider(0, 5, Config.desenfoque, 0.1);
    desenfoqueSlider.parent(seccion);
    desenfoqueSlider.input(() => {
      Config.desenfoque = desenfoqueSlider.value();
      desenfoqueLabel.html('Desenfoque: ' + Config.desenfoque.toFixed(1));
    });
    
    // Efecto Pixelado
    let pixeladoContainer = createDiv();
    pixeladoContainer.class('effect-container');
    pixeladoContainer.parent(seccion);
    
    let pixeladoCheck = createCheckbox('Pixelado', Config.pixeladoActivo);
    pixeladoCheck.parent(pixeladoContainer);
    pixeladoCheck.changed(() => {
      Config.pixeladoActivo = pixeladoCheck.checked();
    });
    
    let pixeladoTamanoLabel = createElement('p', 'Tamaño píxel: ' + Config.pixeladoTamano);
    pixeladoTamanoLabel.parent(pixeladoContainer);
    pixeladoTamanoLabel.style('margin-left', '20px');
    
    let pixeladoTamanoSlider = createSlider(1, 30, Config.pixeladoTamano, 1);
    pixeladoTamanoSlider.parent(pixeladoContainer);
    pixeladoTamanoSlider.style('margin-left', '20px');
    pixeladoTamanoSlider.input(() => {
      Config.pixeladoTamano = pixeladoTamanoSlider.value();
      pixeladoTamanoLabel.html('Tamaño píxel: ' + Config.pixeladoTamano);
    });
    
    // Efecto Bloom
    let bloomContainer = createDiv();
    bloomContainer.class('effect-container');
    bloomContainer.parent(seccion);
    
    let bloomCheck = createCheckbox('Bloom (Resplandor)', Config.bloomActivo);
    bloomCheck.parent(bloomContainer);
    bloomCheck.changed(() => {
      Config.bloomActivo = bloomCheck.checked();
      // Inicializar capas de bloom si se activa
      if (Config.bloomActivo) {
        VisualEffects.inicializar(width, height);
      }
    });
    
    let bloomIntensidadLabel = createElement('p', 'Intensidad: ' + Config.bloomIntensidad);
    bloomIntensidadLabel.parent(bloomContainer);
    bloomIntensidadLabel.style('margin-left', '20px');
    
    let bloomIntensidadSlider = createSlider(1, 100, Config.bloomIntensidad, 1);
    bloomIntensidadSlider.parent(bloomContainer);
    bloomIntensidadSlider.style('margin-left', '20px');
    bloomIntensidadSlider.input(() => {
      Config.bloomIntensidad = bloomIntensidadSlider.value();
      bloomIntensidadLabel.html('Intensidad: ' + Config.bloomIntensidad);
    });
    
    let bloomUmbralLabel = createElement('p', 'Umbral: ' + Config.bloomUmbral);
    bloomUmbralLabel.parent(bloomContainer);
    bloomUmbralLabel.style('margin-left', '20px');
    
    let bloomUmbralSlider = createSlider(1, 100, Config.bloomUmbral, 1);
    bloomUmbralSlider.parent(bloomContainer);
    bloomUmbralSlider.style('margin-left', '20px');
    bloomUmbralSlider.input(() => {
      Config.bloomUmbral = bloomUmbralSlider.value();
      bloomUmbralLabel.html('Umbral: ' + Config.bloomUmbral);
    });
    
    let bloomColorLabel = createElement('p', 'Color del bloom:');
    bloomColorLabel.parent(bloomContainer);
    bloomColorLabel.style('margin-left', '20px');
    
    let bloomColorInput = createInput(Config.bloomColor, 'color');
    bloomColorInput.parent(bloomContainer);
    bloomColorInput.style('margin-left', '20px');
    bloomColorInput.input(() => {
      Config.bloomColor = bloomColorInput.value();
    });
    
    // Efecto Semitono
    let semitonoContainer = createDiv();
    semitonoContainer.class('effect-container');
    semitonoContainer.parent(seccion);
    
    let semitonoCheck = createCheckbox('Semitono', Config.semitonoActivo);
    semitonoCheck.parent(semitonoContainer);
    semitonoCheck.changed(() => {
      Config.semitonoActivo = semitonoCheck.checked();
    });
    
    let semitonoEscalaLabel = createElement('p', 'Escala: ' + Config.semitonoEscala.toFixed(2));
    semitonoEscalaLabel.parent(semitonoContainer);
    semitonoEscalaLabel.style('margin-left', '20px');
    
    let semitonoEscalaSlider = createSlider(0, 1, Config.semitonoEscala, 0.01);
    semitonoEscalaSlider.parent(semitonoContainer);
    semitonoEscalaSlider.style('margin-left', '20px');
    semitonoEscalaSlider.input(() => {
      Config.semitonoEscala = semitonoEscalaSlider.value();
      semitonoEscalaLabel.html('Escala: ' + Config.semitonoEscala.toFixed(2));
    });
    
    // Efecto Aberración Cromática
    let aberracionContainer = createDiv();
    aberracionContainer.class('effect-container');
    aberracionContainer.parent(seccion);
    
    let aberracionCheck = createCheckbox('Aberración Cromática', Config.aberracionActiva);
    aberracionCheck.parent(aberracionContainer);
    aberracionCheck.changed(() => {
      Config.aberracionActiva = aberracionCheck.checked();
    });
    
    let aberracionIntensidadLabel = createElement('p', 'Intensidad: ' + Config.aberracionIntensidad);
    aberracionIntensidadLabel.parent(aberracionContainer);
    aberracionIntensidadLabel.style('margin-left', '20px');
    
    let aberracionIntensidadSlider = createSlider(1, 100, Config.aberracionIntensidad, 1);
    aberracionIntensidadSlider.parent(aberracionContainer);
    aberracionIntensidadSlider.style('margin-left', '20px');
    aberracionIntensidadSlider.input(() => {
      Config.aberracionIntensidad = aberracionIntensidadSlider.value();
      aberracionIntensidadLabel.html('Intensidad: ' + Config.aberracionIntensidad);
    });
    
    let aberracionAnimadaCheck = createCheckbox('Animación', Config.aberracionAnimada);
    aberracionAnimadaCheck.parent(aberracionContainer);
    aberracionAnimadaCheck.style('margin-left', '20px');
    aberracionAnimadaCheck.changed(() => {
      Config.aberracionAnimada = aberracionAnimadaCheck.checked();
    });
    
    // Efecto Glitch
    let glitchContainer = createDiv();
    glitchContainer.class('effect-container');
    glitchContainer.parent(seccion);
    
    let glitchCheck = createCheckbox('Glitch', Config.glitchActivo);
    glitchCheck.parent(glitchContainer);
    glitchCheck.changed(() => {
      Config.glitchActivo = glitchCheck.checked();
    });
    
    let glitchIntensidadLabel = createElement('p', 'Intensidad: ' + Config.glitchIntensidad);
    glitchIntensidadLabel.parent(glitchContainer);
    glitchIntensidadLabel.style('margin-left', '20px');
    
    let glitchIntensidadSlider = createSlider(1, 100, Config.glitchIntensidad, 1);
    glitchIntensidadSlider.parent(glitchContainer);
    glitchIntensidadSlider.style('margin-left', '20px');
    glitchIntensidadSlider.input(() => {
      Config.glitchIntensidad = glitchIntensidadSlider.value();
      glitchIntensidadLabel.html('Intensidad: ' + Config.glitchIntensidad);
    });
  },
  
  // Crear sección plegable para acciones
  _crearSeccionAcciones() {
    let seccion = this._crearSeccionPlegable('Acciones');
    
    let reiniciarButton = createButton('Reiniciar Partículas');
    reiniciarButton.parent(seccion);
    reiniciarButton.mousePressed(() => {
      ParticleSystem.inicializar();
      VisualEffects.reiniciar();
      background(Config.colorFondo);
    });
    
    let guardarButton = createButton('Guardar Imagen');
    guardarButton.parent(seccion);
    guardarButton.mousePressed(() => {
      VisualEffects.guardarImagen();
    });
  },
  
  // Método auxiliar para crear secciones plegables
  _crearSeccionPlegable(titulo) {
    console.log(`Creando sección plegable: ${titulo}`);
    
    // Crear contenedor principal
    let seccion = createDiv();
    seccion.class('collapsible-section');
    seccion.parent(this.controlPanel);
    
    // Crear encabezado - asegurarse de que sea clicable
    let header = createDiv();
    header.class('collapsible-header');
    header.attribute('role', 'button'); // Semántica ARIA para accesibilidad
    header.attribute('tabindex', '0');  // Permite foco del teclado
    header.parent(seccion);
    
    // Añadir título
    let headerTitle = createElement('h3', titulo);
    headerTitle.parent(header);
    
    // Añadir icono para mostrar/ocultar
    let icon = createSpan('▼');
    icon.class('collapse-icon');
    icon.parent(header);
    
    // Crear contenido
    let content = createDiv();
    content.class('collapsible-content');
    content.parent(seccion);
    
    // Almacenar referencia para poder acceder desde JavaScript
    seccion.elt.setAttribute('data-title', titulo);
    
    // No añadimos event listener aquí, se gestionará en _inicializarSeccionesPlegables()
    
    return content;
  },
  
  // Inicializar comportamiento de las secciones plegables
  _inicializarSeccionesPlegables() {
    console.log("Inicializando comportamiento de secciones plegables");
    
    // Usar selectAll para obtener todos los headers
    const headers = selectAll('.collapsible-header');
    console.log(`Encontrados ${headers.length} headers de secciones plegables`);
    
    // La sección básica debe estar abierta por defecto
    const seccionBasica = document.querySelector('.collapsible-section[data-title="Configuración Básica"]');
    if (seccionBasica) {
      seccionBasica.classList.add('active');
      console.log('Sección Configuración Básica activada por defecto');
    } else {
      console.warn('No se encontró la sección Configuración Básica');
    }
    
    // Iterar sobre cada header y asignar el manejador de eventos de forma explícita
    headers.forEach(header => {
      header.elt.addEventListener('click', function() {
        // Usar la propiedad parentElement del elemento DOM
        const section = this.parentElement;
        
        // Alternar la clase 'active' para mostrar/ocultar el contenido
        if (section.classList.contains('active')) {
          section.classList.remove('active');
          console.log(`Sección plegada: ${section.getAttribute('data-title')}`);
        } else {
          section.classList.add('active');
          console.log(`Sección desplegada: ${section.getAttribute('data-title')}`);
        }
      });
    });
    
    // Para depuración - registrar todos los títulos de secciones
    headers.forEach(header => {
      const title = header.elt.getElementsByTagName('h3')[0]?.innerText || 'Sin título';
      console.log(`Configurado header: ${title}`);
    });
  },
  
  // Función auxiliar para crear un control de color
  _crearControlColor(contenedor, nombre, indice) {
    let colorContainer = createDiv();
    colorContainer.class('color-picker-container');
    colorContainer.parent(contenedor);
    
    // Layout horizontal para el control
    colorContainer.style('display', 'flex');
    colorContainer.style('align-items', 'center');
    colorContainer.style('margin-bottom', '10px');
    
    // Previsualización del color actual
    let preview = createDiv();
    preview.class('color-preview-small');
    preview.id(`color-preview-${indice}`);
    preview.parent(colorContainer);
    preview.style('width', '30px');
    preview.style('height', '30px');
    preview.style('margin-right', '10px');
    preview.style('border-radius', '4px');
    preview.style('border', '1px solid rgba(255, 255, 255, 0.2)');
    preview.style('cursor', 'pointer');
    
    // Contenedor para el nombre y el selector
    let infoContainer = createDiv();
    infoContainer.style('flex-grow', '1');
    infoContainer.parent(colorContainer);
    
    let label = createElement('label', nombre);
    label.class('color-picker-label');
    label.parent(infoContainer);
    label.style('margin-bottom', '3px');
    
    // Asegurar que la paleta tenga colores antes de inicializar
    if (Config.paletaColores.length === 0) {
      ColorUtils.inicializarPaleta();
    }
    
    // Obtener el color actual para este índice
    const colorActual = Config.paletaColores[indice] || color(255, 255, 255);
    
    // Input de selección de color
    let colorPicker = createColorPicker(colorActual);
    colorPicker.id(`color-picker-${indice}`);
    colorPicker.parent(infoContainer);
    colorPicker.style('width', '95%');
    
    // Establecer el color inicial en la previsualización
    preview.style('background-color', colorActual.toString());
    
    // Al hacer clic en la previsualización, marcar este color como seleccionado
    preview.mousePressed(() => {
      // Quitar selección previa
      selectAll('.color-preview-small').forEach(el => el.style('border', '1px solid rgba(255, 255, 255, 0.2)'));
      
      // Marcar este color como seleccionado
      preview.style('border', '2px solid #5e72e4');
      window.selectedColorIndex = indice;
    });
    
    // Manejar cambios en el color
    colorPicker.input(() => {
      // Obtener el color seleccionado como string para evitar problemas con el tipo
      const nuevoColor = colorPicker.value();
      
      // Usar el método centralizado para actualizar el color
      this._actualizarColorEnPaleta(indice, nuevoColor, true);
    });
    
    // Añadir a una lista para actualizarlos más tarde
    if (!this.colorPickers) this.colorPickers = [];
    this.colorPickers.push({ picker: colorPicker, preview: preview, index: indice });
  },
  
  // Función para actualizar los controles de color con los valores actuales
  _actualizarControlesColor() {
    if (!this.colorPickers) return;
    
    // Asegurar que la paleta tenga colores antes de actualizar
    if (Config.paletaColores.length === 0) {
      ColorUtils.inicializarPaleta();
    }
    
    console.log("Actualizando controles de color. Paleta actual:", Config.paletaColores.length, "colores");
    
    for (let control of this.colorPickers) {
      if (Config.paletaColores.length > control.index) {
        const colorActual = Config.paletaColores[control.index];
        console.log(`Actualizando picker ${control.index} con color: ${colorActual.toString()}`);
        
        // Actualizar picker y preview sin guardar como reciente (actualización programática)
        control.picker.value(colorActual.toString());
        control.preview.style('background-color', colorActual.toString());
      }
    }
  },
  
  toggleVisibilidad() {
    Config.controlVisible = !Config.controlVisible;
    let controles = select('#controles');
    const backdrop = document.getElementById('modal-backdrop');
    
    if (typeof DeviceDetector !== 'undefined' && DeviceDetector.isMobile) {
      // Enfoque modal para dispositivos móviles
      if (Config.controlVisible) {
        // Mostrar el fondo modal primero
        if (backdrop) backdrop.classList.add('visible');
        
        // Luego mostrar el panel
        if (controles) {
        controles.style('display', 'block');
        }
        
        // Registrar evento de cierre al tocar fuera
        if (backdrop) {
          backdrop.onclick = () => {
            this.toggleVisibilidad();
          };
        }
      } else {
        // Ocultar panel
        if (controles) {
        controles.style('display', 'none');
        }
        
        // Ocultar backdrop
        if (backdrop) {
          backdrop.classList.remove('visible');
          backdrop.onclick = null;
        }
      }
    } else {
      // Comportamiento original para escritorio
      if (controles) {
        controles.style('display', Config.controlVisible ? 'block' : 'none');
      }
    }
    
    // Actualizar botón de menú
    const menuButton = document.querySelector('.action-button[title*="Controles"]');
    if (menuButton) {
      if (Config.controlVisible) {
        menuButton.classList.add('active');
      } else {
        menuButton.classList.remove('active');
      }
    }
  },
  
  // Función para alternar la visibilidad del popup de ayuda
  toggleHelpPopup() {
    const helpPopup = document.getElementById('help-popup');
    helpPopup.classList.toggle('visible');
  },
  
  // Función para guardar la imagen del canvas
  guardarImagen() {
    console.log("Guardando imagen...");
    saveCanvas('pattern-animator', 'png');
  },
  
  // Función para activar pantalla completa
  toggleFullscreen() {
    console.log("Alternando pantalla completa");
    if (!fullscreen()) {
      fullscreen(true);
    } else {
      fullscreen(false);
    }
  },
  
  // Función para cerrar el popup de bienvenida
  closeWelcomePopup() {
    console.log("Cerrando popup de bienvenida");
    const welcomePopup = document.getElementById('welcome-popup');
    welcomePopup.classList.add('hidden');
    
    // Eliminar el popup del DOM después de la animación
    setTimeout(() => {
      if (welcomePopup && welcomePopup.parentNode) {
        welcomePopup.parentNode.removeChild(welcomePopup);
      }
    }, 500); // Tiempo suficiente para que termine la animación
    
    // Para dispositivos móviles, mostrar un tooltip sobre cómo usar la aplicación
    if (typeof DeviceDetector !== 'undefined' && DeviceDetector.isMobile) {
      this._mostrarTutorialMovil();
    }
  },
  
  // Función para verificar si debemos mostrar el popup de bienvenida
  checkWelcomePopup() {
    console.log("Verificando si se debe mostrar el popup de bienvenida");
    const welcomePopup = document.getElementById('welcome-popup');
    
    // Siempre mostrar el popup al recargar la página
    if (welcomePopup) {
      console.log("Mostrando popup de bienvenida");
      // El popup ya está visible por defecto
    }
  },
  
  // Función para alternar la función de añadir partículas al hacer clic
  toggleAddParticleOnClick() {
    this.addParticleOnClickEnabled = !this.addParticleOnClickEnabled;
    
    // Actualizar la apariencia del botón
    const btnElement = document.querySelector('.action-button[title*="Partículas con Clic"]');
    if (btnElement) {
      if (this.addParticleOnClickEnabled) {
        btnElement.classList.add('active');
      } else {
        btnElement.classList.remove('active');
      }
    }
    
    console.log(`Añadir partículas con clic: ${this.addParticleOnClickEnabled ? 'Activado' : 'Desactivado'}`);
  },
  
  // Método para verificar si está habilitada la creación de partículas con clic
  shouldAddParticleOnClick() {
    return this.addParticleOnClickEnabled;
  },
  
  // Método para mostrar un tutorial breve en dispositivos móviles
  _mostrarTutorialMovil() {
    // Crear tooltips secuenciales
    const tooltips = [
      {
        mensaje: 'Toca aquí para mostrar los controles',
        posicion: 'right',
        target: '.action-button[title*="Controles"]',
        duracion: 4000
      },
      {
        mensaje: 'Toca la pantalla para añadir partículas',
        posicion: 'bottom',
        target: 'canvas',
        duracion: 4000
      },
      {
        mensaje: 'Usa estos botones para controlar la animación',
        posicion: 'top',
        target: '#action-buttons',
        duracion: 4000
      }
    ];
    
    // Mostrar tooltips en secuencia
    let delay = 1000;
    tooltips.forEach((tooltip, index) => {
      setTimeout(() => {
        this._mostrarTooltip(tooltip.mensaje, tooltip.posicion, tooltip.target, tooltip.duracion);
      }, delay);
      delay += tooltip.duracion + 500; // Esperar a que termine el tooltip anterior más un pequeño delay
    });
  },
  
  // Método para mostrar un tooltip
  _mostrarTooltip(mensaje, posicion, targetSelector, duracion = 3000) {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    
    // Crear tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip';
    tooltip.textContent = mensaje;
    
    // Estilar tooltip
    tooltip.style.position = 'fixed';
    tooltip.style.padding = '10px 15px';
    tooltip.style.backgroundColor = 'rgba(30, 39, 46, 0.9)';
    tooltip.style.color = 'white';
    tooltip.style.borderRadius = '5px';
    tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    tooltip.style.zIndex = '1000';
    tooltip.style.maxWidth = '200px';
    tooltip.style.textAlign = 'center';
    tooltip.style.fontSize = '14px';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.3s ease';
    
    // Posicionar tooltip
    const targetRect = target.getBoundingClientRect();
    
    switch (posicion) {
      case 'top':
        tooltip.style.bottom = (window.innerHeight - targetRect.top + 10) + 'px';
        tooltip.style.left = (targetRect.left + targetRect.width / 2) + 'px';
        tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        tooltip.style.top = (targetRect.bottom + 10) + 'px';
        tooltip.style.left = (targetRect.left + targetRect.width / 2) + 'px';
        tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'left':
        tooltip.style.right = (window.innerWidth - targetRect.left + 10) + 'px';
        tooltip.style.top = (targetRect.top + targetRect.height / 2) + 'px';
        tooltip.style.transform = 'translateY(-50%)';
        break;
      case 'right':
        tooltip.style.left = (targetRect.right + 10) + 'px';
        tooltip.style.top = (targetRect.top + targetRect.height / 2) + 'px';
        tooltip.style.transform = 'translateY(-50%)';
        break;
    }
    
    // Añadir al DOM
    document.body.appendChild(tooltip);
    
    // Mostrar y luego ocultar
    setTimeout(() => { tooltip.style.opacity = '1'; }, 10);
    setTimeout(() => { 
      tooltip.style.opacity = '0'; 
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 300);
    }, duracion);
  },
  
  // Método para guardar colores recientes
  _guardarColorReciente(nuevoColor) {
    if (!window.coloresRecientes) {
      window.coloresRecientes = [];
    }
    
    // Solo agregar colores válidos y bien formateados
    if (!nuevoColor || nuevoColor === 'undefined' || nuevoColor === 'null') {
      console.warn('Intentando guardar un color no válido:', nuevoColor);
      return;
    }
    
    // Asegurarse de que el color tenga el formato correcto
    try {
      // Normalizar el formato del color para evitar duplicados por formato
      const colorTemp = color(nuevoColor);
      // Convertir a formato hexadecimal para almacenamiento consistente
      nuevoColor = colorTemp.toString('#rrggbb');
    } catch (e) {
      console.error('Error al normalizar color:', e);
      return;
    }
    
    // Comprobar si el color ya está en la lista (para no duplicarlo)
    const existe = window.coloresRecientes.findIndex(colorGuardado => 
      color(colorGuardado).toString('#rrggbb') === nuevoColor
    );
    
    if (existe !== -1) {
      // Si el color ya existe, moverlo al principio (sin duplicar)
      window.coloresRecientes.splice(existe, 1);
    }
    
    // Añadir al principio 
    window.coloresRecientes.unshift(nuevoColor);
    
    // Mantener solo los 5 más recientes
    if (window.coloresRecientes.length > 5) {
      window.coloresRecientes = window.coloresRecientes.slice(0, 5);
    }
    
    // Guardar en localStorage para persistencia
    try {
      localStorage.setItem('coloresRecientes', JSON.stringify(window.coloresRecientes));
    } catch (e) {
      console.warn('No se pudo guardar colores en localStorage:', e);
    }
    
    // Actualizar los botones de colores recientes
    this._actualizarBotonesColoresRecientes();
    
    // Debug para verificar el estado de los colores recientes
    console.log('Colores recientes actualizados:', window.coloresRecientes);
  },
  
  // Método para actualizar los botones de colores recientes
  _actualizarBotonesColoresRecientes() {
    const botones = selectAll('.color-reciente');
    
    botones.forEach((btn, i) => {
      if (window.coloresRecientes && window.coloresRecientes[i]) {
        btn.style('background-color', window.coloresRecientes[i]);
        btn.style('opacity', '1');
      } else {
        btn.style('background-color', '#888888');
        btn.style('opacity', '0.3');
      }
    });
  },
  
  // Método para actualizar el color en la paleta
  _actualizarColorEnPaleta(indice, nuevoColor, guardarComoReciente = true) {
    console.log(`Actualizando color ${indice} a: ${nuevoColor}`);
    
    // Actualizar la visualización del color
    if (this.colorPickers && this.colorPickers[indice]) {
      this.colorPickers[indice].preview.style('background-color', nuevoColor);
    }
    
    // Actualizar la paleta usando ColorUtils
    ColorUtils.actualizarColor(indice, color(nuevoColor));
    
    // Guardar en colores recientes SOLO si se solicitó específicamente
    // (cuando el usuario elige un color manualmente)
    if (guardarComoReciente) {
      this._guardarColorReciente(nuevoColor);
    }
    
    // Actualizar todas las partículas existentes con los nuevos colores
    for (let p of ParticleSystem.particulas) {
      // Asignar colores de la paleta actualizada
      p.color = ColorUtils.obtenerColorAleatorio();
    }
  },
  
  // Método para aplicar una paleta predefinida
  _aplicarPaletaPredefinida(tipoPaleta) {
    console.log(`Aplicando paleta predefinida: ${tipoPaleta}`);
    
    const paletas = {
      'Azules': [
        color(4, 80, 242),   // Azul eléctrico
        color(0, 20, 63),    // Azul oscuro
        color(4, 110, 242),  // Azul medio
        color(2, 128, 242),  // Azul claro
        color(11, 239, 223)  // Cyan
      ],
      'Rojos': [
        color(255, 0, 0),    // Rojo
        color(180, 0, 0),    // Rojo oscuro
        color(255, 60, 60),  // Rojo claro
        color(255, 100, 100),// Rosa
        color(128, 0, 0)     // Granate
      ],
      'Verdes': [
        color(0, 128, 0),    // Verde
        color(0, 64, 0),     // Verde oscuro
        color(0, 200, 0),    // Verde claro
        color(0, 255, 0),    // Lima
        color(150, 255, 150) // Verde pastel
      ],
      'Degradado Arcoíris': [
        color(255, 0, 0),    // Rojo
        color(255, 165, 0),  // Naranja
        color(255, 255, 0),  // Amarillo
        color(0, 128, 0),    // Verde
        color(0, 0, 255)     // Azul
      ],
      'Neón': [
        color(255, 0, 255),  // Magenta neón
        color(0, 255, 255),  // Cyan neón
        color(255, 255, 0),  // Amarillo neón
        color(0, 255, 0),    // Verde neón
        color(255, 0, 128)   // Rosa neón
      ],
      'Monocromático': [
        color(255, 255, 255),// Blanco
        color(200, 200, 200),// Gris claro
        color(150, 150, 150),// Gris medio
        color(100, 100, 100),// Gris oscuro
        color(50, 50, 50)    // Casi negro
      ],
      'Pastel': [
        color(255, 209, 220),// Rosa pastel
        color(209, 231, 255),// Azul pastel
        color(255, 239, 213),// Melocotón pastel
        color(221, 255, 209),// Verde pastel
        color(243, 209, 255) // Lila pastel
      ]
    };
    
    // Aplicar la paleta seleccionada
    if (paletas[tipoPaleta]) {
      // Actualizar la configuración con los nuevos colores
      Config.paletaColores = [];
      
      // Añadir colores principales
      paletas[tipoPaleta].forEach(col => {
        Config.paletaColores.push(col);
      });
      
      // Añadir variantes con transparencia
      paletas[tipoPaleta].forEach((col, i) => {
        const transparencia = [180, 200, 160, 140, 120][i];
        Config.paletaColores.push(color(red(col), green(col), blue(col), transparencia));
      });
      
      // Actualizar los controles de color
      this._actualizarControlesColor();
      
      // Reiniciar el sistema para aplicar los nuevos colores
      ParticleSystem.inicializar();
    }
  },
  
  // Mostrar/ocultar el modal de grabación
  toggleGrabacionModal() {
    const modal = document.getElementById('grabacion-modal');
    modal.classList.toggle('visible');
    
    if (!modal.classList.contains('visible') && this.grabacionEnProgreso) {
      this.detenerGrabacion();
    }
  },
  
  // Seleccionar duración de la grabación
  seleccionarDuracion(duracion) {
    this.grabacionDuracion = duracion;
    
    // Actualizar botones
    const botones = document.querySelectorAll('.duracion-btn');
    botones.forEach(btn => {
      btn.classList.remove('active');
      if (parseInt(btn.dataset.duracion) === duracion) {
        btn.classList.add('active');
      }
    });
    
    console.log(`Duración de grabación ajustada a ${duracion}s`);
  },
  
  // Seleccionar formato de video (por ahora siempre es WebM)
  seleccionarFormato(formato) {
    if (formato !== 'webm') {
      console.log('Solo se soporta formato WebM por ahora');
      return;
    }
    
    this.grabacionFormato = formato;
    
    // Actualizar botones
    const botones = document.querySelectorAll('.formato-btn:not(.disabled)');
    botones.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.formato === formato) {
        btn.classList.add('active');
      }
    });
    
    console.log(`Formato de video ajustado a ${formato}`);
  },
  
  // Descargar video (función helper)
  _descargarVideo(blob, formato) {
    console.log(`Descargando video en formato ${formato}`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `pattern-animator-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${formato}`;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar después de un tiempo
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },
  
  // Procesar video grabado (simplificado a solo WebM)
  _procesarVideo(blob) {
    console.log(`Procesando video WebM`);
    
    try {
      // Mostrar un breve mensaje de procesamiento
      const loading = document.getElementById('loading-indicator');
      const loadingText = loading.querySelector('p');
      loadingText.textContent = 'Procesando video...';
      loading.style.display = 'flex';
      
      // Pequeña pausa para mostrar el mensaje
      setTimeout(() => {
        // Descargar el video WebM
        this._descargarVideo(blob, 'webm');
        
        // Ocultar indicador
        loading.style.display = 'none';
        loadingText.textContent = 'Cargando...';
      }, 300);
      
    } catch (error) {
      console.error('Error al procesar el video:', error);
      alert('Hubo un problema al procesar el video. Inténtalo de nuevo.');
      
      // Ocultar indicador
      const loading = document.getElementById('loading-indicator');
      loading.style.display = 'none';
      const loadingText = loading.querySelector('p');
      loadingText.textContent = 'Cargando...';
    }
  },
  
  // Iniciar grabación del canvas
  iniciarGrabacion() {
    if (this.grabacionEnProgreso) {
      console.log('Ya hay una grabación en progreso');
      return;
    }
    
    // Verificar soporte para MediaRecorder
    if (!navigator.mediaDevices || !MediaRecorder) {
      alert('Tu navegador no soporta la API de grabación de medios. Intenta con Chrome, Firefox o Edge actualizado.');
      return;
    }
    
    try {
      console.log(`Iniciando grabación de ${this.grabacionDuracion} segundos en formato WebM...`);
      
      // Obtener el canvas
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        console.error('No se encontró el canvas para grabar');
        return;
      }
      
      // Configurar la calidad del video
      const stream = canvas.captureStream(60);
      this.grabacionChunks = [];
      
      // Configurar el MediaRecorder con opciones optimizadas
      let opciones = {};
      
      // Intentar usar el códec más eficiente disponible
      try {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
          console.log('Usando códec VP9');
          opciones = { 
            mimeType: 'video/webm;codecs=vp9', 
            videoBitsPerSecond: 8000000 
          };
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          console.log('Usando códec VP8');
          opciones = { 
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 8000000
          };
        } else {
          console.log('Usando códec por defecto');
        }
        
        this.mediaRecorder = new MediaRecorder(stream, opciones);
      } catch (e) {
        console.warn('Error al configurar el codec:', e);
        this.mediaRecorder = new MediaRecorder(stream);
      }
      
      // Mostrar indicador de grabación
      const indicador = document.getElementById('grabacion-indicador');
      indicador.classList.add('visible');
      
      // Cambiar texto del botón
      const btnGrabar = document.getElementById('iniciar-grabacion');
      btnGrabar.textContent = 'Grabando...';
      btnGrabar.classList.add('grabando');
      
      // Iniciar temporizador para actualizar tiempo
      this.grabacionEnProgreso = true;
      this.grabacionTiempoInicio = Date.now();
      this.actualizarTiempoGrabacion();
      this.grabacionTemporizador = setInterval(() => this.actualizarTiempoGrabacion(), 1000);
      
      // Eventos del MediaRecorder
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.grabacionChunks.push(e.data);
        }
      };
      
      this.mediaRecorder.onstop = async () => {
        // Crear blob con todos los fragmentos
        const blob = new Blob(this.grabacionChunks, { type: 'video/webm' });
        console.log(`Video WebM grabado: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Procesar el video
        this._procesarVideo(blob);
        
        // Restablecer estado
        this.grabacionEnProgreso = false;
        this.grabacionChunks = [];
        
        // Ocultar indicador
        document.getElementById('grabacion-indicador').classList.remove('visible');
        
        // Cambiar botón a estado normal
        const btnGrabar = document.getElementById('iniciar-grabacion');
        btnGrabar.textContent = 'Grabar';
        btnGrabar.classList.remove('grabando');
        
        console.log('Grabación finalizada');
      };
      
      // Configurar la duración de grabación y programar detención automática
      this.mediaRecorder.start();
      console.log('MediaRecorder iniciado correctamente');
      
      setTimeout(() => {
        if (this.grabacionEnProgreso) {
          this.detenerGrabacion();
        }
      }, this.grabacionDuracion * 1000);
      
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
      console.error('Stack trace:', error.stack);
      alert(`Error al iniciar la grabación: ${error.message}`);
    }
  },
  
  // Detener grabación
  detenerGrabacion() {
    if (!this.grabacionEnProgreso) {
      console.log('No hay grabación para detener');
      return;
    }
    
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
        console.log('Grabación detenida manualmente');
      }
      
      // Limpiar temporizador
      if (this.grabacionTemporizador) {
        clearInterval(this.grabacionTemporizador);
        this.grabacionTemporizador = null;
      }
      
    } catch (error) {
      console.error('Error al detener la grabación:', error);
    }
  },
  
  // Actualizar el tiempo mostrado en el indicador de grabación
  actualizarTiempoGrabacion() {
    if (!this.grabacionEnProgreso) return;
    
    const tiempoTranscurrido = Math.floor((Date.now() - this.grabacionTiempoInicio) / 1000);
    const tiempoRestante = Math.max(0, this.grabacionDuracion - tiempoTranscurrido);
    
    document.getElementById('grabacion-tiempo').textContent = `Grabando: ${tiempoRestante}s`;
  },
}; 