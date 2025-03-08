/**
 * ui.js
 * Interfaz de usuario
 */
const UI = {
  controlPanel: null,
  
  crearControles() {
    console.log("Creando panel de control");
    
    this.controlPanel = createDiv();
    this.controlPanel.id('controles');
    
    let titulo = createElement('h3', 'Controles de Pattern Animator');
    titulo.parent(this.controlPanel);
    
    // Configuración del Canvas
    let seccionCanvas = createDiv();
    seccionCanvas.parent(this.controlPanel);
    seccionCanvas.class('control-section');
    
    let canvasLabel = createElement('h3', 'Tamaño del Canvas');
    canvasLabel.parent(seccionCanvas);
    
    // Ancho del canvas
    let anchoLabel = createElement('p', 'Ancho:');
    anchoLabel.parent(seccionCanvas);
    
    let anchoInput = createInput(Config.canvasWidth.toString());
    anchoInput.attribute('type', 'number');
    anchoInput.attribute('min', '100');
    anchoInput.attribute('max', '5000');
    anchoInput.parent(seccionCanvas);
    anchoInput.id('anchoCanvas');
    
    // Alto del canvas
    let altoLabel = createElement('p', 'Alto:');
    altoLabel.parent(seccionCanvas);
    
    let altoInput = createInput(Config.canvasHeight.toString());
    altoInput.attribute('type', 'number');
    altoInput.attribute('min', '100');
    altoInput.attribute('max', '5000');
    altoInput.parent(seccionCanvas);
    altoInput.id('altoCanvas');
    
    // Botón para aplicar el cambio de tamaño
    let aplicarTamanoBtn = createButton('Aplicar tamaño');
    aplicarTamanoBtn.parent(seccionCanvas);
    aplicarTamanoBtn.mousePressed(() => {
      let nuevoAncho = parseInt(select('#anchoCanvas').value());
      let nuevoAlto = parseInt(select('#altoCanvas').value());
      
      // Validar que los valores sean números válidos
      if (isNaN(nuevoAncho) || isNaN(nuevoAlto)) {
        alert('Por favor, introduce valores numéricos válidos.');
        return;
      }
      
      // Validar que los valores estén dentro de límites razonables
      if (nuevoAncho < 100 || nuevoAncho > 5000 || nuevoAlto < 100 || nuevoAlto > 5000) {
        alert('Por favor, introduce valores entre 100 y 5000.');
        return;
      }
      
      // Aplicar el cambio de tamaño
      cambiarTamanoCanvas(nuevoAncho, nuevoAlto);
    });
    
    // Controles básicos
    let seccionBasica = createDiv();
    seccionBasica.parent(this.controlPanel);
    seccionBasica.class('control-section');
    
    // Cantidad de partículas
    let cantidadLabel = createElement('p', 'Cantidad de partículas: ' + Config.cantidadParticulas);
    cantidadLabel.parent(seccionBasica);
    
    let cantidadSlider = createSlider(1, 500, Config.cantidadParticulas);
    cantidadSlider.parent(seccionBasica);
    cantidadSlider.input(() => {
      Config.cantidadParticulas = cantidadSlider.value();
      cantidadLabel.html('Cantidad de partículas: ' + Config.cantidadParticulas);
      
      // Ajustar la cantidad de partículas
      let diferencia = Config.cantidadParticulas - ParticleSystem.particulas.length;
      
      if (diferencia > 0) {
        // Agregar partículas
        for (let i = 0; i < diferencia; i++) {
          ParticleSystem.agregarParticula(random(width), random(height));
        }
      } else if (diferencia < 0) {
        // Eliminar partículas
        ParticleSystem.eliminarParticulas(Math.abs(diferencia));
      }
    });
    
    // Tamaño de partículas
    let tamanoLabel = createElement('p', 'Tamaño: ' + Config.tamanoParticula);
    tamanoLabel.parent(seccionBasica);
    
    let tamanoSlider = createSlider(1, 500, Config.tamanoParticula);
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
    
    // Velocidad máxima - Cambiado a rango 0-100
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
    
    // Sección de movimiento
    let seccionMovimiento = createDiv();
    seccionMovimiento.parent(this.controlPanel);
    seccionMovimiento.class('control-section');
    
    let movimientoLabel = createElement('h3', 'Modo de Movimiento');
    movimientoLabel.parent(seccionMovimiento);
    
    // Modo de movimiento
    let modoSelector = createSelect();
    modoSelector.parent(seccionMovimiento);
    
    for (let modo of Config.modosDisponibles) {
      modoSelector.option(modo);
    }
    
    modoSelector.selected(Config.modoMovimiento);
    modoSelector.changed(() => {
      Config.modoMovimiento = modoSelector.value();
    });
    
    // Turbulencia
    let turbulenciaLabel = createElement('p', 'Turbulencia: ' + Config.turbulencia);
    turbulenciaLabel.parent(seccionMovimiento);
    
    let turbulenciaSlider = createSlider(0, 1, Config.turbulencia, 0.01);
    turbulenciaSlider.parent(seccionMovimiento);
    turbulenciaSlider.input(() => {
      Config.turbulencia = turbulenciaSlider.value();
      turbulenciaLabel.html('Turbulencia: ' + Config.turbulencia.toFixed(2));
    });
    
    // Sección de apariencia
    let seccionApariencia = createDiv();
    seccionApariencia.parent(this.controlPanel);
    seccionApariencia.class('control-section');
    
    let aparienciaLabel = createElement('h3', 'Apariencia');
    aparienciaLabel.parent(seccionApariencia);
    
    // Mostrar rastro
    let rastroContainer = createDiv();
    rastroContainer.class('control-item');
    rastroContainer.parent(seccionApariencia);
    
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
    rastroLengthLabel.parent(seccionApariencia);
    
    let rastroLengthSlider = createSlider(1, 50, Config.trailLength);
    rastroLengthSlider.parent(seccionApariencia);
    rastroLengthSlider.input(() => {
      Config.trailLength = rastroLengthSlider.value();
      rastroLengthLabel.html('Longitud del rastro: ' + Config.trailLength);
      
      // Actualizar en partículas existentes
      for (let p of ParticleSystem.particulas) {
        p.maxHistory = Config.trailLength;
      }
    });
    
    // Rotación
    let rotacionLabel = createElement('p', 'Rotación: ' + Config.rotacionParticula);
    rotacionLabel.parent(seccionApariencia);
    
    let rotacionSlider = createSlider(0, 0.1, Config.rotacionParticula, 0.001);
    rotacionSlider.parent(seccionApariencia);
    rotacionSlider.input(() => {
      Config.rotacionParticula = rotacionSlider.value();
      rotacionLabel.html('Rotación: ' + Config.rotacionParticula.toFixed(3));
    });
    
    // Forma de partícula
    let formaLabel = createElement('p', 'Forma:');
    formaLabel.parent(seccionApariencia);
    
    let formaSelector = createSelect();
    formaSelector.parent(seccionApariencia);
    formaSelector.option('Círculo');
    formaSelector.option('Cuadrado');
    formaSelector.option('Triángulo');
    formaSelector.option('Irregular');
    formaSelector.selected(Config.formaParticula);
    formaSelector.changed(() => {
      Config.formaParticula = formaSelector.value();
    });
    
    // Color de fondo
    let fondoLabel = createElement('p', 'Color de fondo:');
    fondoLabel.parent(seccionApariencia);
    
    let fondoInput = createInput(Config.colorFondo, 'color');
    fondoInput.parent(seccionApariencia);
    fondoInput.input(() => {
      Config.colorFondo = fondoInput.value();
      background(Config.colorFondo);
      VisualEffects.reiniciar();
    });
    
    // Sección de efectos
    let seccionEfectos = createDiv();
    seccionEfectos.parent(this.controlPanel);
    seccionEfectos.class('control-section');
    
    let efectosLabel = createElement('h3', 'Efectos');
    efectosLabel.parent(seccionEfectos);
    
    // Ruido gráfico
    let ruidoLabel = createElement('p', 'Ruido gráfico: ' + Config.ruidoGrafico);
    ruidoLabel.parent(seccionEfectos);
    
    let ruidoSlider = createSlider(0, 100, Config.ruidoGrafico);
    ruidoSlider.parent(seccionEfectos);
    ruidoSlider.input(() => {
      Config.ruidoGrafico = ruidoSlider.value();
      ruidoLabel.html('Ruido gráfico: ' + Config.ruidoGrafico);
    });
    
    // Desenfoque
    let desenfoqueLabel = createElement('p', 'Desenfoque: ' + Config.desenfoque);
    desenfoqueLabel.parent(seccionEfectos);
    
    let desenfoqueSlider = createSlider(0, 5, Config.desenfoque, 0.1);
    desenfoqueSlider.parent(seccionEfectos);
    desenfoqueSlider.input(() => {
      Config.desenfoque = desenfoqueSlider.value();
      desenfoqueLabel.html('Desenfoque: ' + Config.desenfoque.toFixed(1));
    });
    
    // Botón para reiniciar
    let seccionAcciones = createDiv();
    seccionAcciones.parent(this.controlPanel);
    seccionAcciones.class('control-section');
    
    let accionesLabel = createElement('h3', 'Acciones');
    accionesLabel.parent(seccionAcciones);
    
    let reiniciarButton = createButton('Reiniciar Partículas');
    reiniciarButton.parent(seccionAcciones);
    reiniciarButton.mousePressed(() => {
      ParticleSystem.inicializar();
      VisualEffects.reiniciar();
      background(Config.colorFondo);
    });
    
    let guardarButton = createButton('Guardar Imagen');
    guardarButton.parent(seccionAcciones);
    guardarButton.mousePressed(() => {
      VisualEffects.guardarImagen();
    });
    
    let limpiarButton = createButton('Limpiar Canvas');
    limpiarButton.parent(seccionAcciones);
    limpiarButton.mousePressed(() => {
      background(Config.colorFondo);
      VisualEffects.reiniciar();
    });
    
    console.log("Panel de control creado");
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
  }
}; 