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
      console.log(`Cambiando color ${indice} a: ${nuevoColor}`);
      
      // Actualizar la paleta
      ColorUtils.actualizarColor(indice, color(nuevoColor));
      
      // Actualizar la previsualización
      preview.style('background-color', nuevoColor);
      
      // Actualizar todas las partículas existentes con los nuevos colores
      for (let p of ParticleSystem.particulas) {
        // Asignar colores de la paleta actualizada
        p.color = ColorUtils.obtenerColorAleatorio();
      }
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
    if (controles) {
      if (Config.controlVisible) {
        controles.style('display', 'block');
      } else {
        controles.style('display', 'none');
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
  }
}; 