/**
 * main.js
 * Punto de entrada principal de la aplicación
 */

// Variables para dimensiones del campo
let cols, rows;

// Contador de frames para optimización
let frameCounter = 0;

function setup() {
  console.log("=== Iniciando Pattern Animator - Versión Modular ===");
  
  // Crear canvas con las dimensiones de la configuración
  let canvas = createCanvas(Config.canvasWidth, Config.canvasHeight);
  
  // Inicializar módulos
  ColorUtils.inicializarPaleta();
  
  let dimensiones = FlowField.inicializar(width, height, Config.escala);
  cols = dimensiones.cols;
  rows = dimensiones.rows;
  
  VisualEffects.inicializar(width, height);
  ParticleSystem.inicializar();
  UI.crearControles();
  
  // Verificar si se debe mostrar el popup de bienvenida
  UI.checkWelcomePopup();
  
  // Activar por defecto el botón de añadir partículas con clic
  const btnElement = document.querySelector('.action-button[title*="Partículas con Clic"]');
  if (btnElement) {
    btnElement.classList.add('active');
  }
  
  // Si es un dispositivo móvil, adaptar la interfaz
  if (typeof DeviceDetector !== 'undefined' && DeviceDetector.isMobile) {
    // Ajustar controles iniciales
    const controles = select('#controles');
    if (controles) {
      controles.style('display', Config.controlVisible ? 'block' : 'none');
    }
    
    // Realizar capturas de eventos especiales para móviles
    _configurarEventosMoviles();
  }
  
  console.log("Setup completado");
}

function draw() {
  try {
    // 1. Preparar la escena
    let pg = VisualEffects.dibujarEscena();
    
    // 2. Calcular campo de flujo
    let campo = FlowField.calcular();
    
    // 3. Actualizar y dibujar partículas
    ParticleSystem.actualizar(campo, cols, rows);
    ParticleSystem.dibujar(pg);
    
    // 4. Mostrar escena en el canvas principal
    image(pg, 0, 0);
    
    // 5. Aplicar todos los efectos visuales configurados
    VisualEffects.aplicarEfectos();
    
    // 6. Ajustar rendimiento para dispositivos móviles (cada 60 frames)
    frameCounter++;
    if (frameCounter % 60 === 0 && typeof DeviceDetector !== 'undefined') {
      DeviceDetector.ajustarRendimiento();
    }
  } catch (e) {
    console.error("Error en draw():", e);
    console.error("Stack:", e.stack);
  }
}

// Configura eventos especiales para móviles
function _configurarEventosMoviles() {
  // Añadir evento para ocultar panel de control al tocar fuera de él
  document.addEventListener('touchstart', (event) => {
    const controles = document.getElementById('controles');
    if (Config.controlVisible && controles && !controles.contains(event.target) && 
        !event.target.closest('#action-buttons')) {
      UI.toggleVisibilidad();
    }
  });
  
  // Añadir mensaje de orientación para modo horizontal
  window.addEventListener('orientationchange', mostrarMensajeOrientacion);
  
  // Verificar orientación inicial
  mostrarMensajeOrientacion();
}

// Muestra mensaje para orientación horizontal en móviles
function mostrarMensajeOrientacion() {
  if (typeof DeviceDetector !== 'undefined' && 
      DeviceDetector.isMobile && 
      !DeviceDetector.isTablet) {
    
    // Verificar si estamos en modo retrato
    const isPortrait = window.innerHeight > window.innerWidth;
    
    // Crear o actualizar el mensaje de orientación
    let orientationMsg = document.getElementById('orientation-message');
    
    if (isPortrait) {
      if (!orientationMsg) {
        orientationMsg = document.createElement('div');
        orientationMsg.id = 'orientation-message';
        orientationMsg.style.position = 'fixed';
        orientationMsg.style.top = '10px';
        orientationMsg.style.left = '50%';
        orientationMsg.style.transform = 'translateX(-50%)';
        orientationMsg.style.backgroundColor = 'rgba(30, 39, 46, 0.8)';
        orientationMsg.style.color = 'white';
        orientationMsg.style.padding = '10px 15px';
        orientationMsg.style.borderRadius = '5px';
        orientationMsg.style.zIndex = '1000';
        orientationMsg.style.textAlign = 'center';
        orientationMsg.style.fontSize = '14px';
        orientationMsg.style.transition = 'opacity 0.5s ease';
        orientationMsg.innerHTML = 'Para una mejor experiencia, gira tu dispositivo a modo horizontal <span class="material-icons" style="vertical-align: middle;">screen_rotation</span>';
        document.body.appendChild(orientationMsg);
        
        // Ocultar después de unos segundos
        setTimeout(() => {
          orientationMsg.style.opacity = '0';
        }, 5000);
      } else {
        orientationMsg.style.display = 'block';
        orientationMsg.style.opacity = '1';
        setTimeout(() => {
          orientationMsg.style.opacity = '0';
        }, 5000);
      }
    } else if (orientationMsg) {
      orientationMsg.style.display = 'none';
    }
  }
}

// Nueva función para cambiar el tamaño del canvas
function cambiarTamanoCanvas(nuevoAncho, nuevoAlto) {
  // Actualizar configuración
  Config.canvasWidth = nuevoAncho;
  Config.canvasHeight = nuevoAlto;
  
  // Redimensionar el canvas
  resizeCanvas(nuevoAncho, nuevoAlto);
  
  // Reinicializar los módulos que dependen del tamaño
  VisualEffects.inicializar(width, height);
  
  // Reinicializar el campo de flujo
  let dimensiones = FlowField.inicializar(width, height, Config.escala);
  cols = dimensiones.cols;
  rows = dimensiones.rows;
  
  // Limpiar el canvas con el color de fondo
  background(Config.colorFondo);
  
  console.log(`Canvas redimensionado a ${nuevoAncho}x${nuevoAlto}`);
}

function keyPressed() {
  if (key === 'h' || key === 'H') {
    UI.toggleVisibilidad();
  } else if (key === 's' || key === 'S') {
    VisualEffects.guardarImagen();
  } else if (key === 'r' || key === 'R') {
    // Reiniciar completamente
    ParticleSystem.inicializar();
    VisualEffects.reiniciar();
    background(Config.colorFondo); // Limpiar el canvas completamente
  } else if (key === 'f' || key === 'F') {
    let fs = fullscreen();
    fullscreen(!fs);
  } else if (key === 'c' || key === 'C') {
    // Limpiar completamente el canvas
    background(Config.colorFondo);
    VisualEffects.reiniciar();
  } else if (key === 'v' || key === 'V') {
    // Abrir/cerrar modal de grabación
    UI.toggleGrabacionModal();
  }
}

// Eventos de mouse para interacción
function mousePressed() {
  // Solo agregar partícula si la opción está habilitada
  if (UI.shouldAddParticleOnClick() && mouseX > 0 && mouseY > 0 && mouseX < width && mouseY < height) {
    ParticleSystem.agregarParticula(mouseX, mouseY);
  }
}

// Evento para pantalla táctil en móviles
function touchStarted() {
  // Verificar si el toque ocurrió en un botón o control interactivo
  // para evitar añadir partículas cuando interactuamos con la interfaz
  if (
    touches.length > 0 && 
    !touches[0].target.closest('#controles') && 
    !touches[0].target.closest('#action-buttons') && 
    !touches[0].target.closest('#help-popup') && 
    !touches[0].target.closest('#help-toggle') && 
    !touches[0].target.closest('#welcome-popup')
  ) {
    // Solo agregar partícula si la opción está habilitada
    if (UI.shouldAddParticleOnClick()) {
      for (let touch of touches) {
        if (touch.x > 0 && touch.y > 0 && touch.x < width && touch.y < height) {
          ParticleSystem.agregarParticula(touch.x, touch.y);
        }
      }
    }
  }
  
  // Importante: No prevenir comportamiento por defecto a menos que sea en el canvas
  if (touches.length > 0 && touches[0].target.nodeName.toLowerCase() === 'canvas') {
    // Solo para el canvas prevenimos el comportamiento por defecto
    return false;
  }
  
  // Para otros elementos (UI), permitimos el comportamiento por defecto
  return true;
}

// Ajustar el tamaño del canvas cuando cambia el tamaño de la ventana
function windowResized() {
  // Actualizar las dimensiones en la configuración
  Config.canvasWidth = windowWidth;
  Config.canvasHeight = windowHeight;
  
  // Ajustar el canvas al nuevo tamaño de la ventana
  resizeCanvas(windowWidth, windowHeight);
  
  // Reinicializar efectos visuales
  VisualEffects.inicializar(width, height);
  
  // Reinicializar campo de flujo
  let dimensiones = FlowField.inicializar(width, height, Config.escala);
  cols = dimensiones.cols;
  rows = dimensiones.rows;
  
  // Si se ha cambiado la orientación en un dispositivo móvil, mostrar mensaje
  if (typeof DeviceDetector !== 'undefined' && DeviceDetector.isMobile) {
    mostrarMensajeOrientacion();
  }
  
  console.log(`Canvas redimensionado a ${width}x${height} (tamaño de ventana)`);
} 