/**
 * ui.js
 * Interfaz de usuario
 */
const UI = {
  controlPanel: null,
  addParticleOnClickEnabled: true, // Por defecto está habilitado
  
  crearControles() {
    console.log("Creando panel de control");
    
    this.controlPanel = createDiv();
    this.controlPanel.id('controles');
    
    let titulo = createElement('h3', 'Pattern Animator');
    titulo.parent(this.controlPanel);
    
    // Secciones siempre visibles
    this._crearSeccionBasica();
    
    // Secciones plegables
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
  
  // Crea una sección básica siempre visible
  _crearSeccionBasica() {
    let seccionBasica = createDiv();
    seccionBasica.parent(this.controlPanel);
    seccionBasica.class('control-section');
    
    // Configuración del Canvas
    let canvasLabel = createElement('h3', 'Configuración Básica');
    canvasLabel.parent(seccionBasica);
    
    // Dimensiones del canvas (en una línea)
    let canvasDimensionsDiv = createDiv();
    canvasDimensionsDiv.class('input-group');
    canvasDimensionsDiv.parent(seccionBasica);
    
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
    aplicarTamanoBtn.parent(seccionBasica);
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
    cantidadLabel.parent(seccionBasica);
    
    let cantidadSlider = createSlider(1, 500, Config.cantidadParticulas);
    cantidadSlider.parent(seccionBasica);
    cantidadSlider.input(() => {
      Config.cantidadParticulas = cantidadSlider.value();
      cantidadLabel.html('Cantidad de partículas: ' + Config.cantidadParticulas);
      
      // Reinicializar para mantener el patrón
      ParticleSystem.inicializar();
    });
    
    // Tamaño de partículas
    let tamanoLabel = createElement('p', 'Tamaño: ' + Config.tamanoParticula);
    tamanoLabel.parent(seccionBasica);
    
    let tamanoSlider = createSlider(1, 50, Config.tamanoParticula);
    tamanoSlider.parent(seccionBasica);
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
    velocidadLabel.parent(seccionBasica);
    
    let velocidadSlider = createSlider(0, 100, Config.velocidadMaxima);
    velocidadSlider.parent(seccionBasica);
    velocidadSlider.input(() => {
      Config.velocidadMaxima = velocidadSlider.value();
      velocidadLabel.html('Velocidad: ' + Config.velocidadMaxima);
      
      // Actualizar velocidad en partículas existentes
      for (let p of ParticleSystem.particulas) {
        p.maxSpeed = Config.velocidadMaxima;
      }
    });
  },
  
  // Crear sección plegable para los patrones iniciales
  _crearSeccionPatrones() {
    let seccion = this._crearSeccionPlegable('Patrón Inicial');
    
    let patronSelector = createSelect();
    patronSelector.parent(seccion);
    
    // Agregar las opciones disponibles
    for (let patron of Config.patronesDisponibles) {
      patronSelector.option(patron);
    }
    
    // Establecer el valor actual
    patronSelector.selected(Config.patronInicial);
    
    // Manejar cambios en la selección
    patronSelector.changed(() => {
      Config.patronInicial = patronSelector.value();
      console.log(`Patrón seleccionado: ${Config.patronInicial}`);
      
      // Reiniciar el sistema de partículas para aplicar el nuevo patrón
      ParticleSystem.inicializar();
    });
    
    // Botón para aplicar manualmente
    let aplicarPatronBtn = createButton('Aplicar Patrón');
    aplicarPatronBtn.parent(seccion);
    aplicarPatronBtn.mousePressed(() => {
      ParticleSystem.inicializar();
    });
  },
  
  // Crear sección plegable para la paleta de colores
  _crearSeccionPaletaColores() {
    let seccion = this._crearSeccionPlegable('Paleta de Colores');
    
    // Crear controles para cada color principal
    const nombresColores = ['Color 01', 'Color 02', 'Color 03', 'Color 04', 'Color 05'];
    
    for (let i = 0; i < 5; i++) {
      this._crearControlColor(seccion, nombresColores[i], i);
    }
    
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
            this.colorPickers[colorSeleccionado].picker.value(window.coloresRecientes[i]);
            this._actualizarColorEnPaleta(colorSeleccionado, window.coloresRecientes[i]);
          }
        }
      });
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
    
    // Forma de partícula
    let formaLabel = createElement('p', 'Forma:');
    formaLabel.parent(seccion);
    
    let formaSelector = createSelect();
    formaSelector.parent(seccion);
    
    // Usar las formas disponibles desde la configuración
    for (let forma of Config.formasDisponibles) {
      formaSelector.option(forma);
    }
    
    formaSelector.selected(Config.formaParticula);
    formaSelector.changed(() => {
      Config.formaParticula = formaSelector.value();
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
    
    // Color de fondo
    let fondoLabel = createElement('p', 'Color de fondo:');
    fondoLabel.parent(seccion);
    
    let fondoInput = createInput(Config.colorFondo, 'color');
    fondoInput.parent(seccion);
    fondoInput.input(() => {
      Config.colorFondo = fondoInput.value();
      background(Config.colorFondo);
      VisualEffects.reiniciar();
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
    
    return content;
  },
  
  // Inicializar comportamiento de las secciones plegables
  _inicializarSeccionesPlegables() {
    console.log("Inicializando comportamiento de secciones plegables");
    
    // Usar selectAll para obtener todos los headers
    const headers = selectAll('.collapsible-header');
    console.log(`Encontrados ${headers.length} headers de secciones plegables`);
    
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
    
    let label = createElement('label', nombre);
    label.class('color-picker-label');
    label.parent(colorContainer);
    
    // Previsualización del color actual
    let preview = createDiv();
    preview.class('color-preview');
    preview.id(`color-preview-${indice}`);
    preview.parent(colorContainer);
    
    // Al hacer clic en la previsualización, marcar este color como seleccionado
    preview.mousePressed(() => {
      // Quitar selección previa
      selectAll('.color-preview').forEach(el => el.style('border', '1px solid rgba(255, 255, 255, 0.2)'));
      
      // Marcar este color como seleccionado
      preview.style('border', '2px solid #5e72e4');
      window.selectedColorIndex = indice;
    });
    
    // Asegurar que la paleta tenga colores antes de inicializar
    if (Config.paletaColores.length === 0) {
      ColorUtils.inicializarPaleta();
    }
    
    // Obtener el color actual para este índice
    const colorActual = Config.paletaColores[indice] || color(255, 255, 255);
    
    // Input de selección de color
    let colorPicker = createColorPicker(colorActual);
    colorPicker.id(`color-picker-${indice}`);
    colorPicker.parent(colorContainer);
    colorPicker.style('width', '100%');
    
    // Establecer el color inicial en la previsualización
    preview.style('background-color', colorActual.toString());
    
    // Manejar cambios en el color
    colorPicker.input(() => {
      // Obtener el color seleccionado como string para evitar problemas con el tipo
      const nuevoColor = colorPicker.value();
      
      // Usar el método centralizado para actualizar el color
      this._actualizarColorEnPaleta(indice, nuevoColor);
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
        
        // Actualizar picker y preview
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
      window.coloresRecientes.unshift(nuevoColor);
    } else {
      // Añadir al principio 
      window.coloresRecientes.unshift(nuevoColor);
      // Mantener solo los 5 más recientes
      if (window.coloresRecientes.length > 5) {
        window.coloresRecientes = window.coloresRecientes.slice(0, 5);
      }
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
  _actualizarColorEnPaleta(indice, nuevoColor) {
    console.log(`Actualizando color ${indice} a: ${nuevoColor}`);
    
    // Actualizar la visualización del color
    if (this.colorPickers && this.colorPickers[indice]) {
      this.colorPickers[indice].preview.style('background-color', nuevoColor);
    }
    
    // Actualizar la paleta usando ColorUtils
    ColorUtils.actualizarColor(indice, color(nuevoColor));
    
    // Guardar en colores recientes
    this._guardarColorReciente(nuevoColor);
    
    // Actualizar todas las partículas existentes con los nuevos colores
    for (let p of ParticleSystem.particulas) {
      // Asignar colores de la paleta actualizada
      p.color = ColorUtils.obtenerColorAleatorio();
    }
  }
}; 