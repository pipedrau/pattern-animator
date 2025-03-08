/**
 * main.js
 * Punto de entrada principal de la aplicación
 */

// Variables para dimensiones del campo
let cols, rows;

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
    
    // 5. Aplicar efectos adicionales
    VisualEffects.aplicarRuidoGrafico();
    VisualEffects.aplicarDesenfoque(pg);
    
  } catch (e) {
    console.error("Error en draw():", e);
    console.error("Stack:", e.stack);
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
  }
}

// Eventos de mouse para interacción
function mousePressed() {
  // Agregar partícula donde hace clic el usuario
  if (mouseX > 0 && mouseY > 0 && mouseX < width && mouseY < height) {
    ParticleSystem.agregarParticula(mouseX, mouseY);
  }
}

// Evento para pantalla táctil en móviles
function touchStarted() {
  if (touches.length > 0) {
    for (let touch of touches) {
      if (touch.x > 0 && touch.y > 0 && touch.x < width && touch.y < height) {
        ParticleSystem.agregarParticula(touch.x, touch.y);
      }
    }
  }
  
  // Para evitar comportamientos indeseados en móvil
  return false;
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
  
  console.log(`Canvas redimensionado a ${width}x${height} (tamaño de ventana)`);
} 