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
      
      // Prevenir comportamientos no deseados en móviles
      this._prevenirComportamientosNoDeseados();
    }
    
    console.log(`Detección completada - Móvil: ${this.isMobile}, Tablet: ${this.isTablet}, Táctil: ${this.isTouchDevice}`);
    
    // Para móviles, ocultar el panel de control inicialmente
    if (this.isMobile || this.isTablet) {
      Config.controlVisible = false;
    }
    
    // Añadir estilos al indicador de carga
    this._configurarIndicadorCarga();
  },
  
  /**
   * Previene comportamientos no deseados en dispositivos táctiles
   */
  _prevenirComportamientosNoDeseados() {
    // Prevenir zoom con doble toque
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
    
    // Prevenir gestos de arrastre/scroll indeseados
    document.addEventListener('touchmove', (event) => {
      // Solo previene si no estamos dentro del panel de control
      if (!event.target.closest('#controles')) {
        event.preventDefault();
      }
    }, { passive: false });
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