# Pattern Animator

Un entorno interactivo para crear animaciones basadas en patrones, partículas y efectos visuales utilizando p5.js.

## Características

- **Sistema de Partículas**: Crea y manipula partículas con diferentes comportamientos y apariencias.
- **Efectos Visuales**: Aplica efectos como kaleidoscopio, pixelado, desenfoque y ruido gráfico.
- **Patrones de Movimiento**: Elige entre diferentes patrones de movimiento como flujo de campo, espiral, circular, etc.
- **Personalización Completa**: Controla colores, formas, tamaños, velocidades y más.
- **Importación de Imágenes**: Carga archivos SVG, GIF, PNG, JPG o WEBP y conviértelos en formas para las partículas.
- **Soporte para GIFs Animados**: Utiliza GIFs animados como formas de partículas manteniendo su animación.
- **Exportación de Animaciones**: Graba y exporta tus creaciones en diferentes formatos.
- **Interfaz Intuitiva**: Panel de control completo con todas las opciones disponibles.

## Estructura del Proyecto

El proyecto está organizado en módulos para facilitar el mantenimiento y la extensibilidad:

```
Pattern Animator/
├── js/
│   ├── core/           # Núcleo del sistema de partículas
│   │   ├── Config.js   # Configuración global
│   │   ├── Particula.js # Clase Particula
│   │   └── ParticleSystem.js # Sistema de partículas
│   ├── effects/        # Efectos visuales
│   │   └── VisualEffects.js # Efectos como kaleidoscopio, ruido, etc.
│   ├── ui/             # Interfaz de usuario
│   │   ├── Controls.js # Creación de controles
│   │   └── ControlHandlers.js # Manejadores de eventos
│   ├── utils/          # Utilidades
│   │   ├── Export.js   # Exportación de animaciones
│   │   ├── SVGImport.js # Importación de SVG
│   │   └── Shapes.js   # Funciones para dibujar formas
│   └── main.js         # Archivo principal
├── Index.html          # Página HTML principal
├── Styles.css          # Estilos CSS
└── README.md           # Documentación
```

## Cómo Empezar

1. Abre el archivo `Index.html` en tu navegador.
2. Utiliza el panel de control para ajustar los parámetros de la animación.
3. Experimenta con diferentes combinaciones de efectos y movimientos.
4. Presiona 'S' para guardar una imagen, 'H' para ocultar/mostrar controles, 'F' para pantalla completa.

## Nuevas Funcionalidades

### Importación de Imágenes

Puedes cargar distintos tipos de archivos de imagen y utilizarlos como formas para las partículas:

1. Ve a la sección "Formas Personalizadas" en el panel de control.
2. Haz clic en "Importar imagen".
3. Selecciona un archivo de imagen (SVG, GIF, PNG, JPG o WEBP).
4. Las imágenes se mostrarán en la galería de formas personalizadas.
5. Haz clic en "Usar" para aplicar la forma a las partículas.

#### Soporte para GIFs Animados

Los GIFs animados se reproducirán correctamente cuando se utilizan como forma de partícula:

1. Importa un archivo GIF usando el mismo procedimiento anterior.
2. Los GIFs se identifican con un indicador especial en la galería.
3. Al usar un GIF como forma, cada partícula mostrará la animación completa.
4. La animación del GIF se reproduce a su velocidad original independientemente del frame rate de la animación principal.

### Exportación de Animaciones

Graba y exporta tus animaciones:

1. Ajusta la duración y los FPS en la sección "Grabación".
2. Haz clic en "Iniciar Grabación".
3. Espera a que termine la grabación.
4. Selecciona el formato de exportación y la calidad.
5. Haz clic en "Exportar" para descargar tu animación.

## Mejoras en Efectos Visuales

Se han implementado importantes mejoras en los efectos visuales:

1. **Control de Orden de Efectos**: Ahora puedes elegir si aplicar ciertos efectos antes o después del desenfoque:
   - Pixelado: Crea efectos de pixelado más extremos (hasta 200px) y controla si se aplica sobre el desenfoque.
   - Semitono: Conserva los colores originales y permite seleccionar entre diferentes modos de fusión.
   - Glitch: Puedes aplicarlo antes o después del desenfoque para diferentes resultados estéticos.

2. **Optimización de Efectos**:
   - Desenfoque: Implementación más eficiente usando buffers de baja resolución, con soporte para desenfoque extremo.
   - Bloom: Mejor rendimiento y calidad de resplandor.
   - Aberración cromática: Mejorada con efecto radial.

3. **Interfaz Mejorada**:
   - Organización en subsecciones plegables para mejor navegación.
   - Indicadores visuales para valores extremos.

## Requisitos

- Navegador web moderno con soporte para JavaScript y HTML5 Canvas.
- Para la exportación de GIF y secuencias PNG, se requieren bibliotecas adicionales (gif.js y JSZip).

## Personalización Avanzada

Para añadir nuevos efectos o comportamientos, puedes modificar los siguientes archivos:

- `js/core/Particula.js`: Para añadir nuevos comportamientos de partículas.
- `js/effects/VisualEffects.js`: Para añadir nuevos efectos visuales.
- `js/utils/Export.js`: Para añadir nuevos formatos de exportación.

## Licencia

Este proyecto está disponible como código abierto bajo la licencia MIT. 