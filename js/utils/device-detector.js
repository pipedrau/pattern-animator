/**
 * device-detector.js
 * Utilidad para detectar el tipo de dispositivo y optimizar la experiencia de usuario
 */

const DeviceDetector = {
  isMobile: false,
  isTablet: false,
  isTouchDevice: false,
  
  /**
   * Inicializa el detector y configura las propiedades del dispositivo
   */
  inicializar() {
    console.log("Iniciando detección de dispositivo...");
    
    // Detectar si es un dispositivo móvil
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Detectar si es una tablet
    this.isTablet = /(iPad|tablet|Nexus 7)/i.test(navigator.userAgent) || 
                    (window.innerWidth >= 600 && window.innerWidth <= 1024);
    
    // Detectar si es un dispositivo táctil
    this.isTouchDevice = ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints > 0) || 
                         (navigator.msMaxTouchPoints > 0);
    
    // Aplicar clase al body
    if (this.isMobile || this.isTablet) {
      document.body.classList.add('mobile-view');
      
      // Para tabletas, ajustar el comportamiento
      if (this.isTablet) {
        document.body.classList.add('tablet-view');
      }
      
      // Para móviles (no tabletas), realizar ajustes específicos
      if (this.isMobile && !this.isTablet) {
        document.body.classList.add('smartphone-view');
        
        // Ajustar número de partículas para mejor rendimiento
        Config.cantidadParticulas = Math.min(Config.cantidadParticulas, 150);
      }
    }
    
    // Registrar eventos táctiles adecuados
    if (this.isTouchDevice) {
      document.body.classList.add('touch-device');
      
      try {
        // Prevenir comportamientos no deseados en móviles
        this._prevenirComportamientosNoDeseados();
        
        // Configurar eventos para los botones
        this._configurarBotonesTactiles();
      } catch (e) {
        console.error("Error al configurar eventos táctiles:", e);
      }
    }
    
    console.log(`Detección completada - Móvil: ${this.isMobile}, Tablet: ${this.isTablet}, Táctil: ${this.isTouchDevice}`);
    
    // Para móviles, ocultar el panel de control inicialmente
    if (this.isMobile || this.isTablet) {
      Config.controlVisible = false;
    }
    
    // Añadir estilos al indicador de carga
    this._configurarIndicadorCarga();
    
    // Reiniciar p5.js para aceptar correctamente eventos táctiles
    this._reiniciarP5TouchListeners();
  },
  
  /**
   * Configura los botones para mejor interacción táctil
   */
  _configurarBotonesTactiles() {
    // Aumentar el área de toque de los botones y elementos interactivos
    const elementosInteractivos = document.querySelectorAll('.action-button, button, .collapsible-header, #help-toggle, .popup-close');
    
    elementosInteractivos.forEach(elemento => {
      // Añadir clase para identificar elementos táctiles
      elemento.classList.add('touch-element');
      
      // Asegurar que tienen position relative para el pseudo-elemento
      if (getComputedStyle(elemento).position === 'static') {
        elemento.style.position = 'relative';
      }
    });
    
    console.log("Elementos táctiles configurados:", elementosInteractivos.length);
  },
  
  /**
   * Reinicia los listeners táctiles de p5.js para asegurar compatibilidad
   */
  _reiniciarP5TouchListeners() {
    // Solo ejecutar cuando p5 esté listo
    window.addEventListener('load', () => {
      // Asegurarse de que p5 está disponible
      if (typeof p5 !== 'undefined' && typeof touchStarted === 'function') {
        try {
          // Eliminar y volver a añadir el evento tactil
          const canvas = document.querySelector('canvas');
          if (canvas) {
            console.log("Reconfigurando eventos táctiles en p5.js");
            
            // Intentar remover listeners existentes
            canvas.removeEventListener('touchstart', null);
            
            // Crear un nuevo listener para touchstart
            canvas.addEventListener('touchstart', function(e) {
              // Solo prevenir en el canvas, no en la interfaz
              if (e.target === canvas) {
                e.preventDefault();
                
                // Llamar manualmente a p5 touchStarted si existe
                if (typeof touchStarted === 'function') {
                  touchStarted(e);
                }
              }
            }, { passive: false });
          }
        } catch (e) {
          console.warn("No se pudo reconfigurar p5 touch listeners:", e);
        }
      }
    });
  },
  
  /**
   * Previene comportamientos no deseados en dispositivos táctiles
   */
  _prevenirComportamientosNoDeseados() {
    // Prevenir zoom con doble toque sólo para elementos específicos
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      // Sólo prevenir en el canvas, no en controles
      if (!event.target.closest('#controles') && !event.target.closest('#help-popup')) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
          event.preventDefault();
        }
        lastTouchEnd = now;
      }
    }, { passive: false });
    
    // Modificado: solo prevenir gestos en el canvas, permitir scroll en controles
    document.addEventListener('touchmove', (event) => {
      // No prevenir eventos por defecto a menos que estemos en el canvas directamente
      const canvas = document.querySelector('canvas');
      if (canvas && event.target === canvas) {
        // Solo prevenir en el canvas, permitir scroll en cualquier otro lugar
        event.preventDefault();
      }
    }, { passive: false });
    
    // Agregar manejo específico para los botones de acción
    const actionButtons = document.querySelectorAll('.action-button');
    actionButtons.forEach(button => {
      button.addEventListener('touchstart', (e) => {
        // Agregar clase de estado activo
        button.classList.add('touch-active');
      });
      
      button.addEventListener('touchend', (e) => {
        // Quitar clase de estado activo
        button.classList.remove('touch-active');
      });
    });
    
    console.log("Eventos táctiles configurados correctamente");
  },
  
  /**
   * Configura el indicador de carga
   */
  _configurarIndicadorCarga() {
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (loadingIndicator) {
      // Estilo dinámico para el indicador de carga
      loadingIndicator.style.position = 'fixed';
      loadingIndicator.style.top = '0';
      loadingIndicator.style.left = '0';
      loadingIndicator.style.width = '100%';
      loadingIndicator.style.height = '100%';
      loadingIndicator.style.display = 'flex';
      loadingIndicator.style.flexDirection = 'column';
      loadingIndicator.style.justifyContent = 'center';
      loadingIndicator.style.alignItems = 'center';
      loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
      loadingIndicator.style.zIndex = '9999';
      loadingIndicator.style.color = 'white';
      
      // Estilo para el spinner
      const spinner = loadingIndicator.querySelector('.spinner');
      if (spinner) {
        spinner.style.width = '40px';
        spinner.style.height = '40px';
        spinner.style.border = '4px solid rgba(255, 255, 255, 0.3)';
        spinner.style.borderTop = '4px solid #5e72e4';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1s linear infinite';
        
        // Añadir keyframes para la animación
        if (!document.getElementById('spinner-keyframes')) {
          const style = document.createElement('style');
          style.id = 'spinner-keyframes';
          style.textContent = `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `;
          document.head.appendChild(style);
        }
      }
      
      // Ocultar el indicador cuando la página esté cargada
      window.addEventListener('load', () => {
        loadingIndicator.style.opacity = '0';
        loadingIndicator.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
          loadingIndicator.style.display = 'none';
        }, 500);
      });
    }
  },
  
  /**
   * Ajusta la configuración basándose en el rendimiento del dispositivo
   */
  ajustarRendimiento() {
    if (this.isMobile) {
      // Reducir efectos visuales costosos
      Config.desenfoque = Math.min(Config.desenfoque, 1);
      Config.ruidoGrafico = Math.min(Config.ruidoGrafico, 20);
      
      // Si está muy lento, reducir más las partículas
      const fps = frameRate();
      if (fps < 30 && Config.cantidadParticulas > 50) {
        Config.cantidadParticulas = Math.max(50, Config.cantidadParticulas * 0.8);
        ParticleSystem.inicializar();
        console.log(`Rendimiento bajo detectado (${fps.toFixed(1)} FPS). Reduciendo partículas a ${Config.cantidadParticulas}`);
      }
    }
  }
};

// Inicializar el detector de dispositivos
window.addEventListener('DOMContentLoaded', () => {
  DeviceDetector.inicializar();
}); 